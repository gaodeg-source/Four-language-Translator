import React from 'react';
import { t } from '../i18n';

const VIBE_OPTIONS_EN = [
  { key: 'friendly', labelKey: 'tone.en.vibe.friendly' },
  { key: 'professional', labelKey: 'tone.en.vibe.professional' },
  { key: 'witty', labelKey: 'tone.en.vibe.witty' },
  { key: 'concise', labelKey: 'tone.en.vibe.concise' },
];

interface ToneSettingsENProps {
  isFormal: boolean;
  setIsFormal: (val: boolean) => void;
  vibes: string[];
  setVibes: (val: string[]) => void;
  personaPrompt: string;
  setPersonaPrompt: (val: string) => void;
}

export const ToneSettingsEN: React.FC<ToneSettingsENProps> = ({
  isFormal,
  setIsFormal,
  vibes,
  setVibes,
  personaPrompt,
  setPersonaPrompt,
}) => {
  const handleVibeToggle = (vibe: string) => {
    if (vibes.includes(vibe)) {
      setVibes(vibes.filter(v => v !== vibe));
    } else {
      setVibes([...vibes, vibe]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Formal/Informal Toggle */}
      <div className="flex items-center gap-4">
        <span
          className={`font-medium text-gray-700 cursor-pointer ${!isFormal ? 'text-purple-700' : ''}`}
          onClick={() => setIsFormal(false)}
        >
          {t('tone.en.informal')}
        </span>
        <button
          type="button"
          className="relative w-14 h-7 rounded-full focus:outline-none"
          onClick={() => setIsFormal(!isFormal)}
          aria-label="Toggle Formal/Informal"
        >
          <span
            className={`absolute inset-0 transition-colors duration-300 ${isFormal ? 'bg-purple-500' : 'bg-gray-300'} rounded-full`}
          />
          <span
            className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-300 ${isFormal ? 'translate-x-7' : 'translate-x-1'}`}
          />
        </button>
        <span
          className={`font-medium text-gray-700 cursor-pointer ${isFormal ? 'text-purple-700' : ''}`}
          onClick={() => setIsFormal(true)}
        >
          {t('tone.en.formal')}
        </span>
      </div>

      {/* Vibes Chips */}
      <div>
        <span className="font-medium text-gray-700 mb-2 block">{t('tone.vibes')}</span>
        <div className="flex flex-wrap gap-2">
          {VIBE_OPTIONS_EN.map(vibe => (
            <button
              key={vibe.key}
              type="button"
              className={`px-3 py-1 rounded-full border text-sm transition-colors ${vibes.includes(vibe.key) ? 'bg-purple-200 border-purple-400 text-purple-700' : 'bg-gray-100 border-gray-300 text-gray-700'}`}
              onClick={() => handleVibeToggle(vibe.key)}
            >
              {t(vibe.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Persona Textarea */}
      <div>
        <span className="font-medium text-gray-700 mb-2 block">{t('tone.persona')}</span>
        <textarea
          className="w-full min-h-[80px] p-3 border border-gray-300 rounded-lg focus:border-purple-400 focus:ring-1 focus:ring-purple-200 text-gray-700 bg-white"
          placeholder={t('tone.personaPlaceholder')}
          value={personaPrompt}
          onChange={e => setPersonaPrompt(e.target.value)}
        />
      </div>
    </div>
  );
};
