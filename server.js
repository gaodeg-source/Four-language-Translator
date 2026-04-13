const LANG_NAMES = {
  cn: 'Chinese',
  kr: 'Korean',
  en: 'English',
  jp: 'Japanese',
};

function buildUniversalPrompt(chatData, sourceLang, targetLang) {
  const srcName = LANG_NAMES[sourceLang] || sourceLang;
  const tgtName = LANG_NAMES[targetLang] || targetLang;

  let toneSection = '';

  // Korean-specific tone
  if (targetLang === 'kr') {
    toneSection = `
Tone & Style:
${chatData.isPolite === false ? '- Use Casual grammar (반말). Speak like a close friend. Avoid -요 or -습니다 endings.' : '- Use Polite/Formal grammar (존댓말). End sentences with -아요/어요 or -습니다.'}`;
  }
  // English-specific tone
  else if (targetLang === 'en') {
    toneSection = `
Tone & Style:
${chatData.isFormal ? '- Use formal English. Write in a professional, polished tone suitable for business or academic contexts.' : '- Use informal/casual English. Write naturally as if texting a friend.'}`;
  }
  // Japanese-specific tone
  else if (targetLang === 'jp') {
    toneSection = `
Tone & Style:
${chatData.isPolite === false ? '- Use casual Japanese (タメ口). Speak like a close friend. Avoid です/ます endings.' : '- Use polite Japanese (丁寧語/敬語). End sentences with です/ます.'}`;
  }
  // Chinese-specific tone
  else if (targetLang === 'cn') {
    toneSection = `
Tone & Style:
${chatData.isFormal ? '- Use formal Chinese (书面语). Write in a professional, polished tone.' : '- Use casual Chinese (口语). Write naturally as if chatting with a friend.'}`;
  }

  // K-pop slang section for Korean-related translations
  let kpopSection = '';
  if (targetLang === 'kr' && sourceLang === 'cn') {
    kpopSection = `
K-POP SLANG (Kong-er): ONLY when you detect Chinese phonetic slang (e.g., 怒那, 欧巴, 切拜), ignore their literal Chinese meaning and map their Pinyin sound to the correct standard Korean vocabulary (e.g., 누나, 오빠, 제발).
Before finalizing your translation, check if the original Chinese text contains any Kong-er slang. If it does, ensure that the corresponding Korean slang is included in the final output.
FANDOM SEMANTIC SLANG: Accurately translate Chinese fandom-specific terms to their true Korean fandom equivalents.`;
  }

  // Phonetic slang section for Chinese → English translations
  let phoneticSlangSection = '';
  if (sourceLang === 'cn' && targetLang === 'en') {
    phoneticSlangSection = `
CHINESE PHONETIC SLANG: When you detect Chinese text that phonetically imitates English words or phrases (e.g., 厚礼谢特 = holy shit, 三克油 = thank you, 歪瑞古德 = very good, 拜拜 = bye bye, 奥利给 = slang exclamation), ignore their literal Chinese character meaning and map their pronunciation to the correct original English word/phrase.
CHINESE INTERNET SLANG: Translate Chinese internet slang and colloquialisms to their natural English equivalents (e.g., 666 = awesome/sick, 牛逼/NB = badass/awesome, 卧槽 = WTF/holy crap, 绝绝子 = absolutely amazing, 破防了 = I can't take it anymore).
Before finalizing your translation, check if the original Chinese text contains any phonetic or internet slang. If it does, ensure the natural English equivalent is used in the final output.`;
  }

  // Phonetic slang section for Chinese → Japanese translations
  let jpSlangSection = '';
  if (sourceLang === 'cn' && targetLang === 'jp') {
    jpSlangSection = `
CHINESE PHONETIC SLANG: When you detect Chinese text that phonetically imitates foreign words (e.g., 厚礼谢特 = holy shit → ホーリーシット or くそっ, 三克油 = thank you → ありがとう, 欧巴 = Korean oppa → オッパ), ignore their literal Chinese character meaning and map to the appropriate Japanese expression.
CHINESE INTERNET SLANG: Translate Chinese internet slang and colloquialisms to their natural Japanese equivalents (e.g., 666 = すごい, 卧槽 = うわっ/マジかよ, 牛逼 = やばい/すげえ, 绝绝子 = 最高すぎる, 破防了 = もう無理/耐えられない).
Before finalizing your translation, check if the original Chinese text contains any phonetic or internet slang. If it does, ensure the natural Japanese equivalent is used in the final output.`;
  }

  let prompt = `
You are a Professional ${srcName}-to-${tgtName} Translator.

Translation Rules (CRITICAL):
1. Translate the true semantic meaning of the ${srcName} text into natural, fluent ${tgtName}.
2. Preserve the original tone, nuance, and intent of the message.
3. Handle idioms, colloquialisms, and internet slang by finding their closest ${tgtName} equivalents.
4. Maintain cultural context — adapt culturally specific references where needed.
5. If user customized the tone, follow the tone instructions strictly.
${kpopSection}
${phoneticSlangSection}
${jpSlangSection}

Formatting Rules:
- Do NOT output emojis or text emoticons unless the user's custom persona explicitly requests them.
- Only standard punctuation is allowed.
${toneSection}
${Array.isArray(chatData.vibes) && chatData.vibes.length > 0 ? '\n- Apply the following vibes: ' + chatData.vibes.join(', ') + '.' : ''}
${chatData.personaPrompt ? '\nPERSONA OVERRIDE: The following custom persona instruction overrides all other tone, vocabulary, and emotion settings:\n"' + chatData.personaPrompt + '"' : ''}

Output Rule:
- Output ONLY the final ${tgtName} text. Do not include romanization, original text, or explanations.
`;
  return prompt.trim();
}

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { getDb } = require('./db');
dotenv.config();

