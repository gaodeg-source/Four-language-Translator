import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { t } from '../../i18n';
import { toast } from 'sonner';

const SANS = "'Nunito','Noto Sans KR','Zen Maru Gothic','Noto Sans SC',system-ui,sans-serif";
const MONO = "'JetBrains Mono',ui-monospace,monospace";
const ink   = '#2A1A3A';
const ink2  = '#5A4A6A';
const ink3  = '#9A8AAA';
const line  = '#EFE5F7';
const bg2   = '#FAF5FF';
const accent = '#A865E0';

function SmallBtn({ children, onClick, danger }: { children: React.ReactNode; onClick?: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick} style={{
      width: 30, height: 30, borderRadius: 8, border: 'none', background: bg2,
      color: danger ? '#E84B91' : ink2, cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {children}
    </button>
  );
}

export function Collections() {
  const navigate = useNavigate();
  const [collections, setCollections] = useState<{ input: string; output: string; id: string }[]>([]);
  const [filter, setFilter] = useState<'all' | 'formal' | 'informal'>('all');

  useEffect(() => {
    const saved = localStorage.getItem('collections');
    if (saved) { try { setCollections(JSON.parse(saved)); } catch {} }
  }, []);

  const handleRemove = (id: string) => {
    const updated = collections.filter(c => c.id !== id);
    setCollections(updated);
    localStorage.setItem('collections', JSON.stringify(updated));
    toast.success(t('chat.uncollected'));
  };

  const handleExpand = (text: string) => {
    localStorage.setItem('flashcardText', text);
    navigate('/flashcard');
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => toast.success(t('chat.copied'))).catch(() => toast.error(t('chat.copyFailed')));
  };

  const relTime = (id: string) => {
    const ts = parseInt(id, 10);
    if (!ts || isNaN(ts)) return '';
    const diff = Date.now() - ts;
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return t('collections.hoursAgo', { n: String(hours) });
    const days = Math.floor(hours / 24);
    if (days < 7) return t('collections.daysAgo', { n: String(days) });
    return t('collections.weeksAgo', { n: String(Math.floor(days / 7)) });
  };

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', background: '#FFFFFF', fontFamily: SANS }}>
      {/* Header */}
      <div style={{ background: '#FFFFFF', padding: '0 22px 0', paddingTop: 'calc(env(safe-area-inset-top) + 52px)' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', marginBottom: 12, padding: '4px 0' }}>
          <ArrowLeft size={18} style={{ color: ink2 }} />
        </button>

        <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: ink3, marginBottom: 6 }}>
          {t('collections.starredCount', { n: String(collections.length) })}
        </div>
        <h1 style={{ fontFamily: SANS, fontSize: 34, lineHeight: 1.05, fontWeight: 800, color: ink, margin: '0 0 16px', letterSpacing: '-0.02em' }}>
          {t('collections.headline')}
        </h1>

        {/* filter pills */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {(['all', 'formal', 'informal'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '6px 12px', borderRadius: 999, fontSize: 12, fontFamily: MONO, letterSpacing: '0.04em',
              border: filter === f ? 'none' : `1px solid ${line}`,
              background: filter === f ? ink : 'transparent',
              color: filter === f ? '#FFFFFF' : ink2,
              cursor: 'pointer', fontWeight: 500,
            }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 22px', paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}>
        {collections.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 80 }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={line} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 16 }}>
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            <p style={{ fontSize: 15, color: ink3, fontFamily: SANS }}>{t('chat.noCollections')}</p>
          </div>
        ) : (
          <div>
            {collections.map((c, index) => (
              <div key={c.id} style={{
                background: '#FFFFFF', border: `1px solid ${line}`, borderRadius: 18,
                padding: '14px 16px', marginBottom: 10,
                display: 'flex', flexDirection: 'column', gap: 8,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: MONO, fontSize: 10, color: ink3, letterSpacing: '0.06em' }}>
                    #{String(index + 1).padStart(2, '0')} · {relTime(c.id)}
                  </span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill={accent} stroke={ink} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                </div>
                <div style={{ fontFamily: SANS, fontSize: 20, lineHeight: 1.3, fontWeight: 800, color: ink, letterSpacing: '-0.005em' }}>
                  {c.output}
                </div>
                <div style={{ fontSize: 13, color: ink3, lineHeight: 1.4, fontFamily: SANS }}>
                  {c.input}
                </div>
                <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
                  <SmallBtn onClick={() => handleCopy(c.output)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                  </SmallBtn>
                  <SmallBtn onClick={() => handleExpand(c.output)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
                  </SmallBtn>
                  <div style={{ flex: 1 }} />
                  <SmallBtn onClick={() => handleRemove(c.id)} danger>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1.4 14.1a2 2 0 01-2 1.9H8.4a2 2 0 01-2-1.9L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                  </SmallBtn>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
