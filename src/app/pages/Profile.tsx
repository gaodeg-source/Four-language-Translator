import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { t } from '../../i18n';
import { apiUrl } from '../lib/apiBase';

const SANS  = "'Nunito','Noto Sans KR','Zen Maru Gothic','Noto Sans SC',system-ui,sans-serif";
const MONO  = "'JetBrains Mono',ui-monospace,monospace";
const ink   = '#2A1A3A';
const ink2  = '#5A4A6A';
const ink3  = '#9A8AAA';
const line  = '#EFE5F7';
const bg2   = '#FAF5FF';
const accent = '#A865E0';

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: ink3, marginBottom: 10 }}>{children}</div>;
}

function Tile({ icon, title, sub, onClick }: { icon: React.ReactNode; title: string; sub: string; onClick?: () => void }) {
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
      background: '#FFFFFF', border: `1px solid ${line}`, borderRadius: 14, marginBottom: 8,
      cursor: 'pointer',
    }}>
      <span style={{ color: ink2, display: 'flex' }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: ink, fontFamily: SANS }}>{title}</div>
        <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.06em', color: ink3, marginTop: 2 }}>{sub}</div>
      </div>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ink3} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div style={{
      flex: 1, borderRadius: 16, padding: '14px',
      background: highlight ? accent : bg2,
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', color: highlight ? 'rgba(255,255,255,.8)' : ink3 }}>{label}</div>
      <div style={{ fontFamily: SANS, fontSize: 28, fontWeight: 800, color: highlight ? '#fff' : ink, lineHeight: 1, letterSpacing: '-0.02em' }}>{value}</div>
    </div>
  );
}

export function Profile() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [resolvedUserId, setResolvedUserId] = useState('');
  const [chatCount, setChatCount] = useState(0);

  useEffect(() => {
    const hydrateGoogleSessionIfNeeded = async (): Promise<string> => {
      const existingUserId = localStorage.getItem('authUserId') || '';
      if (existingUserId) return existingUserId;
      const rawGoogleUser = localStorage.getItem('googleUser');
      if (!rawGoogleUser) return '';
      try {
        const profile = JSON.parse(rawGoogleUser);
        if (!profile?.sub) return '';
        localStorage.setItem('authUserId', profile.sub);
        const syncResp = await fetch(apiUrl('/api/auth/google'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ profile }) });
        if (syncResp.ok) {
          const syncData = await syncResp.json();
          if (syncData?.user?.id) { localStorage.setItem('authUserId', syncData.user.id); localStorage.setItem('authUser', JSON.stringify(syncData.user)); return syncData.user.id; }
        }
        return profile.sub;
      } catch { return ''; }
    };

    const loadProfile = async () => {
      const userId = await hydrateGoogleSessionIfNeeded();
      if (!userId) { navigate('/'); return; }
      setResolvedUserId(userId);
      const chatList = JSON.parse(localStorage.getItem('chatList') || '[]');
      setChatCount(chatList.length);
      try {
        const resp = await fetch(apiUrl(`/api/auth/profile?userId=${encodeURIComponent(userId)}`));
        const data = await resp.json();
        if (!resp.ok) throw new Error(data?.error || 'Load profile failed');
        setEmail(data.user.email || '');
        setUsername(data.user.username || data.user.name || '');
        localStorage.setItem('authUser', JSON.stringify(data.user));
      } catch { toast.error(t('profile.loadFailed')); }
    };
    void loadProfile();
  }, [navigate]);

  const handleSave = async () => {
    const userId = resolvedUserId || localStorage.getItem('authUserId') || '';
    const nextUsername = username.trim();
    if (!userId || !nextUsername) { toast.error(t('profile.validationRequired')); return; }
    setLoading(true);
    try {
      const resp = await fetch(apiUrl('/api/auth/profile'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, username: nextUsername }) });
      const data = await resp.json();
      if (!resp.ok) { toast.error(data?.error || t('profile.updateFailed')); return; }
      localStorage.setItem('authUser', JSON.stringify(data.user));
      setUsername(data.user.username || nextUsername);
      toast.success(t('profile.updateSuccess'));
    } catch { toast.error(t('profile.updateFailed')); }
    finally { setLoading(false); }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/'); };

  const initials = username ? username.slice(0, 1).toUpperCase() : '?';
  const collections = JSON.parse(localStorage.getItem('collections') || '[]');

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', background: '#FFFFFF', fontFamily: SANS }}>
      <div style={{ padding: '0 22px', paddingTop: 'calc(env(safe-area-inset-top) + 52px)', marginBottom: 4 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '8px 0', marginBottom: 8 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ink2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '0 22px 22px', paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}>
        <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: ink3, marginBottom: 16 }}>
          {t('profile.meta')}
        </div>

        {/* avatar + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '0 0 24px' }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              width: 76, height: 76, borderRadius: 24, background: accent,
              color: '#fff', fontSize: 36, fontWeight: 800, fontFamily: SANS,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {initials}
            </div>
            <button style={{
              position: 'absolute', right: -4, bottom: -4, width: 26, height: 26, borderRadius: 13,
              border: '2px solid #FFFFFF', background: ink, color: '#FFFFFF', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
            </button>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: SANS, fontSize: 26, fontWeight: 800, color: ink, letterSpacing: '-0.01em', marginBottom: 2 }}>
              {username || '—'}
            </div>
            <div style={{ fontSize: 13, color: ink3 }}>{email}</div>
          </div>
        </div>

        {/* stats */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <Stat label={t('profile.chats')} value={chatCount} highlight />
          <Stat label={t('profile.translated')} value="—" />
          <Stat label={t('profile.starred')} value={collections.length} />
        </div>

        {/* username edit */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', color: ink3, marginBottom: 6 }}>{t('profile.username')}</div>
          <div style={{ background: '#FFFFFF', border: `1px solid ${line}`, borderRadius: 14, padding: '10px 14px', display: 'flex', alignItems: 'center', marginBottom: 10 }}>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)}
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: SANS, fontSize: 15, color: ink }} />
          </div>
          <button onClick={handleSave} disabled={loading} style={{
            width: '100%', height: 48, padding: '0 8px 0 22px', border: 'none', borderRadius: 14,
            background: ink, color: '#FFFFFF', fontFamily: SANS, fontSize: 14, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', opacity: loading ? 0.7 : 1,
          }}>
            {t('profile.save')}
            <span style={{ width: 34, height: 34, borderRadius: 10, background: accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </span>
          </button>
        </div>

        {/* tiles */}
        <SectionLabel>activity</SectionLabel>
        <Tile
          onClick={() => navigate('/collections')}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>}
          title={t('chat.collection')}
          sub={`${collections.length} saved`}
        />

        <SectionLabel>preferences</SectionLabel>
        <Tile
          onClick={() => navigate('/system-settings')}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.6 9a1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9z"/></svg>}
          title={t('sysSettings.title')}
          sub="interface · language"
        />

        <button onClick={handleLogout} style={{
          marginTop: 10, width: '100%', height: 48, borderRadius: 14,
          background: 'transparent', border: `1px solid ${line}`, color: ink3,
          fontFamily: SANS, fontSize: 14, fontWeight: 500, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          {t('profile.logOut')}
        </button>
      </div>
    </div>
  );
}