console.log('OPENAI_API_KEY loaded:', process.env.OPENAI_API_KEY ? '[OK]' : '[MISSING]');
const app = express();
app.use(cors());
app.use(express.json());

let userIndexEnsured = false;
let chatIndexEnsured = false;

function sanitizeUser(user) {
  if (!user) return null;
  return {
    id: String(user._id),
    googleSub: user.googleSub,
    email: user.email,
    username: user.username || '',
    name: user.name,
    picture: user.picture,
    locale: user.locale,
    emailVerified: user.emailVerified,
    provider: user.provider,
    hasPassword: Boolean(user.passwordHash),
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
  };
}

async function ensureUserIndexes(users) {
  if (userIndexEnsured) return;
  try {
    await users.createIndex({ googleSub: 1 }, { unique: true, sparse: true });
    await users.createIndex({ emailLower: 1 }, { unique: true, sparse: true });
  } catch (error) {
    // If DB role does not allow index creation, keep auth usable.
    console.warn('User index ensure skipped:', error?.message || error);
  }
  userIndexEnsured = true;
}

async function ensureChatIndexes(chats) {
  if (chatIndexEnsured) return;
  try {
    await chats.createIndex({ userId: 1, chatId: 1 }, { unique: true });
    await chats.createIndex({ userId: 1, updatedAt: -1 });
  } catch (error) {
    console.warn('Chat index ensure skipped:', error?.message || error);
  }
  chatIndexEnsured = true;
}

// MongoDB health check
app.get(['/api/db/ping', '/db/ping'], async (_req, res) => {
  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    res.json({ ok: true, db: db.databaseName });
  } catch (error) {
    console.error('DB ping failed:', error);
    res.status(500).json({ ok: false, error: 'DB ping failed' });
  }
});

