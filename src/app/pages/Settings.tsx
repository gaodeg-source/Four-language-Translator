import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Upload, Pencil, Check } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ToneSettingsUI } from '../../components/ToneSettingsUI';
import { t, getSystemLang } from '../../i18n';
import { VOICES } from './VoiceSelect';
import { saveChatToCloud } from '../lib/chatHistory';
import { CropModal } from '../components/CropModal';
import { apiUrl } from '../lib/apiBase';
import { toast } from 'sonner';

type Tab = 'tone' | 'background' | 'voice';
type Lang = 'en' | 'cn' | 'kr' | 'jp';

const DEMO_TEXT: Record<Lang, string> = {
  cn: '你好，很高兴认识你',
  en: 'Hi, nice to meet you',
  kr: '안녕하세요, 만나서 반갑습니다',
  jp: 'こんにちは、はじめまして',
};

interface ChatData {
  id: string;
  name: string;
  tone: any;
  toneMode: string;
  background: string | null;
  messages: any[];
  personaPrompt?: string;
  isPolite?: boolean;
  vibes?: string[];
  voice?: string;
}

function autoSave(chatData: ChatData, currentKey: string) {
  localStorage.setItem(currentKey, JSON.stringify(chatData));
  localStorage.setItem('chat_' + chatData.id, JSON.stringify(chatData));
  void saveChatToCloud(chatData);
}

