import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { ToneSettingsUI } from '../../components/ToneSettingsUI';
import { t, langLabel } from '../../i18n';
import { saveChatToCloud } from '../lib/chatHistory';

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
    const savedChats = JSON.parse(localStorage.getItem('chatList') || '[]');
    const sameDir = savedChats.filter((c: { sourceLang?: string; targetLang?: string }) => c.sourceLang === sourceLang && c.targetLang === targetLang);
    const index = sameDir.length + 1;
    const displayName = idolName.trim() || `${langLabel(sourceLang)} -> ${langLabel(targetLang)} ${index}`;
    const chatData = {
      id: Date.now().toString(),
      name: displayName,
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
    savedChats.push({ id: chatData.id, name: displayName, lang: 'kr', sourceLang, targetLang });
    localStorage.setItem('chatList', JSON.stringify(savedChats));
    void saveChatToCloud(chatData);
    navigate(`/chat/${chatData.id}`);
  };

  const SANS = "'Nunito','Noto Sans KR','Zen Maru Gothic','Noto Sans SC',system-ui,sans-serif";
  const MONO = "'JetBrains Mono',ui-monospace,monospace";

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', background: '#FFFFFF', fontFamily: SANS }}>
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        style={{ position: 'fixed', zIndex: 50, top: 'calc(env(safe-area-inset-top) + 1rem)', left: '24px', display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <ArrowLeft className="w-5 h-5" style={{ color: '#2A1A3A' }} />
      </button>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '0 22px 16px', paddingTop: 'calc(env(safe-area-inset-top) + 3.5rem)' }}>
        <div style={{ fontFamily: MONO, fontSize: 10, color: '#9A8AAA', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>{t('setup.step')}</div>
        <h1 style={{ fontFamily: SANS, fontSize: 34, lineHeight: 1.05, fontWeight: 800, color: '#2A1A3A', letterSpacing: '-0.02em', margin: '0 0 22px' }}>{t('setup.headline')}</h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Chat name */}
          <div>
            <div style={{ fontFamily: MONO, fontSize: 10, color: '#9A8AAA', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>{t('setup.chatName')}</div>
            <div style={{ background: '#FFFFFF', border: '1px solid #EFE5F7', borderRadius: 16, padding: 14 }}>
              <input
                type="text"
                placeholder={t('setup.chatNamePlaceholder')}
                value={idolName}
                onChange={e => setIdolName(e.target.value)}
                style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontFamily: SANS, fontSize: 22, fontWeight: 800, color: '#2A1A3A', boxSizing: 'border-box' }}
              />
            </div>
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

          {/* Start Chat button */}
          <button
            onClick={handleStartChat}
            style={{
              width: '100%', height: 56, padding: '0 8px 0 22px', border: 'none', borderRadius: 16,
              background: '#2A1A3A', color: '#FFFFFF', fontFamily: SANS,
              fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', cursor: 'pointer', marginBottom: 12,
            }}
          >
            {t('setup.startChat')}
            <span style={{ width: 40, height: 40, borderRadius: 12, background: '#A865E0', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
