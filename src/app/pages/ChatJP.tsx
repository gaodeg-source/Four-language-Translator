import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Settings, Send, Copy, Maximize2, Menu, Plus, X, Star, Volume2 } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { t, langLabel } from '../../i18n';
import { apiUrl } from '../lib/apiBase';
import { loadChatByIdFromCloud, loadChatListFromCloud, saveChatToCloud } from '../lib/chatHistory';

interface Message {
  id: string;
  input: string;
  output: string;
  timestamp: number;
}

interface ChatData {
  id: string;
  name: string;
  lang: string;
  sourceLang: string;
  targetLang: string;
  isPolite: boolean;
  vibes: string[];
  personaPrompt: string;
  toneMode: string;
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

export function ChatJP() {
  const navigate = useNavigate();
  const { chatId } = useParams();
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
      const allChats = JSON.parse(localStorage.getItem('chatList') || '[]');
      setChatList(allChats);
      const savedCollections = JSON.parse(localStorage.getItem('collections') || '[]');
      setCollections(savedCollections);

      const cloudList = await loadChatListFromCloud();
      if (cloudList && cloudList.length > 0) {
        const slimList = cloudList.map((chat) => ({
          id: chat.id,
          name: chat.name,
          lang: chat.lang,
          sourceLang: chat.sourceLang,
          targetLang: chat.targetLang,
        }));
        localStorage.setItem('chatList', JSON.stringify(slimList));
        setChatList(slimList);
      }

      if (chatId) {
        const cloudChat = await loadChatByIdFromCloud(chatId);
        if (cloudChat) {
          setChatData(cloudChat);
          setMessages(cloudChat.messages || []);
          localStorage.setItem('currentChatJP', JSON.stringify(cloudChat));
          localStorage.setItem('chat_' + chatId, JSON.stringify(cloudChat));
          return;
        }
      }

      const byId = chatId ? localStorage.getItem('chat_' + chatId) : null;
      const stored = byId || localStorage.getItem('currentChatJP');
      if (stored) {
        const data = JSON.parse(stored);
        setChatData(data);
        setMessages(data.messages || []);
        localStorage.setItem('currentChatJP', stored);
      } else {
        navigate('/setup-jp');
      }
    };
    void loadData();
    // Re-read when navigating back (e.g. from Settings)
    const onPopState = () => { void loadData(); };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [chatId, navigate]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
          sourceLang: chatData.sourceLang,
          targetLang: chatData.targetLang,
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
      localStorage.setItem('currentChatJP', JSON.stringify(updatedChat));
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
          targetLang: chatData?.targetLang || 'jp',
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
      updated = [...collections, { id: msg.id, input: msg.input, output: msg.output }];
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

  const sourceLang = chatData.sourceLang || 'cn';
  const targetLang = chatData.targetLang || 'jp';