// Save/update Google user after OAuth callback
app.post(['/api/auth/google', '/auth/google'], async (req, res) => {
  const { profile } = req.body || {};
  if (!profile?.sub) {
    return res.status(400).json({ error: 'Missing Google profile sub' });
  }

  try {
    const db = await getDb();
    const users = db.collection('users');
    await ensureUserIndexes(users);

    const now = new Date();
    await users.updateOne(
      { googleSub: profile.sub },
      {
        $set: {
          provider: 'google',
          googleSub: profile.sub,
          email: (profile.email || '').toLowerCase(),
          emailLower: (profile.email || '').toLowerCase(),
          username: profile.name || '',
          name: profile.name || '',
          picture: profile.picture || '',
          locale: profile.locale || '',
          emailVerified: Boolean(profile.email_verified),
          lastLoginAt: now,
        },
        $setOnInsert: {
          createdAt: now,
        },
      },
      { upsert: true }
    );

    const savedUser = await users.findOne({ googleSub: profile.sub });
    res.json({ ok: true, user: sanitizeUser(savedUser) });
  } catch (error) {
    console.error('Google auth sync failed:', error);
    res.status(500).json({ ok: false, error: 'Failed to sync user' });
  }
});

function queryUserById(userId) {
  if (ObjectId.isValid(userId)) {
    return { _id: new ObjectId(userId) };
  }
  return {
    $or: [
      { _id: userId },
      { googleSub: userId },
    ],
  };
}

app.get(['/api/auth/profile', '/auth/profile'], async (req, res) => {
  const userId = String(req.query.userId || '').trim();
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  try {
    const db = await getDb();
    const users = db.collection('users');
    const user = await users.findOne(queryUserById(userId));
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ ok: true, user: sanitizeUser(user) });
  } catch (error) {
    console.error('Load profile failed:', error);
    res.status(500).json({ error: 'Load profile failed' });
  }
});

app.post(['/api/auth/profile', '/auth/profile'], async (req, res) => {
  const userId = String(req.body?.userId || '').trim();
  const username = String(req.body?.username || '').trim();
  if (!userId || !username) {
    return res.status(400).json({ error: 'Missing userId or username' });
  }
  if (username.length < 2 || username.length > 40) {
    return res.status(400).json({ error: 'Username must be 2-40 characters' });
  }

  try {
    const db = await getDb();
    const users = db.collection('users');
    const query = queryUserById(userId);
    const existing = await users.findOne(query);
    if (!existing) return res.status(404).json({ error: 'User not found' });

    const setFields = { username };
    if (existing.provider === 'google') {
      setFields.name = username;
    }
    await users.updateOne(query, { $set: setFields });
    const updated = await users.findOne(query);
    res.json({ ok: true, user: sanitizeUser(updated) });
  } catch (error) {
    console.error('Update profile failed:', error);
    res.status(500).json({ error: 'Update profile failed' });
  }
});

app.post(['/api/auth/register', '/auth/register'], async (req, res) => {
  const { email, username, password } = req.body || {};
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const normalizedUsername = String(username || '').trim();
  const rawPassword = String(password || '');

  if (!normalizedEmail || !normalizedUsername || !rawPassword) {
    return res.status(400).json({ error: 'Email, username, and password are required' });
  }
  if (rawPassword.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  try {
    const db = await getDb();
    const users = db.collection('users');
    await ensureUserIndexes(users);

    const now = new Date();
    const passwordHash = await bcrypt.hash(rawPassword, 12);
    await users.updateOne(
      {
        $or: [
          { emailLower: normalizedEmail },
          { email: normalizedEmail },
        ],
      },
      {
        $set: {
          email: normalizedEmail,
          emailLower: normalizedEmail,
          username: normalizedUsername,
          passwordHash,
          provider: 'password',
          emailVerified: true,
          lastLoginAt: now,
        },
        $setOnInsert: {
          createdAt: now,
        },
      },
      { upsert: true }
    );

    const savedUser = await users.findOne({ emailLower: normalizedEmail });
    res.json({ ok: true, user: sanitizeUser(savedUser) });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ error: 'Email already exists' });
    }
    console.error('Register failed:', error);
    res.status(500).json({ error: 'Register failed' });
  }
});

