import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { ToneSettingsJP } from '../../components/ToneSettingsJP';
import { t, langLabel } from '../../i18n';

export function SetupJP() {
  const navigate = useNavigate();
  const [chatName, setChatName] = useState('');
  const [isPolite, setIsPolite] = useState(true);
  const [vibes, setVibes] = useState<string[]>([]);
  const [personaPrompt, setPersonaPrompt] = useState('');

  // Read direction from localStorage (set by LanguageSelect)
  const direction = JSON.parse(localStorage.getItem('selectedDirection') || '{}');
  const sourceLang = direction.sourceLang || 'cn';
  const targetLang = direction.targetLang || 'jp';

  const handleStartChat = () => {
    const savedChats = JSON.parse(localStorage.getItem('chatList') || '[]');
    const sameDir = savedChats.filter((c: { sourceLang?: string; targetLang?: string }) => c.sourceLang === sourceLang && c.targetLang === targetLang);
    const index = sameDir.length + 1;
    const displayName = chatName.trim() || `${langLabel(sourceLang)} -> ${langLabel(targetLang)} ${index}`;
    const chatData = {
      id: Date.now().toString(),
      name: displayName,
      lang: 'jp',
      sourceLang,
      targetLang,
      isPolite,
      vibes,
      personaPrompt,
      toneMode: 'simple',
      background: null,
      messages: [],
    };
    localStorage.setItem('currentChatJP', JSON.stringify(chatData));
    localStorage.setItem('chat_' + chatData.id, JSON.stringify(chatData));
    savedChats.push({ id: chatData.id, name: displayName, lang: 'jp', sourceLang, targetLang });
    localStorage.setItem('chatList', JSON.stringify(savedChats));
    navigate(`/chat-jp/${chatData.id}`);
  };

  return (
    <div className="min-h-screen px-6 md:px-12 lg:px-24 py-8" style={{ backgroundColor: '#FFFBF5' }}>
      <button
        onClick={() => navigate(-1)}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 transition-opacity hover:opacity-70"
      >
        <ArrowLeft className="w-5 h-5" style={{ color: '#6B5B95' }} />
        <span style={{ fontSize: '14px', color: '#6B5B95' }}>{t('settings.back')}</span>
      </button>
      <div className="max-w-2xl mx-auto pt-10">
      <h1 className="text-3xl mb-6" style={{ fontWeight: 700, color: '#6B5B95' }}>
        {t('setup.title')} ({langLabel(sourceLang)} → {langLabel(targetLang)})
      </h1>
      <div className="space-y-10">
        <div>
          <h2 className="mb-1" style={{ fontSize: '16px', fontWeight: 600, color: '#6B5B95' }}>{t('setup.chatName')}</h2>
          <p className="mb-4" style={{ fontSize: '12px', color: '#9B8FA6' }}>{t('setup.chatNamePlaceholder')}</p>
          <Input
            type="text"
            placeholder={t('setup.chatNamePlaceholder')}
            value={chatName}
            onChange={e => setChatName(e.target.value)}
            className="w-full h-12 px-5 border-0 shadow-md"
            style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', fontSize: '16px', color: '#6B5B95' }}
          />
        </div>
        <ToneSettingsJP
          isPolite={isPolite}
          setIsPolite={setIsPolite}
          vibes={vibes}
          setVibes={setVibes}
          personaPrompt={personaPrompt}
          setPersonaPrompt={setPersonaPrompt}
        />
        <div className="pt-4">
          <Button
            onClick={handleStartChat}
            className="w-full h-14 border-0 shadow-lg"
            style={{ backgroundColor: '#B8A9D4', color: '#FFFFFF', borderRadius: '24px', fontSize: '16px', fontWeight: 600 }}
          >
            {t('setup.startChat')}
          </Button>
        </div>
      </div>
      </div>
    </div>
  );
}
