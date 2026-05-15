import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Upload, Pencil, Check } from 'lucide-react';
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
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#FFFFFF', fontFamily: "'Nunito', -apple-system, system-ui, sans-serif" }}>
      {/* Fixed header */}
      <div style={{ flexShrink: 0, padding: '0 22px', paddingTop: 'calc(env(safe-area-inset-top) + 52px)', paddingBottom: '0.75rem', background: '#FFFFFF' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <button onClick={handleBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px 8px 8px 0', display: 'flex', alignItems: 'center' }}>
            <ArrowLeft className="w-5 h-5" style={{ color: '#2A1A3A' }} />
          </button>
          <div style={{ flex: 1 }} />
          {hasToneChanges && <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: '0.08em', color: '#9A8AAA' }}>edited</span>}
        </div>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9A8AAA', marginBottom: 4 }}>chat settings</div>
        <h1 style={{ fontFamily: "'Nunito',sans-serif", fontSize: 32, lineHeight: 1.05, fontWeight: 800, color: '#2A1A3A', margin: '0 0 4px', letterSpacing: '-0.02em' }}>{chatData.name}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 18 }}>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: '0.08em', color: '#9A8AAA' }}>
            {(chatData.sourceLang || 'ZH').toUpperCase()} → {(chatData.targetLang || 'KO').toUpperCase()}
          </span>
        </div>

        {/* Tab bar */}
        <div style={{ background: '#FAF5FF', padding: 4, borderRadius: 14, display: 'flex', marginBottom: 6 }}>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, height: 38, fontSize: 13, border: 'none', cursor: 'pointer',
                borderRadius: 10, position: 'relative',
                background: activeTab === tab ? '#FFFFFF' : 'transparent',
                color: activeTab === tab ? '#2A1A3A' : '#9A8AAA',
                fontWeight: activeTab === tab ? 700 : 600,
                boxShadow: activeTab === tab ? '0 1px 3px rgba(42,26,58,.06)' : 'none',
                fontFamily: "'Nunito', sans-serif",
                transition: 'all .15s',
              }}
            >
              {tabLabel(tab)}
              {activeTab === tab && (
                <span style={{ position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)', width: 18, height: 2, borderRadius: 2, background: '#A865E0' }} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 22px' }}>

        {/* TONE TAB */}
        {activeTab === 'tone' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Chat Name */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#9A8AAA', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                {t('settings.chatName')}
              </div>
              <div style={{ background: '#FFFFFF', border: '1px solid #EFE5F7', borderRadius: 14, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                {isEditingName ? (
                  <>
                    <input
                      autoFocus
                      value={chatName}
                      onChange={e => setChatName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') setIsEditingName(false); }}
                      style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 15, color: '#2A1A3A', fontFamily: "'Nunito', sans-serif" }}
                    />
                    <button onClick={() => setIsEditingName(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                      <Check className="w-4 h-4" style={{ color: '#8B3FD1' }} />
                    </button>
                  </>
                ) : (
                  <>
                    <span style={{ flex: 1, fontSize: 15, color: '#2A1A3A' }}>{chatName}</span>
                    <button onClick={() => setIsEditingName(true)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                      <Pencil className="w-3.5 h-3.5" style={{ color: '#9A8AAA' }} />
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
              <button
                onClick={() => { void handleSaveTone(); }}
                disabled={!hasToneChanges}
                style={{
                  width: '100%', height: 56, padding: '0 8px 0 22px', border: 'none', borderRadius: 16,
                  background: hasToneChanges ? '#2A1A3A' : '#C5BACF', color: '#FFFFFF',
                  fontFamily: "'Nunito', sans-serif", fontSize: 15, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  cursor: hasToneChanges ? 'pointer' : 'not-allowed', opacity: hasToneChanges ? 1 : 0.6,
                }}
              >
                {t('settings.save')}
                <span style={{ width: 40, height: 40, borderRadius: 12, background: '#8B3FD1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>→</span>
              </button>
            </div>
          </div>
        )}

        {/* BACKGROUND TAB */}
        {activeTab === 'background' && (() => {
          const BG_PRESETS = [
            'linear-gradient(135deg, #FFD1DC 0%, #A865E0 60%, #B4DFE5 100%)',
            'linear-gradient(135deg, #FFC93C 0%, #E84B91 100%)',
            'linear-gradient(135deg, #A8E6CF 0%, #C8B6FF 100%)',
            'linear-gradient(135deg, #FFE5B4 0%, #FFB4D8 100%)',
          ];
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}>
              {/* preview */}
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9A8AAA' }}>preview</div>
              <div style={{
                height: 180, borderRadius: 20, overflow: 'hidden', cursor: 'pointer',
                background: backgroundImage
                  ? (backgroundImage.startsWith('linear-gradient') ? backgroundImage : 'transparent')
                  : '#FFFFFF',
                border: backgroundImage ? 'none' : '1.5px dashed #EFE5F7',
                position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 4,
              }} onClick={() => !backgroundImage && fileInputRef.current?.click()}>
                {backgroundImage && !backgroundImage.startsWith('linear-gradient') && (
                  <img src={backgroundImage} alt="Background" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
                {backgroundImage && (
                  <>
                    <div style={{ position: 'absolute', left: 14, bottom: 12, padding: '4px 10px', borderRadius: 999, background: 'rgba(26,14,38,.55)', color: '#FFFFFF', fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: '0.08em' }}>
                      CUSTOM
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleRemoveBackground(); }} style={{ position: 'absolute', right: 10, top: 10, width: 30, height: 30, borderRadius: 15, background: 'rgba(26,14,38,.55)', color: '#FFFFFF', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </>
                )}
                {!backgroundImage && (
                  <div style={{ textAlign: 'center', color: '#9A8AAA' }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 6 }}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, letterSpacing: '0.06em' }}>TAP TO UPLOAD</div>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) { const reader = new FileReader(); reader.onloadend = () => setCropSrc(reader.result as string); reader.readAsDataURL(file); }
                    e.target.value = '';
                  }}
                />
              </div>

              {/* presets */}
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9A8AAA' }}>presets</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {BG_PRESETS.map((g, i) => {
                  const active = backgroundImage === g;
                  return (
                    <button key={i} onClick={() => {
                      const updated = { ...chatData!, background: g };
                      setChatData(updated); setBackgroundImage(g); autoSave(updated, 'currentChat');
                    }} style={{
                      height: 64, borderRadius: 14, border: active ? '2px solid #2A1A3A' : '1px solid #EFE5F7',
                      background: g, cursor: 'pointer', padding: 0,
                      boxShadow: active ? '0 4px 12px rgba(168,101,224,.25)' : 'none',
                    }}/>
                  );
                })}
              </div>

              {/* upload */}
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9A8AAA' }}>or upload your own</div>
              <button onClick={() => fileInputRef.current?.click()} style={{
                width: '100%', height: 48, borderRadius: 14, border: '1.5px dashed #EFE5F7',
                background: 'transparent', color: '#5A4A6A', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontSize: 14, fontWeight: 600,
              }}>
                <Upload className="w-4 h-4" style={{ color: '#9A8AAA' }} />
                {t('settings.tapToUpload')}
              </button>
            </div>
          );
        })()}

        {/* VOICE TAB */}
        {activeTab === 'voice' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}>
            {VOICES.map((v) => (
              <button
                key={v.id}
                onClick={() => handleSelectVoice(v.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: 16,
                  background: voice === v.id ? '#FAF5FF' : '#FFFFFF',
                  border: voice === v.id ? '1.5px solid #2A1A3A' : '1px solid #EFE5F7',
                  borderRadius: 14, cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: 24, height: 24, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: voice === v.id ? 'none' : '2px solid #EFE5F7',
                    background: voice === v.id ? '#8B3FD1' : 'transparent',
                  }}
                >
                  {voice === v.id && <Check className="w-3.5 h-3.5" style={{ color: '#fff' }} />}
                </div>
                <span style={{ flex: 1, textAlign: 'left', fontSize: 15, fontWeight: voice === v.id ? 600 : 400, color: '#2A1A3A' }}>
                  {v.label[lang]}
                </span>
                {v.id && (
                  <button
                    onClick={(e) => { void handleDemo(v.id, e); }}
                    style={{ padding: 8, background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}
                    disabled={playingId === v.id}
                  >
                    <span style={{ fontSize: 18 }}>{playingId === v.id ? '⏸' : '▶'}</span>
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
