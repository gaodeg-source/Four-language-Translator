import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { t, getSystemLang } from '../../i18n';
import { toast } from 'sonner';
import { apiUrl } from '../lib/apiBase';
import { getMostRecentChatPath } from '../lib/chatHistory';
import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform();

const GOOGLE_OAUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_OAUTH_SCOPES = 'openid profile email';
const OAUTH_STATE_KEY = 'google_oauth_state';

function parseHashParams(hash: string): Record<string, string> {
  const fragment = hash.startsWith('#') ? hash.slice(1) : hash;
  const params: Record<string, string> = {};
  for (const pair of fragment.split('&')) {
    if (!pair) continue;
    const [rawKey, rawValue = ''] = pair.split('=');
    params[decodeURIComponent(rawKey)] = decodeURIComponent(rawValue);
  }
  return params;
}

function createRandomState(): string {
  const randomValues = new Uint32Array(2);
  window.crypto.getRandomValues(randomValues);
  return Array.from(randomValues).map((v) => v.toString(16)).join('');
}

function GoogleLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.227 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.953 3.047l5.657-5.657C34.046 6.053 29.27 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.953 3.047l5.657-5.657C34.046 6.053 29.27 4 24 4c-7.682 0-14.418 4.337-17.694 10.691z" />
      <path fill="#4CAF50" d="M24 44c5.167 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.152 35.091 26.715 36 24 36c-5.206 0-9.619-3.315-11.283-7.946l-6.522 5.025C9.435 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.084 5.571c.001-.001 0 0 0 0l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  );
}

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [oauthLoading, setOauthLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const currentSystemLang = getSystemLang().toUpperCase();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      if (!window.location.hash.includes('access_token') && !window.location.hash.includes('error=')) return;
      const params = parseHashParams(window.location.hash);
      window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
      if (params.error) {
        toast.error(params.error === 'access_denied' ? t('login.oauthDenied') : `${t('login.oauthFailed')}: ${params.error}`);
        return;
      }
      const savedState = localStorage.getItem(OAUTH_STATE_KEY);
      if (!params.state || !savedState || params.state !== savedState) { toast.error(t('login.oauthStateMismatch')); return; }
      localStorage.removeItem(OAUTH_STATE_KEY);
      const accessToken = params.access_token;
      if (!accessToken) { toast.error(t('login.oauthFailed')); return; }
      try {
        const goNext = async () => { const nextPath = await getMostRecentChatPath(); navigate(nextPath || '/select-language'); };
        const profileResp = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: `Bearer ${accessToken}` } });
        if (!profileResp.ok) throw new Error('Failed to fetch profile');
        const profile = await profileResp.json();
        try {
          const syncResp = await fetch(apiUrl('/api/auth/google'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ profile }) });
          if (syncResp.ok) {
            const syncData = await syncResp.json();
            if (syncData?.user?.id) localStorage.setItem('authUserId', syncData.user.id);
            localStorage.setItem('authUser', JSON.stringify(syncData?.user || {}));
          } else if (profile?.sub) { localStorage.setItem('authUserId', profile.sub); }
        } catch { if (profile?.sub) localStorage.setItem('authUserId', profile.sub); }
        localStorage.setItem('authProvider', 'google');
        localStorage.setItem('googleAccessToken', accessToken);
        localStorage.setItem('googleUser', JSON.stringify(profile));
        await goNext();
      } catch { toast.error(t('login.oauthFailed')); }
    };
    const maybeRedirectIfLoggedIn = async () => {
      if (window.location.hash.includes('access_token') || window.location.hash.includes('error=')) return;
      const userId = localStorage.getItem('authUserId');
      if (!userId) return;
      const nextPath = await getMostRecentChatPath();
      navigate(nextPath || '/select-language');
    };
    void handleOAuthCallback();
    void maybeRedirectIfLoggedIn();
  }, [navigate]);

  const handleGoogleOAuth = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI || window.location.origin + '/';
    if (!clientId) { toast.error(t('login.oauthMissingClientId')); return; }
    const state = createRandomState();
    localStorage.setItem(OAUTH_STATE_KEY, state);
    setOauthLoading(true);
    const authUrl = new URL(GOOGLE_OAUTH_ENDPOINT);
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'token');
    authUrl.searchParams.set('scope', GOOGLE_OAUTH_SCOPES);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('include_granted_scopes', 'true');
    authUrl.searchParams.set('prompt', 'select_account');
    window.location.assign(authUrl.toString());
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const run = async () => {
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail || !password) { toast.error(t('login.validationRequired')); return; }
      setLoginLoading(true);
      try {
        const resp = await fetch(apiUrl('/api/auth/login'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: normalizedEmail, password }) });
        const data = await resp.json();
        if (!resp.ok) { toast.error(data?.error || t('login.invalidCredentials')); return; }
        localStorage.setItem('authProvider', 'password');
        localStorage.setItem('authUserId', data.user.id);
        localStorage.setItem('authUser', JSON.stringify(data.user));
        const nextPath = await getMostRecentChatPath();
        navigate(nextPath || '/select-language');
      } catch { toast.error(t('login.loginFailed')); }
      finally { setLoginLoading(false); }
    };
    run();
  };

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', background: '#FFFFFF', paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)', fontFamily: "'Nunito','Noto Sans KR','Zen Maru Gothic','Noto Sans SC',system-ui,sans-serif" }}>
      <div style={{ flex: 1, padding: '60px 24px 16px', display: 'flex', flexDirection: 'column', gap: 28 }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 10, color: '#9A8AAA', letterSpacing: '0.08em', textTransform: 'uppercase' }}>beep · 2026</span>
          <button
            onClick={() => navigate('/system-settings')}
            style={{ background: '#FAF5FF', border: '1px solid #EFE5F7', borderRadius: 999, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#5A4A6A', cursor: 'pointer', fontFamily: 'Nunito' }}
          >
            🌐 {currentSystemLang}
          </button>
        </div>

        <div>
          <div style={{ fontSize: 64, lineHeight: 0.95, fontWeight: 800, color: '#2A1A3A', letterSpacing: '-0.04em', marginBottom: 18, fontFamily: "'Nunito', sans-serif", display: 'flex', alignItems: 'baseline' }}>
            beep
            <span style={{ display: 'inline-flex', gap: 3, marginLeft: 4, alignItems: 'flex-end', paddingBottom: 6 }}>
              <span style={{ width: 3, height: 9, borderRadius: 2, background: '#FFC93C', transform: 'rotate(-20deg)', display: 'inline-block' }} />
              <span style={{ width: 3, height: 11, borderRadius: 2, background: '#FFC93C', display: 'inline-block' }} />
              <span style={{ width: 3, height: 9, borderRadius: 2, background: '#FFC93C', transform: 'rotate(20deg)', display: 'inline-block' }} />
            </span>
          </div>
          <p style={{ fontSize: 15, color: '#5A4A6A', maxWidth: 260, lineHeight: 1.45, fontWeight: 500 }}>
            {t('login.subtitle')}
          </p>
          <div style={{ display: 'flex', gap: 8, marginTop: 22, flexWrap: 'wrap' }}>
            {[{ label: '中文', active: true }, { label: '한국어' }, { label: 'English' }, { label: '日本語' }].map((l, i) => (
              <span key={i} style={{ fontSize: 14, padding: '6px 12px', borderRadius: 999, background: l.active ? '#A865E0' : '#FAF5FF', color: l.active ? '#fff' : '#2A1A3A', fontWeight: 600 }}>{l.label}</span>
            ))}
          </div>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #EFE5F7', borderRadius: 14, padding: '8px 14px' }}>
            <div style={{ fontSize: 9, color: '#9A8AAA', fontFamily: 'monospace', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>email</div>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontFamily: "'Nunito', sans-serif", fontSize: 15, color: '#2A1A3A', boxSizing: 'border-box' }} />
          </div>
          <div style={{ background: '#FFFFFF', border: '1px solid #EFE5F7', borderRadius: 14, padding: '8px 14px' }}>
            <div style={{ fontSize: 9, color: '#9A8AAA', fontFamily: 'monospace', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>password</div>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontFamily: "'Nunito', sans-serif", fontSize: 15, color: '#2A1A3A', boxSizing: 'border-box' }} />
          </div>

          <button type="submit" disabled={loginLoading} style={{ marginTop: 6, height: 56, padding: '0 8px 0 22px', border: 'none', borderRadius: 16, background: '#2A1A3A', color: '#FFFFFF', fontFamily: "'Nunito', sans-serif", fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', opacity: loginLoading ? 0.7 : 1 }}>
            {loginLoading ? '…' : t('login.button')}
            <span style={{ width: 40, height: 40, borderRadius: 12, background: '#A865E0', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>→</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '2px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#EFE5F7' }} />
            <span style={{ fontSize: 11, color: '#9A8AAA', fontFamily: 'monospace' }}>{t('login.socialHint')}</span>
            <div style={{ flex: 1, height: 1, background: '#EFE5F7' }} />
          </div>

          {!isNative && (
            <button type="button" onClick={handleGoogleOAuth} disabled={oauthLoading || loginLoading} style={{ height: 46, border: '1px solid #EFE5F7', borderRadius: 14, background: '#FFFFFF', display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'center', color: '#2A1A3A', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'Nunito', sans-serif" }}>
              <GoogleLogo />
              {t('login.googleButton')}
            </button>
          )}

          <div style={{ textAlign: 'center', marginTop: 4 }}>
            <button type="button" onClick={() => navigate('/register')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#2A1A3A', fontWeight: 700, borderBottom: '1px solid #2A1A3A', padding: 0, fontFamily: "'Nunito', sans-serif" }}>
              {t('login.createAccount')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