app.post(['/api/auth/login', '/auth/login'], async (req, res) => {
  const { email, password } = req.body || {};
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const rawPassword = String(password || '');

  if (!normalizedEmail || !rawPassword) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const db = await getDb();
    const users = db.collection('users');
    const user = await users.findOne({
      $or: [{ emailLower: normalizedEmail }, { email: normalizedEmail }],
    });
    if (!user?.passwordHash) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(rawPassword, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const now = new Date();
    await users.updateOne({ _id: user._id }, { $set: { lastLoginAt: now } });
    const savedUser = await users.findOne({ _id: user._id });
    res.json({ ok: true, user: sanitizeUser(savedUser) });
  } catch (error) {
    console.error('Login failed:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post(['/api/auth/forgot-password', '/auth/forgot-password'], async (req, res) => {
  return res.status(503).json({ error: 'Forgot password is temporarily disabled' });

  const { email } = req.body || {};
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!normalizedEmail) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const db = await getDb();
    const users = db.collection('users');
    const user = await users.findOne({
      $or: [{ emailLower: normalizedEmail }, { email: normalizedEmail }],
    });

    // Always return OK to avoid email enumeration.
    if (!user?.passwordHash) {
      return res.json({ ok: true });
    }

    const token = crypto.randomBytes(24).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await users.updateOne(
      { _id: user._id },
      { $set: { resetTokenHash: tokenHash, resetTokenExpiresAt: expiresAt } }
    );

    const response = { ok: true };
    if (process.env.NODE_ENV !== 'production') {
      response.devResetToken = token;
    }
    res.json(response);
  } catch (error) {
    console.error('Forgot password failed:', error);
    res.status(500).json({ error: 'Forgot password failed' });
  }
});