  const backgroundStyle = chatData.background
    ? { backgroundImage: `url(${chatData.background})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { backgroundColor: '#FFFFFF' };

  return (
    <div className="h-screen flex flex-col relative overflow-hidden">
      {/* Sidebar */}
      <div
        className="absolute top-0 left-0 h-full z-50 transition-transform duration-300 shadow-2xl"
        style={{ width: '280px', backgroundColor: '#FFFBF5', transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)' }}
      >
        <div className="flex flex-col h-full p-6">
          <button onClick={() => setSidebarOpen(false)} className="self-end mb-6 p-2 transition-opacity hover:opacity-70">
            <X className="w-6 h-6" style={{ color: '#6B5B95' }} />
          </button>
          <div className="flex-1 overflow-y-auto">
            <h3 className="mb-4" style={{ fontSize: '16px', fontWeight: 600, color: '#6B5B95' }}>{t('chat.savedChats')}</h3>
            <div className="space-y-2">
              {chatList.length === 0 ? (
                <p style={{ fontSize: '14px', color: '#9B8FA6' }}>{t('chat.noChats')}</p>
              ) : (
                chatList.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => { setSidebarOpen(false); navigate(getChatRoute(chat)); }}
                    className="w-full text-left px-4 py-3 transition-colors hover:bg-white/50"
                    style={{ backgroundColor: chat.id === chatData.id ? '#E6E6FA' : 'transparent', borderRadius: '16px', fontSize: '14px', color: '#6B5B95' }}
                  >
                    {chat.name}
                    <span style={{ fontSize: '11px', color: '#9B8FA6', marginLeft: '6px' }}>
                      {(langLabel(chat.sourceLang) || '').slice(0,2)}→{(langLabel(chat.targetLang) || '').slice(0,2)}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
          <div className="space-y-3 pt-4 border-t" style={{ borderColor: '#E6E6FA' }}>
            <Button onClick={handleNewChat} className="w-full h-12 border-0 shadow-md" style={{ backgroundColor: '#B8A9D4', color: '#FFFFFF', borderRadius: '16px', fontSize: '14px', fontWeight: 600 }}>
              <Plus className="w-4 h-4 mr-2" /> {t('chat.newChat')}
            </Button>
            <button onClick={() => { setSidebarOpen(false); navigate('/collections'); }} className="w-full text-center py-2 transition-opacity hover:opacity-70" style={{ fontSize: '14px', color: '#6B5B95' }}>
              <Star className="w-4 h-4 inline mr-2" /> {t('chat.collection')}
            </button>
            <div style={{ borderTop: '1px solid #E6E6FA', margin: '4px 0' }} />
            <button onClick={() => { setSidebarOpen(false); navigate('/system-settings'); }} className="w-full text-center py-2 transition-opacity hover:opacity-70" style={{ fontSize: '14px', color: '#6B5B95' }}>
              <Settings className="w-4 h-4 inline mr-2" /> {t('chat.systemSettings')}
            </button>
          </div>
        </div>
      </div>

      {sidebarOpen && <div className="absolute inset-0 bg-black/20 z-40" onClick={() => setSidebarOpen(false)} />}

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 shadow-sm z-30" style={{ backgroundColor: '#FFFBF5' }}>
        <button onClick={() => setSidebarOpen(true)} className="p-2 transition-opacity hover:opacity-70">
          <Menu className="w-6 h-6" style={{ color: '#6B5B95' }} />
        </button>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#6B5B95' }}>
          {chatData.name}
          <span style={{ fontSize: '12px', color: '#9B8FA6', marginLeft: '8px' }}>
            {langLabel(sourceLang)}→{langLabel(targetLang)}
          </span>
        </h2>
        <button onClick={() => navigate(`/settings-jp/${chatData.id}`)} className="p-2 transition-opacity hover:opacity-70">
          <Settings className="w-6 h-6" style={{ color: '#6B5B95' }} />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6" style={backgroundStyle}>
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p style={{ fontSize: '14px', color: '#9B8FA6', textAlign: 'center' }}>
              {t('chat.emptyHint', { source: langLabel(sourceLang), target: langLabel(targetLang) })}
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-w-2xl mx-auto">
            {messages.map((message) => (
              <div key={message.id} className="space-y-3">
                <div className="flex justify-end">
                  <div className="max-w-[75%] px-5 py-3 shadow-md" style={{ backgroundColor: '#E8E8E8', borderRadius: '24px 24px 4px 24px' }}>
                    <p style={{ fontSize: '16px', color: '#4A4A4A', lineHeight: '1.5' }}>{message.input}</p>
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="max-w-[85%]">
                    <div className="px-5 py-4 shadow-md mb-2" style={{ backgroundColor: '#D4E8C4', borderRadius: '24px 24px 24px 4px' }}>
                      <p style={{ fontSize: '18px', fontWeight: 500, color: '#4A4A4A', lineHeight: '1.5' }}>{message.output}</p>
                    </div>
                    <div className="flex items-center gap-2 pl-2">
                      <button onClick={() => handleCopy(message.output)} className="p-2 transition-opacity hover:opacity-60" aria-label="Copy">
                        <Copy className="w-4 h-4" style={{ color: '#6B5B95' }} />
                      </button>
                      <button onClick={() => handleExpand(message.output)} className="p-2 transition-opacity hover:opacity-60" aria-label="Expand">
                        <Maximize2 className="w-4 h-4" style={{ color: '#6B5B95' }} />
                      </button>
                      {message.id !== 'loading' && (
                        <button onClick={() => handleSpeak(message.output, message.id)} className="p-2 transition-opacity hover:opacity-60" aria-label="Listen" disabled={playingId === message.id}>
                          <Volume2 className="w-4 h-4" style={{ color: playingId === message.id ? '#E8A838' : '#6B5B95' }} />
                        </button>
                      )}
                      {message.id !== 'loading' && (
                        <button onClick={() => handleCollect(message)} className="p-2 transition-opacity hover:opacity-60" aria-label="Collect">
                          <Star className="w-4 h-4" style={{ color: isCollected(message.id) ? '#E8A838' : '#6B5B95', fill: isCollected(message.id) ? '#E8A838' : 'none' }} />
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
      <div className="px-6 py-4 shadow-lg" style={{ backgroundColor: '#FFFBF5' }}>
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <Input
            type="text"
            placeholder={`${t('chat.typeIn')} ${langLabel(sourceLang)}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 h-12 px-5 border-0 shadow-md"
            style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', fontSize: '16px', color: '#6B5B95' }}
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="w-12 h-12 flex items-center justify-center shadow-md transition-opacity"
            style={{ backgroundColor: !inputText.trim() ? '#D8D0E3' : '#B8A9D4', borderRadius: '24px', opacity: !inputText.trim() ? 0.5 : 1, cursor: !inputText.trim() ? 'not-allowed' : 'pointer' }}
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
