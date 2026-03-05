import React from 'react';
import { t } from '../i18n';

const VIBE_OPTIONS = [
  { key: 'aegyo', labelKey: 'tone.kr.vibe.aegyo' },
  { key: 'flirty', labelKey: 'tone.kr.vibe.flirty' },
  { key: 'jujeop', labelKey: 'tone.kr.vibe.jujeop' },
  { key: 'rush', labelKey: 'tone.kr.vibe.rush' },
];

interface ToneSettingsUIProps {
  isPolite: boolean;
  setIsPolite: (val: boolean) => void;
  vibes: string[];
  setVibes: (val: string[]) => void;
  personaPrompt: string;
  setPersonaPrompt: (val: string) => void;
}

export const ToneSettingsUI: React.FC<ToneSettingsUIProps> = ({
  isPolite,
  setIsPolite,
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
      {/* Polite/Casual Toggle - Modern Switch */}
      <div className="flex items-center gap-4">
        {/* Casual label */}
        <span
          className={`font-medium text-gray-700 cursor-pointer ${!isPolite ? 'text-purple-700' : ''}`}
          onClick={() => setIsPolite(false)}
        >
          {t('tone.kr.casual')}
        </span>
        {/* Toggle Switch */}
        <button
          type="button"
          className="relative w-14 h-7 rounded-full focus:outline-none"
          onClick={() => setIsPolite(!isPolite)}
          aria-label="Toggle Polite/Casual"
        >
          <span
            className={`absolute inset-0 transition-colors duration-300 ${isPolite ? 'bg-purple-500' : 'bg-gray-300'} rounded-full`}
          />
          <span
            className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-300 ${isPolite ? 'translate-x-7' : 'translate-x-1'}`}
          />
        </button>
        {/* Polite label */}
        <span
          className={`font-medium text-gray-700 cursor-pointer ${isPolite ? 'text-purple-700' : ''}`}
          onClick={() => setIsPolite(true)}
        >
          {t('tone.kr.polite')}
        </span>
      </div>

      {/* Vibes Chips */}
      <div>
        <span className="font-medium text-gray-700 mb-2 block">{t('tone.vibes')}</span>
        <div className="flex flex-wrap gap-2">
          {VIBE_OPTIONS.map(vibe => (
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
