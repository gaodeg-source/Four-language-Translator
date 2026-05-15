import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { t } from '../../i18n';

const SANS = "'Nunito','Noto Sans KR','Zen Maru Gothic','Noto Sans SC',system-ui,sans-serif";
const MONO = "'JetBrains Mono',ui-monospace,monospace";
const accent = '#A865E0';

export function Flashcard() {
  const navigate = useNavigate();
  const [text] = useState(localStorage.getItem('flashcardText') || '한국어');

  const handleSave = async () => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      canvas.width = 1080;
      canvas.height = 1920;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#2A1A3A';
      ctx.font = `bold 140px ${SANS}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const maxWidth = canvas.width - 160;
      const lineHeight = 160;
      const chars = text.split('');
      let line = '';
      const lines: string[] = [];
      for (const ch of chars) {
        const test = line + ch;
        if (ctx.measureText(test).width > maxWidth && line !== '') { lines.push(line); line = ch; }
        else { line = test; }
      }
      lines.push(line);
      const startY = (canvas.height - (lines.length - 1) * lineHeight) / 2;
      lines.forEach((l, i) => ctx.fillText(l, canvas.width / 2, startY + i * lineHeight));
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.download = `flashcard-${Date.now()}.png`;
        a.href = url;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(t('flashcard.saved'));
      }, 'image/png');
    } catch { toast.error(t('flashcard.saveFailed')); }
  };

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: '#FFFFFF', fontFamily: SANS, position: 'relative',
    }}>
      {/* top actions */}
      <div style={{
        position: 'absolute', top: 'calc(env(safe-area-inset-top) + 52px)', left: 16, right: 16,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10,
      }}>
        <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(42,26,58,.5)' }}>
          flashcard
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleSave} style={{
            width: 38, height: 38, borderRadius: 12, border: 'none',
            background: 'rgba(42,26,58,.08)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2A1A3A',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </button>
          <button onClick={() => navigate(-1)} style={{
            width: 38, height: 38, borderRadius: 12, border: 'none',
            background: accent, color: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>

      {/* big centered text */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '0 24px', textAlign: 'center',
      }}>
        <div style={{
          fontFamily: SANS, fontSize: 60, lineHeight: 1.15, fontWeight: 600,
          color: '#2A1A3A', letterSpacing: '-0.02em',
          wordBreak: 'break-word',
        }}>
          {text}
        </div>
      </div>

      <div style={{ textAlign: 'center', paddingBottom: 'calc(env(safe-area-inset-bottom) + 2rem)' }}>
        <p style={{ fontSize: 12, color: 'rgba(42,26,58,.4)', fontFamily: MONO, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {t('flashcard.hint')}
        </p>
      </div>
    </div>
  );
}
