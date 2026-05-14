import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Upload, Pencil, Check, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ToneSettingsJP } from '../../components/ToneSettingsJP';
import { t, getSystemLang } from '../../i18n';
import { getVoiceLabel } from './VoiceSelect';
import { saveChatToCloud } from '../lib/chatHistory';
import { CropModal } from '../components/CropModal';

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
  messages: any[];
  voice?: string;
}

export function SettingsJP() {
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  const hasUnsavedChanges = Boolean(chatData) && (
    (chatName.trim() || chatData?.name || '') !== (chatData?.name || '') ||
    backgroundImage !== (chatData?.background ?? null) ||
    isPolite !== (chatData?.isPolite ?? true) ||
    JSON.stringify(vibes) !== JSON.stringify(chatData?.vibes ?? []) ||
    personaPrompt !== (chatData?.personaPrompt || '') ||
    voice !== (chatData?.voice || '')
  );

  useEffect(() => {
    const byId = chatId ? localStorage.getItem('chat_' + chatId) : null;
    const stored = byId || localStorage.getItem('currentChatJP');
    if (stored) {
      const data = JSON.parse(stored);
      setChatData(data);
      setBackgroundImage(data.background ?? null);
      setIsPolite(data.isPolite ?? true);
      setVibes(data.vibes ?? []);
      setPersonaPrompt(data.personaPrompt || '');
      setChatName(data.name || '');
      const pending = localStorage.getItem('_pendingVoice');
      if (pending !== null) {
        setVoice(pending);
        localStorage.removeItem('_pendingVoice');
      } else {
        setVoice(data.voice || '');
      }
    }
  }, [chatId]);

  const handleSave = async (goBack = true) => {
    if (chatData) {
      const updatedChat = {
        ...chatData,
        name: chatName.trim() || chatData.name,
        background: backgroundImage,
        isPolite,
        vibes,
        personaPrompt,
        voice,
      };
      setChatData(updatedChat);
      localStorage.setItem('currentChatJP', JSON.stringify(updatedChat));
      localStorage.setItem('chat_' + updatedChat.id, JSON.stringify(updatedChat));
      const allChats = JSON.parse(localStorage.getItem('chatList') || '[]');
      const idx = allChats.findIndex((c: any) => c.id === updatedChat.id);
      if (idx !== -1) { allChats[idx].name = updatedChat.name; localStorage.setItem('chatList', JSON.stringify(allChats)); }
      void saveChatToCloud(updatedChat);
      if (goBack) navigate(-1);
    }
  };

  const handleBack = async () => {
    if (!hasUnsavedChanges) {
      navigate(-1);
      return;
    }
    const shouldSave = window.confirm(t('settings.unsavedConfirm'));
    if (!shouldSave) return;
    await handleSave(true);
  };

  if (!chatData) return null;

  if (cropSrc) {
    return (
      <CropModal
        imageSrc={cropSrc}
        onConfirm={(cropped) => { setBackgroundImage(cropped); setCropSrc(null); }}
        onCancel={() => setCropSrc(null)}
      />
    );
  }

  return (
    <div className="min-h-full px-6 pb-8 overflow-y-auto" style={{ backgroundColor: '#FFFBF5', paddingTop: 'calc(env(safe-area-inset-top) + 4rem)' }}>
      {/* Back Button */}
      <button
        onClick={() => { void handleBack(); }}
        className="fixed z-50 flex items-center gap-2 transition-opacity hover:opacity-70"
        style={{ top: 'calc(env(safe-area-inset-top) + 1.25rem)', left: '1.5rem' }}
      >
        <ArrowLeft className="w-5 h-5" style={{ color: '#6B5B95' }} />
        <span style={{ fontSize: '14px', color: '#6B5B95' }}>{t('settings.back')}</span>
      </button>
      <div className="max-w-2xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl mb-2" style={{ fontWeight: 700, color: '#6B5B95', letterSpacing: '-0.02em' }}>
            {t('settings.title')}
          </h1>
          <div className="flex items-center gap-2">
            {isEditingName ? (
              <>
                <input
                  autoFocus
                  value={chatName}
                  onChange={e => setChatName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') setIsEditingName(false); }}
                  className="border-0 outline-none bg-transparent"
                  style={{ fontSize: '14px', color: '#9B8FA6', borderBottom: '1.5px solid #B8A9D4', paddingBottom: '2px' }}
                />
                <button onClick={() => setIsEditingName(false)} className="transition-opacity hover:opacity-70">
                  <Check className="w-4 h-4" style={{ color: '#6B5B95' }} />
                </button>
              </>
            ) : (
              <>
                <p style={{ fontSize: '14px', color: '#9B8FA6' }}>{chatName}</p>
                <button onClick={() => setIsEditingName(true)} className="transition-opacity hover:opacity-70">
                  <Pencil className="w-3.5 h-3.5" style={{ color: '#9B8FA6' }} />
                </button>
              </>
            )}
          </div>
        </div>
        <div className="space-y-10">
          {/* Background Image */}
          <div>
            <h2 className="mb-4" style={{ fontSize: '16px', fontWeight: 600, color: '#6B5B95' }}>{t('settings.background')}</h2>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative block w-full h-48 cursor-pointer transition-opacity hover:opacity-90 shadow-md"
              style={{ backgroundColor: backgroundImage ? 'transparent' : '#FFFFFF', borderRadius: '24px', border: backgroundImage ? 'none' : '2px dashed #D4C4E8' }}
            >
              {backgroundImage ? (
                <img src={backgroundImage} alt="Background" className="w-full h-full object-cover" style={{ borderRadius: '24px' }} />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="w-14 h-14 flex items-center justify-center mb-3" style={{ backgroundColor: '#E6E6FA', borderRadius: '16px' }}>
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
                onClick={() => setBackgroundImage(null)}
                className="mt-3 w-full text-center transition-opacity hover:opacity-70"
                style={{ fontSize: '13px', color: '#9B8FA6' }}
              >
                {t('settings.removeBackground')}
              </button>
            )}
          </div>
          <ToneSettingsJP
            isPolite={isPolite}
            setIsPolite={setIsPolite}
            vibes={vibes}
            setVibes={setVibes}
            personaPrompt={personaPrompt}
            setPersonaPrompt={setPersonaPrompt}
          />
          {/* Voice Model */}
          <div>
            <h2 className="mb-4" style={{ fontSize: '16px', fontWeight: 600, color: '#6B5B95' }}>{t('settings.voice')}</h2>
            <button
              onClick={() => { localStorage.setItem('_pendingVoice', voice); navigate('/voice-select'); }}
              className="w-full flex items-center justify-between px-4 h-12 shadow-md cursor-pointer"
              style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: 'none' }}
            >
              <span style={{ fontSize: '14px', color: '#6B5B95' }}>{getVoiceLabel(voice, getSystemLang())}</span>
              <ChevronRight className="w-4 h-4" style={{ color: '#9B8FA6' }} />
            </button>
          </div>
          {/* Save Button */}
          <div className="pt-4 pb-8">
            <Button
              onClick={() => { void handleSave(true); }}
              disabled={!hasUnsavedChanges}
              className="w-full h-14 border-0 shadow-lg"
              style={{
                backgroundColor: hasUnsavedChanges ? '#B8A9D4' : '#D8D0E3',
                color: '#FFFFFF',
                borderRadius: '24px',
                fontSize: '16px',
                fontWeight: 600,
                opacity: hasUnsavedChanges ? 1 : 0.6,
                cursor: hasUnsavedChanges ? 'pointer' : 'not-allowed',
              }}
            >
              {t('settings.save')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
