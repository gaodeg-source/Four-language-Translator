import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Check } from 'lucide-react';
import { t, getSystemLang, setSystemLang, type SystemLang } from '../../i18n';

const SYSTEM_LANGUAGES: { code: SystemLang; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'cn', label: '中文', flag: '🇨🇳' },
  { code: 'kr', label: '한국어', flag: '🇰🇷' },
  { code: 'jp', label: '日本語', flag: '🇯🇵' },
];

export function SystemSettings() {
  const navigate = useNavigate();
  const [currentLang, setCurrentLang] = useState<SystemLang>(getSystemLang());

  const handleSelect = (lang: SystemLang) => {
    setSystemLang(lang);
    setCurrentLang(lang);
  };

  return (
    <div className="min-h-screen px-6 md:px-12 lg:px-24 py-8" style={{ backgroundColor: '#FFFBF5' }}>
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 transition-opacity hover:opacity-70"
      >
        <ArrowLeft className="w-5 h-5" style={{ color: '#6B5B95' }} />
        <span style={{ fontSize: '14px', color: '#6B5B95' }}>{t('sysSettings.back')}</span>
      </button>
      <div className="max-w-2xl mx-auto pt-10">

      {/* Title */}
      <div className="mb-10">
        <h1 className="text-3xl mb-2" style={{ fontWeight: 700, color: '#6B5B95', letterSpacing: '-0.02em' }}>
          {t('sysSettings.title')}
        </h1>
      </div>

      <div className="space-y-10">
        {/* Language Selection */}
        <div>
          <h2 className="mb-2" style={{ fontSize: '16px', fontWeight: 600, color: '#6B5B95' }}>
            {t('sysSettings.langTitle')}
          </h2>
          <p className="mb-6" style={{ fontSize: '14px', color: '#9B8FA6' }}>
            {t('sysSettings.langDesc')}
          </p>

          <div className="space-y-3">
            {SYSTEM_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className="w-full flex items-center gap-4 px-5 py-4 shadow-md transition-all hover:shadow-lg"
                style={{
                  backgroundColor: currentLang === lang.code ? '#F3EEFF' : '#FFFFFF',
                  borderRadius: '20px',
                  border: currentLang === lang.code ? '2px solid #B8A9D4' : '2px solid #E6E6FA',
                }}
              >
                <span style={{ fontSize: '28px' }}>{lang.flag}</span>
                <span style={{ fontSize: '16px', fontWeight: currentLang === lang.code ? 700 : 500, color: '#6B5B95' }}>
                  {lang.label}
                </span>
                {currentLang === lang.code && (
                  <Check className="ml-auto w-5 h-5" style={{ color: '#B8A9D4' }} />
                )}
              </button>
            ))}
          </div>
        </div>

      </div>
      </div>
    </div>
  );
}
