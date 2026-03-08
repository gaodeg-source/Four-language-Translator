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
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
dotenv.config();

console.log('OPENAI_API_KEY loaded:', process.env.OPENAI_API_KEY ? '[OK]' : '[MISSING]');
const app = express();
app.use(cors());
app.use(express.json());

// Universal translate endpoint
app.post('/api/translate', async (req, res) => {
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
app.post('/api/chat', (req, res) => {
  req.body.sourceLang = req.body.sourceLang || 'cn';
  req.body.targetLang = req.body.targetLang || 'kr';
  app.handle(Object.assign(req, { url: '/api/translate' }), res);
});

app.post('/api/chat-en', (req, res) => {
  req.body.sourceLang = req.body.sourceLang || 'cn';
  req.body.targetLang = req.body.targetLang || 'en';
  app.handle(Object.assign(req, { url: '/api/translate' }), res);
});

// TTS endpoint
app.post('/api/tts', async (req, res) => {
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

app.listen(3001, () => {
  console.log('API server listening on port 3001');
});