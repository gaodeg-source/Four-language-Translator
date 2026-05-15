import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router';
import { Settings, Send, Copy, Maximize2, Menu, Plus, X, Star, Volume2, User } from 'lucide-react';
import { toast } from 'sonner';
import { t, langLabel } from '../../i18n';
import { apiUrl } from '../lib/apiBase';
import { loadChatByIdFromCloud, loadChatListFromCloud, saveChatToCloud } from '../lib/chatHistory';

interface Message {
  id: string;
  input: string;
  output: string;
  // Legacy field support
  chinese?: string;
  korean?: string;
  timestamp: number;
}

interface ChatData {
  id: string;
  name: string;
  sourceLang: string;
  targetLang: string;
  isPolite: boolean;
  vibes: string[];
  personaPrompt: string;
  toneMode: string;
  horrificMode?: string;
  background: string | null;
  voice?: string;
  messages: Message[];
}

function getChatRoute(chat: any) {
  const lang = chat.lang;
  if (lang === 'en') return `/chat-en/${chat.id}`;
  if (lang === 'jp') return `/chat-jp/${chat.id}`;
  return `/chat/${chat.id}`;
}

export function Chat() {
  const navigate = useNavigate();
  const { chatId } = useParams();
  const location = useLocation();
  const [chatData, setChatData] = useState<ChatData | null>(null);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatList, setChatList] = useState<any[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [collections, setCollections] = useState<{ input: string; output: string; id: string }[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setChatList(JSON.parse(localStorage.getItem('chatList') || '[]'));
      setCollections(JSON.parse(localStorage.getItem('collections') || '[]'));

      // Local-first: show immediately so settings changes (background etc.) appear right away
      const localStored = (chatId ? localStorage.getItem('chat_' + chatId) : null) || localStorage.getItem('currentChat');
      const localData = localStored ? JSON.parse(localStored) : null;
      if (localData) {
        setChatData(localData);
        setMessages(localData.messages || []);
      } else if (!chatId) {
        navigate('/setup');
        return;
      }

      // Cloud sync: update chat list
      const cloudList = await loadChatListFromCloud();
      if (cloudList && cloudList.length > 0) {
        const slimList = cloudList.map((chat) => ({
          id: chat.id, name: chat.name, lang: chat.lang,
          sourceLang: chat.sourceLang, targetLang: chat.targetLang,
        }));
        localStorage.setItem('chatList', JSON.stringify(slimList));
        setChatList(slimList);
      }

      // Cloud sync: merge cloud messages into local data, keep local settings fields
      if (chatId) {
        const cloudChat = await loadChatByIdFromCloud(chatId);
        if (cloudChat) {
          const base = localData ?? cloudChat;
          const merged = {
            ...cloudChat,
            background: base.background ?? cloudChat.background,
            isPolite: base.isPolite ?? cloudChat.isPolite,
            vibes: base.vibes ?? cloudChat.vibes,
            personaPrompt: base.personaPrompt ?? cloudChat.personaPrompt,
            voice: base.voice ?? cloudChat.voice,
            name: base.name ?? cloudChat.name,
          };
          setChatData(merged);
          setMessages(merged.messages || []);
          localStorage.setItem('currentChat', JSON.stringify(merged));
          localStorage.setItem('chat_' + chatId, JSON.stringify(merged));
        } else if (!localData) {
          navigate('/setup');
        }
      }
    };
    void loadData();
  }, [chatId, navigate, location.key]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Determine direction
  const sourceLang = chatData?.sourceLang || 'cn';
  const targetLang = chatData?.targetLang || 'kr';

  // Helper to get display text from a message (handles legacy and new format)
  const getInput = (m: Message) => m.input || m.chinese || '';
  const getOutput = (m: Message) => m.output || m.korean || '';

  const handleSend = async () => {
    if (!inputText.trim() || !chatData) return;
    setLoading(true);

    const tempMessage: Message = {
      id: 'loading',
      input: inputText,
      output: t('chat.translating'),
      timestamp: Date.now(),
    };
    setMessages([...messages, tempMessage]);

    try {
      const resp = await fetch(apiUrl('/api/translate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...chatData,
          message: inputText,
          sourceLang,
          targetLang,
        }),
      });
      const data = await resp.json();
      let output = '';
      if (data?.choices?.[0]?.message?.content) {
        output = data.choices[0].message.content;
      } else if (data?.error) {
        toast.error(t('chat.apiError') + data.error);
      } else {
        toast.error(t('chat.unexpectedResponse'));
      }

      const filteredMessages = messages.filter(m => m.id !== 'loading');
      const newMessage: Message = {
        id: Date.now().toString(),
        input: inputText,
        output,
        timestamp: Date.now(),
      };
      const updatedMessages = [...filteredMessages, newMessage];
      setMessages(updatedMessages);

      const updatedChat = { ...chatData, messages: updatedMessages };
      setChatData(updatedChat);
      setInputText('');
      localStorage.setItem('currentChat', JSON.stringify(updatedChat));
      localStorage.setItem('chat_' + updatedChat.id, JSON.stringify(updatedChat));
      void saveChatToCloud(updatedChat);
    } catch (error) {
      console.error('Translation failed:', error);
      toast.error(t('chat.translationFailed'));
      setMessages(messages.filter(m => m.id !== 'loading'));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(t('chat.copied'));
    }).catch(() => {
      toast.error(t('chat.copyFailed'));
    });
  };

  const handleExpand = (text: string) => {
    localStorage.setItem('flashcardText', text);
    navigate('/flashcard');
  };

  const handleSpeak = async (text: string, msgId: string) => {
    if (playingId === msgId) return;
    setPlayingId(msgId);
    try {
      const res = await fetch(apiUrl('/api/tts'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          targetLang: chatData?.targetLang || 'kr',
          isFormal: chatData?.isPolite !== false,
          isPolite: chatData?.isPolite,
          voice: chatData?.voice || '',
        }),
      });
      if (!res.ok) throw new Error('TTS failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => { setPlayingId(null); URL.revokeObjectURL(url); };
      audio.onerror = () => { setPlayingId(null); URL.revokeObjectURL(url); };
      await audio.play();
    } catch {
      setPlayingId(null);
      toast.error(t('chat.ttsError'));
    }
  };

  const isCollected = (msgId: string) => collections.some(c => c.id === msgId);

  const handleCollect = (msg: Message) => {
    const exists = collections.some(c => c.id === msg.id);
    let updated;
    if (exists) {
      updated = collections.filter(c => c.id !== msg.id);
      toast.success(t('chat.uncollected'));
    } else {
      updated = [...collections, { id: msg.id, input: getInput(msg), output: getOutput(msg) }];
      toast.success(t('chat.collected'));
    }
    setCollections(updated);
    localStorage.setItem('collections', JSON.stringify(updated));
  };

  const handleNewChat = () => {
    setSidebarOpen(false);
    navigate('/select-language');
  };

  if (!chatData) return null;

  const backgroundStyle = chatData.background
    ? { backgroundImage: `url(${chatData.background})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { backgroundColor: '#FFFFFF' };

  const srcCode = sourceLang.toUpperCase().slice(0, 2);
  const tgtCode = targetLang.toUpperCase().slice(0, 2);

  return (
    <div className="h-full flex flex-col relative overflow-hidden" style={{ fontFamily: "'Nunito', -apple-system, system-ui, sans-serif" }}>
      {/* Sidebar */}
      <div
        className="absolute top-0 left-0 h-full z-50 transition-transform duration-300"
        style={{ width: '288px', backgroundColor: '#FFFFFF', borderRight: '1px solid #EFE5F7', transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)', boxShadow: sidebarOpen ? '0 0 40px rgba(42,26,58,.12)' : 'none' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingTop: 'calc(env(safe-area-inset-top) + 16px)' }}>
          {/* wordmark row */}
          <div style={{ padding: '0 16px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => setSidebarOpen(false)} style={{ width: 36, height: 36, borderRadius: 10, border: 'none', background: '#FAF5FF', color: '#5A4A6A', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <X className="w-4 h-4" />
            </button>
            <div style={{ flex: 1, fontSize: 26, fontWeight: 800, color: '#2A1A3A', letterSpacing: '-0.03em', display: 'flex', alignItems: 'baseline', gap: 3 }}>
              beep
              <svg width="14" height="17" viewBox="0 0 20 24" style={{ display: 'inline-block', verticalAlign: 'baseline' }}>
                <rect x="2" y="3" width="3" height="9" rx="1.5" fill="#FFC93C" transform="rotate(-22 3.5 7.5)"/>
                <rect x="9" y="2" width="3" height="11" rx="1.5" fill="#FFC93C"/>
                <rect x="15" y="3" width="3" height="9" rx="1.5" fill="#FFC93C" transform="rotate(22 16.5 7.5)"/>
              </svg>
            </div>
          </div>

          {/* recent + new chat */}
          <div style={{ padding: '4px 16px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9A8AAA' }}>
              recent · {chatList.length}
            </span>
            <button onClick={handleNewChat} style={{
              background: '#A865E0', border: 'none', color: '#fff', cursor: 'pointer',
              fontFamily: "'Nunito',sans-serif", fontSize: 13, fontWeight: 700,
              padding: '8px 14px', borderRadius: 999,
              display: 'inline-flex', alignItems: 'center', gap: 6,
              boxShadow: '0 4px 12px rgba(168,101,224,.35)',
            }}>
              <Plus className="w-3.5 h-3.5" /> {t('chat.newChat')}
            </button>
          </div>

          {/* chat list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '4px 16px' }}>
            {chatList.length === 0 ? (
              <p style={{ fontSize: 14, color: '#9A8AAA', padding: '12px 0' }}>{t('chat.noChats')}</p>
            ) : (
              chatList.map((chat) => {
                const active = chat.id === chatData.id;
                return (
                  <button key={chat.id} onClick={() => { setSidebarOpen(false); navigate(getChatRoute(chat)); }} style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 12px',
                    borderRadius: 14, marginBottom: 4, border: active ? '1px solid #EFE5F7' : '1px solid transparent',
                    background: active ? '#FFFFFF' : 'transparent', cursor: 'pointer', textAlign: 'left',
                  }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                      background: active ? '#A865E0' : '#FAF5FF',
                      color: active ? '#fff' : '#2A1A3A',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18, fontWeight: 800,
                    }}>
                      {(chat.name || '?').slice(0, 1).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#2A1A3A' }}>{chat.name}</span>
                        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: '#9A8AAA', letterSpacing: '0.06em' }}>
                          {(chat.sourceLang || '').toUpperCase().slice(0,2)}→{(chat.targetLang || '').toUpperCase().slice(0,2)}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* bottom nav */}
          <div style={{ padding: '8px 16px', paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)', borderTop: '0.5px solid #EFE5F7' }}>
            {[
              { label: t('chat.collection'), icon: <Star className="w-4 h-4" />, onClick: () => { setSidebarOpen(false); navigate('/collections'); } },
              { label: t('profile.title'), icon: <User className="w-4 h-4" />, onClick: () => { setSidebarOpen(false); navigate('/profile'); } },
              { label: t('chat.systemSettings'), icon: <Settings className="w-4 h-4" />, onClick: () => { setSidebarOpen(false); navigate('/system-settings'); } },
            ].map((item, i) => (
              <button key={i} onClick={item.onClick} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', background: 'transparent', border: 'none', cursor: 'pointer',
                color: '#5A4A6A', fontSize: 14, fontWeight: 500, textAlign: 'left',
              }}>
                <span style={{ color: '#9A8AAA', display: 'inline-flex' }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {sidebarOpen && <div className="absolute inset-0 bg-black/20 z-40" onClick={() => setSidebarOpen(false)} />}

      {/* Header */}
      <div className="flex items-center justify-between px-4 z-30" style={{ backgroundColor: '#FFFFFF', borderBottom: '0.5px solid #EFE5F7', paddingTop: 'calc(env(safe-area-inset-top) + 1rem)', paddingBottom: '0.75rem' }}>
        <button onClick={() => setSidebarOpen(true)} className="p-2 transition-opacity hover:opacity-70">
          <Menu className="w-6 h-6" style={{ color: '#2A1A3A' }} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: '#2A1A3A' }}>{chatData.name}</span>
          <span style={{ fontSize: 11, color: '#9A8AAA', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em' }}>{srcCode}→{tgtCode}</span>
        </div>
        <button onClick={() => navigate(`/settings/${chatData.id}`)} className="p-2 transition-opacity hover:opacity-70">
          <Settings className="w-6 h-6" style={{ color: '#2A1A3A' }} />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6" style={backgroundStyle}>
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p style={{ fontSize: '14px', color: '#9A8AAA', textAlign: 'center' }}>
              {t('chat.emptyHint', { source: langLabel(sourceLang), target: langLabel(targetLang) })}
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-w-2xl mx-auto">
            {messages.map((message) => (
              <div key={message.id} className="space-y-3">
                {/* Source message — right */}
                <div className="flex justify-end">
                  <div className="max-w-[75%] px-5 py-3" style={{ backgroundColor: '#FAF5FF', borderRadius: '20px 20px 6px 20px' }}>
                    <p style={{ fontSize: '16px', color: '#2A1A3A', lineHeight: '1.5' }}>{getInput(message)}</p>
                  </div>
                </div>
                {/* Translation bubble — left */}
                <div className="flex justify-start">
                  <div className="max-w-[85%]">
                    <div className="px-5 py-4 mb-2" style={{ backgroundColor: '#FFFFFF', border: '1px solid #EFE5F7', borderRadius: '8px 22px 22px 22px', boxShadow: '0 6px 22px rgba(139,63,209,.08)' }}>
                      <p style={{ fontSize: '18px', fontWeight: 500, color: '#2A1A3A', lineHeight: '1.5', fontFamily: "'Nunito', sans-serif" }}>{getOutput(message)}</p>
                    </div>
                    <div className="flex items-center gap-1 pl-1">
                      <button onClick={() => handleCopy(getOutput(message))} style={{ height: 30, padding: '0 10px', borderRadius: 8, border: 'none', background: 'transparent', color: '#5A4A6A', cursor: 'pointer', display: 'flex', alignItems: 'center' }} aria-label="Copy">
                        <Copy className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleExpand(getOutput(message))} style={{ height: 30, padding: '0 10px', borderRadius: 8, border: 'none', background: 'transparent', color: '#5A4A6A', cursor: 'pointer', display: 'flex', alignItems: 'center' }} aria-label="Expand">
                        <Maximize2 className="w-4 h-4" />
                      </button>
                      {message.id !== 'loading' && (
                        <button
                          onClick={() => handleSpeak(getOutput(message), message.id)}
                          disabled={playingId === message.id}
                          style={{ height: 30, padding: '0 10px', borderRadius: 8, border: 'none', background: playingId === message.id ? '#8B3FD1' : 'transparent', color: playingId === message.id ? '#fff' : '#5A4A6A', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                          aria-label="Listen"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      )}
                      {message.id !== 'loading' && (
                        <button
                          onClick={() => handleCollect(message)}
                          style={{ height: 30, padding: '0 10px', borderRadius: 8, border: 'none', background: 'transparent', color: '#5A4A6A', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                          aria-label="Collect"
                        >
                          <Star className="w-4 h-4" style={{ color: isCollected(message.id) ? '#8B3FD1' : '#5A4A6A', fill: isCollected(message.id) ? '#8B3FD1' : 'none' }} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div style={{ padding: '10px 14px', backgroundColor: '#FFFFFF', borderTop: '0.5px solid #EFE5F7', paddingBottom: 'calc(env(safe-area-inset-bottom) + 22px)', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
        <div style={{ flex: 1, background: '#FFFFFF', borderRadius: 22, padding: '10px 14px', border: '1px solid #EFE5F7', display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="text"
            placeholder={`${t('chat.typeIn')} ${langLabel(sourceLang)}…`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: "'Nunito','Noto Sans KR',sans-serif", fontSize: 15, color: '#2A1A3A', minWidth: 0 }}
          />
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#C5BACF', flexShrink: 0 }}>{srcCode}</span>
        </div>
        <button
          onClick={handleSend}
          disabled={!inputText.trim()}
          style={{
            width: 44, height: 44, borderRadius: 22, border: 'none', flexShrink: 0,
            background: inputText.trim() ? '#A865E0' : '#F0E5FA',
            color: inputText.trim() ? '#fff' : '#C5BACF',
            boxShadow: inputText.trim() ? '0 4px 14px rgba(168,101,224,.45)' : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: inputText.trim() ? 'pointer' : 'not-allowed',
            transition: 'all .15s',
          }}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
