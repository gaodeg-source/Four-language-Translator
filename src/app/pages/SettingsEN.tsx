import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Upload } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ToneSettingsEN } from '../../components/ToneSettingsEN';

interface ChatData {
  id: string;
  name: string;
  lang: string;
  isFormal: boolean;
  vibes: string[];
  personaPrompt: string;
  toneMode: string;
  background: string | null;
  messages: any[];
}

export function SettingsEN() {
  const navigate = useNavigate();
  const { chatId } = useParams();
  const [chatData, setChatData] = useState<ChatData | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [isFormal, setIsFormal] = useState(false);
  const [vibes, setVibes] = useState<string[]>([]);
  const [personaPrompt, setPersonaPrompt] = useState('');

  useEffect(() => {
    const byId = chatId ? localStorage.getItem('chat_' + chatId) : null;
    const stored = byId || localStorage.getItem('currentChatEN');
    if (stored) {
      const data = JSON.parse(stored);
      setChatData(data);
      setBackgroundImage(data.background);
      setIsFormal(data.isFormal ?? false);
      setVibes(data.vibes ?? []);
      setPersonaPrompt(data.personaPrompt || '');
    }
  }, [chatId]);

  const handleSave = () => {
    if (chatData) {
      const updatedChat = {
        ...chatData,
        background: backgroundImage,
        isFormal,
        vibes,
        personaPrompt,
      };
      setChatData(updatedChat);
      localStorage.setItem('currentChatEN', JSON.stringify(updatedChat));
      localStorage.setItem('chat_' + updatedChat.id, JSON.stringify(updatedChat));
      navigate(-1);
    }
  };

  if (!chatData) return null;

  return (
    <div className="min-h-screen px-6 py-8" style={{ backgroundColor: '#FFFBF5' }}>
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-8 flex items-center gap-2 transition-opacity hover:opacity-70"
      >
        <ArrowLeft className="w-5 h-5" style={{ color: '#6B5B95' }} />
        <span style={{ fontSize: '14px', color: '#6B5B95' }}>Back</span>
      </button>
      {/* Title */}
      <div className="mb-10">
        <h1 className="text-3xl mb-2" style={{ fontWeight: 700, color: '#6B5B95', letterSpacing: '-0.02em' }}>
          Chat Settings (EN)
        </h1>
        <p style={{ fontSize: '14px', color: '#9B8FA6' }}>{chatData.name}</p>
      </div>
      <div className="max-w-lg space-y-10">
        {/* Section 1: Background Image Upload */}
        <div>
          <h2 className="mb-4" style={{ fontSize: '16px', fontWeight: 600, color: '#6B5B95' }}>
            Set Background Image
          </h2>
          <label
            htmlFor="backgroundUploadEN"
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
                <p style={{ fontSize: '14px', color: '#9B8FA6' }}>Tap to upload</p>
              </div>
            )}
            <input id="backgroundUploadEN" type="file" accept="image/*" className="hidden" onChange={e => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => setBackgroundImage(reader.result as string);
                reader.readAsDataURL(file);
              }
            }} />
          </label>
        </div>
        {/* Tone Settings UI (English) */}
        <ToneSettingsEN
          isFormal={isFormal}
          setIsFormal={setIsFormal}
          vibes={vibes}
          setVibes={setVibes}
          personaPrompt={personaPrompt}
          setPersonaPrompt={setPersonaPrompt}
        />
        {/* Save Button */}
        <div className="pt-4">
          <Button
            onClick={handleSave}
            className="w-full h-14 border-0 shadow-lg"
            style={{ backgroundColor: '#B8A9D4', color: '#FFFFFF', borderRadius: '24px', fontSize: '16px', fontWeight: 600 }}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
