import { useNavigate } from 'react-router';
import { useState, useRef } from 'react';
import { ArrowLeft, Mic, Check } from 'lucide-react';
import { t, getSystemLang } from '../../i18n';
import { toast } from 'sonner';
import { apiUrl } from '../lib/apiBase';

type Lang = 'en' | 'cn' | 'kr' | 'jp';

const DEMO_TEXT: Record<Lang, string> = {
  cn: '你好，很高兴认识你',
  en: 'Hi, nice to meet you',
  kr: '안녕하세요, 만나서 반갑습니다',
  jp: 'こんにちは、はじめまして',
};

export const VOICES = [
  { id: '', label: { cn: '默认（根据语气自动）', en: 'Default (auto by tone)', kr: '기본값 (어조에 따라 자동)', jp: 'デフォルト（トーンに応じて自動）' } },
  { id: 'alloy', label: { cn: '中性 · 自然平衡', en: 'Neutral · Natural', kr: '중성 · 자연스러운', jp: '中性 · ナチュラル' } },
  { id: 'ash', label: { cn: '男声 · 温和稳重', en: 'Male · Warm & Steady', kr: '남성 · 차분한', jp: '男性 · 穏やか' } },
  { id: 'coral', label: { cn: '女声 · 温暖亲切', en: 'Female · Warm & Friendly', kr: '여성 · 따뜻한', jp: '女性 · 温かい' } },
  { id: 'echo', label: { cn: '男声 · 低沉磁性', en: 'Male · Deep & Rich', kr: '남성 · 깊은', jp: '男性 · 低く深い' } },
  { id: 'fable', label: { cn: '中性 · 叙事风格', en: 'Neutral · Narrative', kr: '중성 · 서사적', jp: '中性 · 物語風' } },
  { id: 'nova', label: { cn: '女声 · 活泼明亮', en: 'Female · Lively & Bright', kr: '여성 · 활기찬', jp: '女性 · 明るい' } },
  { id: 'onyx', label: { cn: '男声 · 深沉有力', en: 'Male · Deep & Powerful', kr: '남성 · 강한', jp: '男性 · 力強い' } },
  { id: 'sage', label: { cn: '中性 · 沉静知性', en: 'Neutral · Calm & Wise', kr: '중성 · 지적인', jp: '中性 · 知的' } },
  { id: 'shimmer', label: { cn: '女声 · 柔和细腻', en: 'Female · Soft & Gentle', kr: '여성 · 부드러운', jp: '女性 · 柔らかい' } },
];

export function getVoiceLabel(voiceId: string, lang: string): string {
  const v = VOICES.find(v => v.id === voiceId);
  const l = (lang || 'cn') as Lang;
  return v ? (v.label[l] || v.label.en) : (VOICES[0].label[l] || VOICES[0].label.en);
}

export function VoiceSelect() {
  const navigate = useNavigate();
  const lang = (getSystemLang() || 'cn') as Lang;
  const [selected, setSelected] = useState(() => localStorage.getItem('_pendingVoice') || '');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleSelect = (voiceId: string) => {
    setSelected(voiceId);
    localStorage.setItem('_pendingVoice', voiceId);
    navigate(-1);
  };

  const handleDemo = async (voiceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!voiceId) return;
    if (playingId === voiceId) return;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlayingId(voiceId);
    try {
      const res = await fetch(apiUrl('/api/tts'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: DEMO_TEXT[lang] || DEMO_TEXT.en,
          targetLang: lang,
          voice: voiceId,
        }),
      });
      if (!res.ok) throw new Error('TTS failed');
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

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#FFFBF5' }}>
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-6 py-4" style={{ borderBottom: '1px solid #E6E6FA', backgroundColor: '#FFFBF5' }}>
        <button onClick={() => navigate(-1)} className="p-2 transition-opacity hover:opacity-60">
          <ArrowLeft className="w-5 h-5" style={{ color: '#6B5B95' }} />
        </button>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#6B5B95' }}>{t('settings.voice')}</h1>
      </div>

      {/* Voice List */}
      <div className="flex-1 overflow-y-auto pt-16">
        <div className="max-w-2xl mx-auto px-6 md:px-12 lg:px-24 py-6 space-y-3">
          {VOICES.map((v) => (
            <button
              key={v.id}
              onClick={() => handleSelect(v.id)}
              className="w-full flex items-center gap-3 p-4 transition-all"
              style={{
                backgroundColor: selected === v.id ? '#E6E6FA' : '#FFFFFF',
                borderRadius: '16px',
                border: selected === v.id ? '2px solid #B8A9D4' : '2px solid transparent',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }}
            >
              {/* Check circle */}
              <div
                className="w-6 h-6 flex items-center justify-center flex-shrink-0"
                style={{
                  borderRadius: '50%',
                  border: selected === v.id ? 'none' : '2px solid #D4C4E8',
                  backgroundColor: selected === v.id ? '#B8A9D4' : 'transparent',
                }}
              >
                {selected === v.id && <Check className="w-3.5 h-3.5 text-white" />}
              </div>

              {/* Label */}
              <span
                className="flex-1 text-left"
                style={{ fontSize: '15px', fontWeight: selected === v.id ? 600 : 400, color: '#6B5B95' }}
              >
                {v.label[lang]}
              </span>

              {/* Demo mic */}
              {v.id && (
                <button
                  onClick={(e) => handleDemo(v.id, e)}
                  className="p-2 flex-shrink-0 transition-opacity hover:opacity-60"
                  disabled={playingId === v.id}
                >
                  <Mic className="w-4 h-4" style={{ color: playingId === v.id ? '#E8A838' : '#9B8FA6' }} />
                </button>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