export function Settings() {
  const navigate = useNavigate();
  const { chatId } = useParams();
  const [chatData, setChatData] = useState<ChatData | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [isPolite, setIsPolite] = useState(true);
  const [vibes, setVibes] = useState<string[]>([]);
  const [personaPrompt, setPersonaPrompt] = useState('');
  const [chatName, setChatName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [voice, setVoice] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('tone');
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lang = (getSystemLang() || 'cn') as Lang;

  const hasToneChanges = Boolean(chatData) && (
    (chatName.trim() || '') !== (chatData?.name || '') ||
    isPolite !== (chatData?.isPolite ?? true) ||
    JSON.stringify(vibes) !== JSON.stringify(chatData?.vibes ?? []) ||
    personaPrompt !== (chatData?.personaPrompt || '')
  );

  useEffect(() => {
    const byId = chatId ? localStorage.getItem('chat_' + chatId) : null;
    const stored = byId || localStorage.getItem('currentChat');
    if (stored) {
      const data = JSON.parse(stored);
      setChatData(data);
      setBackgroundImage(data.background ?? null);
      setIsPolite(data.isPolite ?? true);
      setVibes(data.vibes ?? []);
      setPersonaPrompt(data.personaPrompt || '');
      setChatName(data.name || '');
      setVoice(data.voice || '');
    }
  }, [chatId]);

  const handleSaveTone = async () => {
    if (!chatData) return;
    const updated = {
      ...chatData,
      name: chatName.trim() || chatData.name,
      isPolite,
      vibes,
      personaPrompt,
    };
    setChatData(updated);
    const allChats = JSON.parse(localStorage.getItem('chatList') || '[]');
    const idx = allChats.findIndex((c: any) => c.id === updated.id);
    if (idx !== -1) { allChats[idx].name = updated.name; localStorage.setItem('chatList', JSON.stringify(allChats)); }
    autoSave(updated, 'currentChat');
    navigate(`/chat/${updated.id}`, { replace: true });
  };

  const handleBackgroundConfirm = (cropped: string) => {
    if (!chatData) return;
    const updated = { ...chatData, background: cropped };
    setChatData(updated);
    setBackgroundImage(cropped);
    setCropSrc(null);
    autoSave(updated, 'currentChat');
  };

  const handleRemoveBackground = () => {
    if (!chatData) return;
    const updated = { ...chatData, background: null };
    setChatData(updated);
    setBackgroundImage(null);
    autoSave(updated, 'currentChat');
  };

  const handleSelectVoice = (voiceId: string) => {
    if (!chatData) return;
    setVoice(voiceId);
    const updated = { ...chatData, voice: voiceId };
    setChatData(updated);
    autoSave(updated, 'currentChat');
  };

  const handleDemo = async (voiceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!voiceId || playingId === voiceId) return;
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setPlayingId(voiceId);
    try {
      const res = await fetch(apiUrl('/api/tts'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: DEMO_TEXT[lang], targetLang: lang, voice: voiceId }),
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => { setPlayingId(null); URL.revokeObjectURL(url); audioRef.current = null; };
      audio.onerror = () => { setPlayingId(null); URL.revokeObjectURL(url); audioRef.current = null; };
      await audio.play();
    } catch {
      setPlayingId(null);
      toast.error(t('chat.ttsError'));
    }
  };

  const handleBack = () => {
    if (activeTab === 'tone' && hasToneChanges) {
      if (window.confirm(t('settings.unsavedConfirm'))) {
        void handleSaveTone();
      } else {
        navigate(-1);
      }
      return;
    }
    navigate(-1);
  };

  if (!chatData) return null;

  if (cropSrc) {
    return (
      <CropModal
        imageSrc={cropSrc}
        onConfirm={handleBackgroundConfirm}
        onCancel={() => setCropSrc(null)}
      />
    );
  }

  const tabs: Tab[] = ['tone', 'background', 'voice'];
  const tabLabel = (tab: Tab) => t(`settings.tab${tab.charAt(0).toUpperCase() + tab.slice(1)}` as any);

  return (
    <div className="min-h-full flex flex-col overflow-hidden" style={{ backgroundColor: '#FFFBF5' }}>
      {/* Fixed header */}
      <div
        className="flex-shrink-0 px-6"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1rem)', paddingBottom: '0.75rem', backgroundColor: '#FFFBF5' }}
      >
        {/* Back + Title row */}
        <div className="flex items-center gap-3 mb-5">
          <button onClick={handleBack} className="p-2 -ml-2 transition-opacity hover:opacity-70">
            <ArrowLeft className="w-5 h-5" style={{ color: '#6B5B95' }} />
          </button>
          <h1 className="text-xl" style={{ fontWeight: 700, color: '#6B5B95' }}>{t('settings.title')}</h1>
        </div>

        {/* Tab bar */}
        <div className="flex p-1 rounded-2xl" style={{ backgroundColor: '#EDE8F5' }}>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2 text-sm transition-all"
              style={{
                borderRadius: '14px',
                backgroundColor: activeTab === tab ? '#B8A9D4' : 'transparent',
                color: activeTab === tab ? '#fff' : '#9B8FA6',
                fontWeight: activeTab === tab ? 600 : 400,
              }}
            >
              {tabLabel(tab)}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">

        {/* TONE TAB */}
        {activeTab === 'tone' && (
          <div className="space-y-8">
            {/* Chat Name */}
            <div>
              <h2 className="mb-3" style={{ fontSize: '13px', fontWeight: 600, color: '#9B8FA6', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {t('settings.chatName')}
              </h2>
              <div className="flex items-center gap-2 px-4 h-12 shadow-sm" style={{ backgroundColor: '#FFFFFF', borderRadius: '16px' }}>
                {isEditingName ? (
                  <>
                    <input
                      autoFocus
                      value={chatName}
                      onChange={e => setChatName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') setIsEditingName(false); }}
                      className="flex-1 border-0 outline-none bg-transparent"
                      style={{ fontSize: '15px', color: '#6B5B95' }}
                    />
                    <button onClick={() => setIsEditingName(false)}>
                      <Check className="w-4 h-4" style={{ color: '#6B5B95' }} />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1" style={{ fontSize: '15px', color: '#6B5B95' }}>{chatName}</span>
                    <button onClick={() => setIsEditingName(true)}>
                      <Pencil className="w-3.5 h-3.5" style={{ color: '#9B8FA6' }} />
                    </button>
                  </>
                )}
              </div>
            </div>

            <ToneSettingsUI
              isPolite={isPolite}
              setIsPolite={setIsPolite}
              vibes={vibes}
              setVibes={setVibes}
              personaPrompt={personaPrompt}
              setPersonaPrompt={setPersonaPrompt}
            />

            <div style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}>
              <Button
                onClick={() => { void handleSaveTone(); }}
                disabled={!hasToneChanges}
                className="w-full h-14 border-0 shadow-lg"
                style={{
                  backgroundColor: hasToneChanges ? '#B8A9D4' : '#D8D0E3',
                  color: '#FFFFFF',
                  borderRadius: '24px',
                  fontSize: '16px',
                  fontWeight: 600,
                  opacity: hasToneChanges ? 1 : 0.6,
                  cursor: hasToneChanges ? 'pointer' : 'not-allowed',
                }}
              >
                {t('settings.save')}
              </Button>
            </div>
          </div>
        )}

        {/* BACKGROUND TAB */}
        {activeTab === 'background' && (
          <div className="space-y-5" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}>
            <p style={{ fontSize: '13px', color: '#9B8FA6' }}>
              {backgroundImage ? t('settings.applied') : t('settings.tapToUpload')}
            </p>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative w-full cursor-pointer transition-opacity hover:opacity-90 shadow-md"
              style={{
                height: '220px',
                backgroundColor: backgroundImage ? 'transparent' : '#FFFFFF',
                borderRadius: '24px',
                border: backgroundImage ? 'none' : '2px dashed #D4C4E8',
              }}
            >
              {backgroundImage ? (
                <img src={backgroundImage} alt="Background" className="w-full h-full object-cover" style={{ borderRadius: '24px' }} />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div className="w-14 h-14 flex items-center justify-center" style={{ backgroundColor: '#E6E6FA', borderRadius: '16px' }}>
                    <Upload className="w-7 h-7" style={{ color: '#6B5B95' }} />
                  </div>
                  <p style={{ fontSize: '14px', color: '#9B8FA6' }}>{t('settings.tapToUpload')}</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setCropSrc(reader.result as string);
                    reader.readAsDataURL(file);
                  }
                  e.target.value = '';
                }}
              />
            </div>
            {backgroundImage && (
              <button
                type="button"
                onClick={handleRemoveBackground}
                className="w-full text-center py-2 transition-opacity hover:opacity-70"
                style={{ fontSize: '13px', color: '#9B8FA6' }}
              >
                {t('settings.removeBackground')}
              </button>
            )}
          </div>
        )}

        {/* VOICE TAB */}
        {activeTab === 'voice' && (
          <div className="space-y-3" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}>
            {VOICES.map((v) => (
              <button
                key={v.id}
                onClick={() => handleSelectVoice(v.id)}
                className="w-full flex items-center gap-3 p-4 transition-all"
                style={{
                  backgroundColor: voice === v.id ? '#E6E6FA' : '#FFFFFF',
                  borderRadius: '16px',
                  border: voice === v.id ? '2px solid #B8A9D4' : '2px solid transparent',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                }}
              >
                <div
                  className="w-6 h-6 flex items-center justify-center flex-shrink-0"
                  style={{
                    borderRadius: '50%',
                    border: voice === v.id ? 'none' : '2px solid #D4C4E8',
                    backgroundColor: voice === v.id ? '#B8A9D4' : 'transparent',
                  }}
                >
                  {voice === v.id && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
                <span className="flex-1 text-left" style={{ fontSize: '15px', fontWeight: voice === v.id ? 600 : 400, color: '#6B5B95' }}>
                  {v.label[lang]}
                </span>
                {v.id && (
                  <button
                    onClick={(e) => { void handleDemo(v.id, e); }}
                    className="p-2 flex-shrink-0"
                    disabled={playingId === v.id}
                  >
                    <span style={{ fontSize: '18px' }}>{playingId === v.id ? '⏸' : '▶'}</span>
                  </button>
                )}
              </button>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