app.post(['/api/auth/reset-password', '/auth/reset-password'], async (req, res) => {
  return res.status(503).json({ error: 'Password reset is temporarily disabled' });

  const { email, token, newPassword } = req.body || {};
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const rawToken = String(token || '').trim();
  const rawPassword = String(newPassword || '');

  if (!normalizedEmail || !rawToken || !rawPassword) {
    return res.status(400).json({ error: 'Email, token, and new password are required' });
  }
  if (rawPassword.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  try {
    const db = await getDb();
    const users = db.collection('users');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const user = await users.findOne({
      $or: [{ emailLower: normalizedEmail }, { email: normalizedEmail }],
      resetTokenHash: tokenHash,
      resetTokenExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const passwordHash = await bcrypt.hash(rawPassword, 12);
    await users.updateOne(
      { _id: user._id },
      {
        $set: {
          passwordHash,
          provider: user.provider || 'password',
          lastLoginAt: new Date(),
        },
        $unset: {
          resetTokenHash: '',
          resetTokenExpiresAt: '',
        },
      }
    );

    res.json({ ok: true });
  } catch (error) {
    console.error('Reset password failed:', error);
    res.status(500).json({ error: 'Reset password failed' });
  }
});

app.get(['/api/chat-history', '/chat-history'], async (req, res) => {
  const userId = String(req.query.userId || '').trim();
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  try {
    const db = await getDb();
    const chats = db.collection('chats');
    await ensureChatIndexes(chats);
    const rows = await chats
      .find({ userId })
      .project({ _id: 0, userId: 0 })
      .sort({ updatedAt: -1 })
      .toArray();
    res.json({ ok: true, chats: rows });
  } catch (error) {
    console.error('Load chat history failed:', error);
    res.status(500).json({ error: 'Load chat history failed' });
  }
});

app.get(['/api/chat-history/:chatId', '/chat-history/:chatId'], async (req, res) => {
  const userId = String(req.query.userId || '').trim();
  const chatId = String(req.params.chatId || '').trim();
  if (!userId || !chatId) return res.status(400).json({ error: 'Missing userId or chatId' });

  try {
    const db = await getDb();
    const chats = db.collection('chats');
    const chat = await chats.findOne({ userId, chatId }, { projection: { _id: 0, userId: 0 } });
    if (!chat) return res.status(404).json({ error: 'Chat not found' });
    res.json({ ok: true, chat });
  } catch (error) {
    console.error('Load chat failed:', error);
    res.status(500).json({ error: 'Load chat failed' });
  }
});

app.post(['/api/chat-history', '/chat-history'], async (req, res) => {
  const { userId, chat } = req.body || {};
  const normalizedUserId = String(userId || '').trim();
  const normalizedChatId = String(chat?.id || '').trim();
  if (!normalizedUserId || !normalizedChatId) {
    return res.status(400).json({ error: 'Missing userId or chat.id' });
  }

  try {
    const db = await getDb();
    const chats = db.collection('chats');
    await ensureChatIndexes(chats);

    const now = new Date();
    const doc = {
      userId: normalizedUserId,
      chatId: normalizedChatId,
      id: normalizedChatId,
      name: chat.name || '',
      lang: chat.lang || '',
      sourceLang: chat.sourceLang || '',
      targetLang: chat.targetLang || '',
      isPolite: typeof chat.isPolite === 'boolean' ? chat.isPolite : undefined,
      isFormal: typeof chat.isFormal === 'boolean' ? chat.isFormal : undefined,
      vibes: Array.isArray(chat.vibes) ? chat.vibes : [],
      personaPrompt: chat.personaPrompt || '',
      toneMode: chat.toneMode || '',
      background: chat.background || null,
      voice: chat.voice || '',
      messages: Array.isArray(chat.messages) ? chat.messages : [],
      updatedAt: now,
    };

    await chats.updateOne(
      { userId: normalizedUserId, chatId: normalizedChatId },
      { $set: doc, $setOnInsert: { createdAt: now } },
      { upsert: true }
    );
    res.json({ ok: true });
  } catch (error) {
    console.error('Save chat history failed:', error);
    res.status(500).json({ error: 'Save chat history failed' });
  }
});

// Universal translate endpoint
app.post(['/api/translate', '/translate'], async (req, res) => {
  const { message, sourceLang, targetLang } = req.body;
  const srcName = LANG_NAMES[sourceLang] || sourceLang;
  const tgtName = LANG_NAMES[targetLang] || targetLang;
  try {
    const chatData = req.body;
    const systemPrompt = buildUniversalPrompt(chatData, sourceLang, targetLang);
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Translate the following ${srcName} to ${tgtName}:\n${message}` }
        ],
      }),
    });
    const data = await response.json();
    console.log(`OpenAI API response (${sourceLang}→${targetLang}):`, data);
    res.json(data);
  } catch (error) {
    console.error('OpenAI request failed:', error);
    res.status(500).json({ error: 'OpenAI request failed' });
  }
});

// Legacy endpoints (redirect to universal)
app.post(['/api/chat', '/chat'], (req, res) => {
  req.body.sourceLang = req.body.sourceLang || 'cn';
  req.body.targetLang = req.body.targetLang || 'kr';
  app.handle(Object.assign(req, { url: '/api/translate' }), res);
});

app.post(['/api/chat-en', '/chat-en'], (req, res) => {
  req.body.sourceLang = req.body.sourceLang || 'cn';
  req.body.targetLang = req.body.targetLang || 'en';
  app.handle(Object.assign(req, { url: '/api/translate' }), res);
});

// TTS endpoint
app.post(['/api/tts', '/tts'], async (req, res) => {
  const { text, targetLang, isFormal, isPolite, voice: userVoice } = req.body;
  if (!text) return res.status(400).json({ error: 'Missing text' });

  // Use user-selected voice, or auto-pick based on tone
  let voice = userVoice || '';
  if (!voice) {
    if (targetLang === 'kr') {
      voice = isPolite === false ? 'nova' : 'onyx';
    } else if (targetLang === 'en') {
      voice = isFormal ? 'onyx' : 'nova';
    } else if (targetLang === 'jp') {
      voice = isPolite === false ? 'nova' : 'onyx';
    } else if (targetLang === 'cn') {
      voice = isFormal ? 'onyx' : 'nova';
    } else {
      voice = 'nova';
    }
  }

  try {
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: voice,
        response_format: 'mp3',
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('TTS API error:', err);
      return res.status(response.status).json({ error: 'TTS failed' });
    }

    res.set({
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'no-cache',
    });
    const arrayBuffer = await response.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (error) {
    console.error('TTS request failed:', error);
    res.status(500).json({ error: 'TTS request failed' });
  }
});

if (require.main === module) {
  const port = Number(process.env.PORT) || 3001;
  app.listen(port, () => {
    console.log(`API server listening on port ${port}`);
  });
}

module.exports = app;