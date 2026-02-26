import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Settings, Send, Copy, Maximize2, Menu, Plus, LogOut, X } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

const LANG_LABELS: Record<string, string> = { cn: '中文', kr: '한국어', en: 'English', jp: '日本語' };

interface Message {
  id: string;
  input: string;
  output: string;
  chinese?: string;
  english?: string;
  timestamp: number;
}

interface ChatData {
  id: string;
  name: string;
  sourceLang: string;
  targetLang: string;
  isFormal: boolean;
  vibes: string[];
  personaPrompt: string;
  toneMode: string;
  background: string | null;
  messages: Message[];
}

function getChatRoute(chat: any) {
  const lang = chat.lang;
  if (lang === 'en') return `/chat-en/${chat.id}`;
  if (lang === 'jp') return `/chat-jp/${chat.id}`;
  return `/chat/${chat.id}`;
}

export function ChatEN() {
  const navigate = useNavigate();
  const { chatId } = useParams();
  const [chatData, setChatData] = useState<ChatData | null>(null);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatList, setChatList] = useState<any[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const byId = chatId ? localStorage.getItem('chat_' + chatId) : null;
    const stored = byId || localStorage.getItem('currentChatEN');
    if (stored) {
      const data = JSON.parse(stored);
      setChatData(data);
      setMessages(data.messages || []);
      localStorage.setItem('currentChatEN', stored);
    } else {
      navigate('/setup-en');
    }
    const allChats = JSON.parse(localStorage.getItem('chatList') || '[]');
    setChatList(allChats);
  }, [chatId, navigate]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sourceLang = chatData?.sourceLang || 'cn';
  const targetLang = chatData?.targetLang || 'en';

  const getInput = (m: Message) => m.input || m.chinese || '';
  const getOutput = (m: Message) => m.output || m.english || '';

  const handleSend = async () => {
    if (!inputText.trim() || !chatData) return;
    setLoading(true);

    const tempMessage: Message = {
      id: 'loading',
      input: inputText,
      output: 'Translating...',
      timestamp: Date.now(),
    };
    setMessages([...messages, tempMessage]);

    try {
      const resp = await fetch('http://localhost:3001/api/translate', {
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
        toast.error('API Error: ' + data.error);
      } else {
        toast.error('Unexpected API response');
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
      localStorage.setItem('currentChatEN', JSON.stringify(updatedChat));
      localStorage.setItem('chat_' + updatedChat.id, JSON.stringify(updatedChat));
    } catch (error) {
      console.error('Translation failed:', error);
      toast.error('Translation failed. Is the backend server running?');
      setMessages(messages.filter(m => m.id !== 'loading'));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy');
    });
  };

  const handleExpand = (text: string) => {
    localStorage.setItem('flashcardText', text);
    navigate('/flashcard');
  };

  const handleNewChat = () => {
    setSidebarOpen(false);
    navigate('/select-language');
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  if (!chatData) return null;

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
            <h3 className="mb-4" style={{ fontSize: '16px', fontWeight: 600, color: '#6B5B95' }}>Saved Chats</h3>
            <div className="space-y-2">
              {chatList.length === 0 ? (
                <p style={{ fontSize: '14px', color: '#9B8FA6' }}>No saved chats yet</p>
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
                      {(LANG_LABELS[chat.sourceLang] || chat.lang?.toUpperCase() || 'EN').slice(0,2)}→{(LANG_LABELS[chat.targetLang] || '').slice(0,2) || 'CN'}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
          <div className="space-y-3 pt-4 border-t" style={{ borderColor: '#E6E6FA' }}>
            <Button onClick={handleNewChat} className="w-full h-12 border-0 shadow-md" style={{ backgroundColor: '#B8A9D4', color: '#FFFFFF', borderRadius: '16px', fontSize: '14px', fontWeight: 600 }}>
              <Plus className="w-4 h-4 mr-2" /> New Chat
            </Button>
            <button onClick={handleLogout} className="w-full text-center py-2 transition-opacity hover:opacity-70" style={{ fontSize: '14px', color: '#6B5B95' }}>
              <LogOut className="w-4 h-4 inline mr-2" /> Log Out
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
            {LANG_LABELS[sourceLang]}→{LANG_LABELS[targetLang]}
          </span>
        </h2>
        <button onClick={() => navigate(`/settings-en/${chatData.id}`)} className="p-2 transition-opacity hover:opacity-70">
          <Settings className="w-6 h-6" style={{ color: '#6B5B95' }} />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6" style={backgroundStyle}>
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p style={{ fontSize: '14px', color: '#9B8FA6', textAlign: 'center' }}>
              Type a message in {LANG_LABELS[sourceLang]} to start translating to {LANG_LABELS[targetLang]}...
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-w-2xl mx-auto">
            {messages.map((message) => (
              <div key={message.id} className="space-y-3">
                <div className="flex justify-end">
                  <div className="max-w-[75%] px-5 py-3 shadow-md" style={{ backgroundColor: '#E8E8E8', borderRadius: '24px 24px 4px 24px' }}>
                    <p style={{ fontSize: '16px', color: '#4A4A4A', lineHeight: '1.5' }}>{getInput(message)}</p>
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="max-w-[85%]">
                    <div className="px-5 py-4 shadow-md mb-2" style={{ backgroundColor: '#C4D4E8', borderRadius: '24px 24px 24px 4px' }}>
                      <p style={{ fontSize: '18px', fontWeight: 500, color: '#4A4A4A', lineHeight: '1.5' }}>{getOutput(message)}</p>
                    </div>
                    <div className="flex items-center gap-2 pl-2">
                      <button onClick={() => handleCopy(getOutput(message))} className="p-2 transition-opacity hover:opacity-60" aria-label="Copy">
                        <Copy className="w-4 h-4" style={{ color: '#6B5B95' }} />
                      </button>
                      <button onClick={() => handleExpand(getOutput(message))} className="p-2 transition-opacity hover:opacity-60" aria-label="Expand">
                        <Maximize2 className="w-4 h-4" style={{ color: '#6B5B95' }} />
                      </button>
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
            placeholder={`Type in ${LANG_LABELS[sourceLang]}...`}
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
