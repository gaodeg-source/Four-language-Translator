import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { ToneSettingsUI } from '../../components/ToneSettingsUI';

const LANG_LABELS: Record<string, string> = { cn: '中文', kr: '한국어', en: 'English', jp: '日本語' };

export function Setup() {
  const navigate = useNavigate();
  const [idolName, setIdolName] = useState('');
  const [isPolite, setIsPolite] = useState(true);
  const [vibes, setVibes] = useState<string[]>([]);
  const [personaPrompt, setPersonaPrompt] = useState('');

  // Read direction from localStorage (set by LanguageSelect)
  const direction = JSON.parse(localStorage.getItem('selectedDirection') || '{}');
  const sourceLang = direction.sourceLang || 'cn';
  const targetLang = direction.targetLang || 'kr';

  const handleStartChat = () => {
    if (!idolName.trim()) return;
    const chatData = {
      id: Date.now().toString(),
      name: idolName,
      lang: 'kr',
      sourceLang,
      targetLang,
      isPolite,
      vibes,
      personaPrompt,
      toneMode: 'simple',
      background: null,
      messages: [],
    };
    localStorage.setItem('currentChat', JSON.stringify(chatData));
    localStorage.setItem('chat_' + chatData.id, JSON.stringify(chatData));
    const savedChats = JSON.parse(localStorage.getItem('chatList') || '[]');
    savedChats.push({ id: chatData.id, name: idolName, lang: 'kr', sourceLang, targetLang });
    localStorage.setItem('chatList', JSON.stringify(savedChats));
    navigate(`/chat/${chatData.id}`);
  };

  return (
    <div className="min-h-screen px-6 py-8" style={{ backgroundColor: '#FFFBF5' }}>
      <h1 className="text-3xl mb-6" style={{ fontWeight: 700, color: '#6B5B95' }}>
        Create New Chat ({LANG_LABELS[sourceLang]} → {LANG_LABELS[targetLang]})
      </h1>
      <div className="max-w-lg space-y-10">
        {/* Idol Name Input */}
        <div>
          <h2 className="mb-4" style={{ fontSize: '16px', fontWeight: 600, color: '#6B5B95' }}>Chat Name</h2>
          <Input
            type="text"
            placeholder="Enter a chat name (e.g., Idol, Friend, etc.)"
            value={idolName}
            onChange={e => setIdolName(e.target.value)}
            className="w-full h-12 px-5 border-0 shadow-md"
            style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', fontSize: '16px', color: '#6B5B95' }}
          />
        </div>
        {/* Tone Settings UI */}
        <ToneSettingsUI
          isPolite={isPolite}
          setIsPolite={setIsPolite}
          vibes={vibes}
          setVibes={setVibes}
          personaPrompt={personaPrompt}
          setPersonaPrompt={setPersonaPrompt}
        />
        {/* Start Chat Button */}
        <div className="pt-4">
          <Button
            onClick={handleStartChat}
            className="w-full h-14 border-0 shadow-lg"
            style={{ backgroundColor: '#B8A9D4', color: '#FFFFFF', borderRadius: '24px', fontSize: '16px', fontWeight: 600 }}
          >
            Start Chat
          </Button>
        </div>
      </div>
    </div>
  );
}