import { useState } from 'react';
import { useNavigate } from 'react-router';
import { t } from '../../i18n';

const SANS = "'Nunito','Noto Sans KR','Zen Maru Gothic','Noto Sans SC',system-ui,sans-serif";
const MONO = "'JetBrains Mono',ui-monospace,monospace";

const LANGS: Record<string, { name: string; latin: string; code: string; hello: string }> = {
  cn: { name: '中文',   latin: 'Chinese',  code: 'CN', hello: '你好' },
  kr: { name: '한국어', latin: 'Korean',   code: 'KO', hello: '안녕' },
  en: { name: 'English', latin: 'English', code: 'EN', hello: 'Hello' },
  jp: { name: '日本語', latin: 'Japanese', code: 'JP', hello: 'こんにちは' },
};
const CODES = ['cn', 'kr', 'en', 'jp'];

const SETUP_ROUTES: Record<string, string> = { kr: '/setup', en: '/setup-en', jp: '/setup-jp', cn: '/setup' };
function getSetupRoute(source: string, target: string) {
  if (target === 'cn') {
    if (source === 'kr') return '/setup';
    if (source === 'en') return '/setup-en';
    if (source === 'jp') return '/setup-jp';
  }
  return SETUP_ROUTES[target] || '/setup';
}

const ink   = '#2A1A3A';
const ink2  = '#5A4A6A';
const ink3  = '#9A8AAA';
const line  = '#EFE5F7';
const bg2   = '#FAF5FF';
const accent = '#A865E0';

function LangPill({ langCode, label }: { langCode: string; label: string }) {
  const l = LANGS[langCode];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingRight: 50, minHeight: 72 }}>
      <div style={{
        width: 56, height: 56, borderRadius: 18, background: bg2, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: SANS, fontSize: 24, fontWeight: 800, color: ink,
      }}>
        {l.hello.slice(0, 1)}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: ink3 }}>{label}</span>
        <div style={{ fontSize: 20, fontWeight: 600, color: ink, letterSpacing: '-0.01em', fontFamily: SANS }}>{l.name}</div>
        <div style={{ fontFamily: MONO, fontSize: 11, color: ink3, letterSpacing: '0.08em' }}>
          {l.latin.toUpperCase()} · {l.code}
        </div>
      </div>
    </div>
  );
}

export function LanguageSelect() {
  const navigate = useNavigate();
  const [source, setSource] = useState('cn');
  const [target, setTarget] = useState('kr');

  const cycleSource = () => {
    const next = CODES.filter(c => c !== target);
    const idx = next.indexOf(source);
    setSource(next[(idx + 1) % next.length]);
  };
  const cycleTarget = () => {
    const next = CODES.filter(c => c !== source);
    const idx = next.indexOf(target);
    setTarget(next[(idx + 1) % next.length]);
  };
  const swap = () => { const s = source; setSource(target); setTarget(s); };

  const handleContinue = () => {
    if (source === target) return;
    localStorage.setItem('selectedDirection', JSON.stringify({ sourceLang: source, targetLang: target }));
    const recentRaw = localStorage.getItem('recentPairs');
    const recent: { sourceLang: string; targetLang: string }[] = recentRaw ? (() => { try { return JSON.parse(recentRaw); } catch { return []; } })() : [];
    const filtered = recent.filter(p => !(p.sourceLang === source && p.targetLang === target));
    localStorage.setItem('recentPairs', JSON.stringify([{ sourceLang: source, targetLang: target }, ...filtered].slice(0, 4)));
    navigate(getSetupRoute(source, target));
  };

  const recentRaw = localStorage.getItem('recentPairs');
  const recentPairs: { sourceLang: string; targetLang: string }[] = recentRaw ? (() => { try { return JSON.parse(recentRaw); } catch { return []; } })() : [];
  const quickPairs = recentPairs.length > 0
    ? recentPairs
    : [{ sourceLang: 'cn', targetLang: 'kr' }, { sourceLang: 'en', targetLang: 'jp' }, { sourceLang: 'cn', targetLang: 'en' }];

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', background: '#FFFFFF', fontFamily: SANS }}>
      <div style={{ flex: 1, padding: '0 24px 24px', paddingTop: 'calc(env(safe-area-inset-top) + 52px)', display: 'flex', flexDirection: 'column' }}>

        <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: ink3, marginBottom: 8 }}>
          {t('langSelect.step')}
        </div>
        <h1 style={{ fontFamily: SANS, fontSize: 38, lineHeight: 1.05, fontWeight: 800, color: ink, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
          {t('langSelect.headline')}
        </h1>
        <p style={{ fontSize: 14, color: ink2, lineHeight: 1.5, margin: '0 0 24px' }}>
          {t('langSelect.desc')}
        </p>

        {/* FROM / TO card */}
        <div style={{
          background: '#FFFFFF', border: `1px solid ${line}`, borderRadius: 24, padding: 18,
          position: 'relative',
          boxShadow: '0 1px 0 rgba(42,26,58,.03), 0 6px 20px rgba(42,26,58,.04)',
        }}>
          <button onClick={cycleSource} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', width: '100%', textAlign: 'left' }}>
            <LangPill langCode={source} label={t('langSelect.from')} />
          </button>

          <div style={{ height: 1, background: line, margin: '14px -18px' }} />

          <button onClick={cycleTarget} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', width: '100%', textAlign: 'left' }}>
            <LangPill langCode={target} label={t('langSelect.to')} />
          </button>

          {/* swap button */}
          <button onClick={swap} style={{
            position: 'absolute', right: 18, top: 'calc(50% - 18px)',
            width: 36, height: 36, borderRadius: 18, border: `1px solid ${line}`,
            background: accent, color: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 2px 6px ${accent}55`,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="7 17 3 13 7 9"/><line x1="3" y1="13" x2="21" y2="13"/>
              <polyline points="17 7 21 11 17 15"/><line x1="21" y1="11" x2="3" y2="11"/>
            </svg>
          </button>
        </div>

        {/* Quick pairs */}
        <div style={{ marginTop: 22 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', color: ink3, marginBottom: 10 }}>
            {t('langSelect.recentPairs')}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {quickPairs.slice(0, 4).map((pair, i) => {
              const active = pair.sourceLang === source && pair.targetLang === target;
              return (
                <button key={i}
                  onClick={() => { setSource(pair.sourceLang); setTarget(pair.targetLang); }}
                  style={{
                    padding: '8px 14px', borderRadius: 999,
                    background: active ? ink : bg2,
                    color: active ? '#FFFFFF' : ink2,
                    border: 'none', cursor: 'pointer', fontFamily: MONO, fontSize: 12,
                    letterSpacing: '0.06em', display: 'inline-flex', alignItems: 'center', gap: 6,
                  }}>
                  {LANGS[pair.sourceLang].code} → {LANGS[pair.targetLang].code}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ flex: 1 }} />

        <button
          onClick={handleContinue}
          disabled={source === target}
          style={{
            width: '100%', height: 56, padding: '0 8px 0 22px', border: 'none', borderRadius: 16,
            background: ink, color: '#FFFFFF', fontFamily: SANS, fontSize: 15, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            cursor: source === target ? 'not-allowed' : 'pointer',
            opacity: source === target ? 0.5 : 1,
            marginBottom: 'calc(env(safe-area-inset-bottom) + 0.5rem)',
          }}>
          {t('langSelect.continue')}
          <span style={{
            width: 40, height: 40, borderRadius: 12, background: accent, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </span>
        </button>
      </div>
    </div>
  );
}
