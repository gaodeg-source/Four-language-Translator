import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeftRight, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { t, langLabel } from '../../i18n';

const LANGUAGES = [
  { code: 'cn', flag: '🇨🇳' },
  { code: 'kr', flag: '🇰🇷' },
  { code: 'en', flag: '🇬🇧' },
  { code: 'jp', flag: '🇯🇵' },
];

// Map target language to the correct setup route
const SETUP_ROUTES: Record<string, string> = {
  kr: '/setup',
  en: '/setup-en',
  jp: '/setup-jp',
  cn: '/setup',     // fallback — uses KR setup page for X→CN (tone settings still apply)
};

// When target is CN, route based on source language's tone settings page
function getSetupRoute(source: string, target: string) {
  if (target === 'cn') {
    // Use the source language's setup page so tone settings match
    if (source === 'kr') return '/setup';
    if (source === 'en') return '/setup-en';
    if (source === 'jp') return '/setup-jp';
  }
  return SETUP_ROUTES[target] || '/setup';
}

export function LanguageSelect() {
  const navigate = useNavigate();
  const [source, setSource] = useState('cn');
  const [target, setTarget] = useState('kr');
  const [sourceOpen, setSourceOpen] = useState(false);
  const [targetOpen, setTargetOpen] = useState(false);

  const sourceLang = LANGUAGES.find(l => l.code === source)!;
  const targetLang = LANGUAGES.find(l => l.code === target)!;

  const handleSwap = () => {
    setSource(target);
    setTarget(source);
  };

  const handleContinue = () => {
    if (source === target) return;
    localStorage.setItem('selectedDirection', JSON.stringify({ sourceLang: source, targetLang: target }));
    navigate(getSetupRoute(source, target));
  };

  const selectSource = (code: string) => {
    setSource(code);
    if (code === target) setTarget(LANGUAGES.find(l => l.code !== code)!.code);
    setSourceOpen(false);
  };

  const selectTarget = (code: string) => {
    setTarget(code);
    if (code === source) setSource(LANGUAGES.find(l => l.code !== code)!.code);
    setTargetOpen(false);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 relative"
      style={{ background: 'linear-gradient(135deg, #E6E6FA 0%, #FFFBF5 100%)' }}
    >
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 flex items-center gap-2 transition-opacity hover:opacity-70"
      >
        <ArrowLeft className="w-5 h-5" style={{ color: '#6B5B95' }} />
        <span style={{ fontSize: '14px', color: '#6B5B95' }}>{t('settings.back')}</span>
      </button>
      <h1
        className="text-3xl mb-2"
        style={{ fontWeight: 700, color: '#6B5B95', letterSpacing: '-0.02em' }}
      >
        {t('langSelect.title')}
      </h1>
      <p className="text-base mb-10" style={{ color: '#9B8FA6' }}>
        {t('langSelect.subtitle')}
      </p>

      <div className="w-full max-w-md">
        {/* Two dropdowns + swap button */}
        <div className="flex items-center gap-3">
          {/* Source dropdown */}
          <div className="flex-1 relative">
            <label className="block mb-2" style={{ fontSize: '13px', fontWeight: 600, color: '#9B8FA6' }}>{t('langSelect.from')}</label>
            <button
              onClick={() => { setSourceOpen(!sourceOpen); setTargetOpen(false); }}
              className="w-full h-16 flex items-center gap-3 px-5 shadow-md transition-all hover:shadow-lg"
              style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: sourceOpen ? '2px solid #B8A9D4' : '2px solid #E6E6FA' }}
            >
              <span style={{ fontSize: '26px' }}>{sourceLang.flag}</span>
              <span style={{ fontSize: '16px', fontWeight: 600, color: '#6B5B95' }}>{langLabel(sourceLang.code)}</span>
              <svg className="ml-auto w-4 h-4" style={{ color: '#9B8FA6', transform: sourceOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {sourceOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 z-50 shadow-xl overflow-hidden" style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '2px solid #E6E6FA' }}>
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => selectSource(lang.code)}
                    className="w-full flex items-center gap-3 px-5 py-3 transition-colors hover:bg-purple-50"
                    style={{ backgroundColor: lang.code === source ? '#F3EEFF' : 'transparent' }}
                  >
                    <span style={{ fontSize: '22px' }}>{lang.flag}</span>
                    <span style={{ fontSize: '15px', fontWeight: lang.code === source ? 700 : 500, color: '#6B5B95' }}>{langLabel(lang.code)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Swap button */}
          <button
            onClick={handleSwap}
            className="mt-7 w-12 h-12 flex items-center justify-center shadow-md transition-transform hover:scale-110 active:scale-95"
            style={{ backgroundColor: '#FFFFFF', borderRadius: '50%', border: '2px solid #E6E6FA', flexShrink: 0 }}
          >
            <ArrowLeftRight className="w-5 h-5" style={{ color: '#B8A9D4' }} />
          </button>

          {/* Target dropdown */}
          <div className="flex-1 relative">
            <label className="block mb-2" style={{ fontSize: '13px', fontWeight: 600, color: '#9B8FA6' }}>{t('langSelect.to')}</label>
            <button
              onClick={() => { setTargetOpen(!targetOpen); setSourceOpen(false); }}
              className="w-full h-16 flex items-center gap-3 px-5 shadow-md transition-all hover:shadow-lg"
              style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: targetOpen ? '2px solid #B8A9D4' : '2px solid #E6E6FA' }}
            >
              <span style={{ fontSize: '26px' }}>{targetLang.flag}</span>
              <span style={{ fontSize: '16px', fontWeight: 600, color: '#6B5B95' }}>{langLabel(targetLang.code)}</span>
              <svg className="ml-auto w-4 h-4" style={{ color: '#9B8FA6', transform: targetOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {targetOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 z-50 shadow-xl overflow-hidden" style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '2px solid #E6E6FA' }}>
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => selectTarget(lang.code)}
                    className="w-full flex items-center gap-3 px-5 py-3 transition-colors hover:bg-purple-50"
                    style={{ backgroundColor: lang.code === target ? '#F3EEFF' : 'transparent' }}
                  >
                    <span style={{ fontSize: '22px' }}>{lang.flag}</span>
                    <span style={{ fontSize: '15px', fontWeight: lang.code === target ? 700 : 500, color: '#6B5B95' }}>{langLabel(lang.code)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Continue button */}
        <Button
          onClick={handleContinue}
          disabled={source === target}
          className="w-full h-14 border-0 shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] mt-8"
          style={{
            backgroundColor: source === target ? '#D8D0E3' : '#B8A9D4',
            color: '#FFFFFF',
            borderRadius: '24px',
            fontSize: '16px',
            fontWeight: 600,
            opacity: source === target ? 0.5 : 1,
          }}
        >
          {t('langSelect.continue')}
        </Button>
      </div>

      {/* Close dropdowns when clicking outside */}
      {(sourceOpen || targetOpen) && (
        <div className="fixed inset-0 z-40" onClick={() => { setSourceOpen(false); setTargetOpen(false); }} />
      )}
    </div>
  );
}
