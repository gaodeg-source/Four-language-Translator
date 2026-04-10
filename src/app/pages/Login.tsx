import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Heart, Languages } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { t } from '../../i18n';
import { toast } from 'sonner';
import { apiUrl } from '../lib/apiBase';
import { getMostRecentChatPath } from '../lib/chatHistory';

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

  useEffect(() => {
    const handleOAuthCallback = async () => {
      if (!window.location.hash.includes('access_token') && !window.location.hash.includes('error=')) {
        return;
      }

      const params = parseHashParams(window.location.hash);
      window.history.replaceState({}, document.title, window.location.pathname + window.location.search);

      if (params.error) {
        toast.error(params.error === 'access_denied' ? t('login.oauthDenied') : `${t('login.oauthFailed')}: ${params.error}`);
        return;
      }

      const savedState = localStorage.getItem(OAUTH_STATE_KEY);
      if (!params.state || !savedState || params.state !== savedState) {
        toast.error(t('login.oauthStateMismatch'));
        return;
      }
      localStorage.removeItem(OAUTH_STATE_KEY);

      const accessToken = params.access_token;
      if (!accessToken) {
        toast.error(t('login.oauthFailed'));
        return;
      }

      try {
        const goNext = async () => {
          const nextPath = await getMostRecentChatPath();
          navigate(nextPath || '/select-language');
        };

        const profileResp = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (!profileResp.ok) throw new Error('Failed to fetch profile');
        const profile = await profileResp.json();

        try {
          const syncResp = await fetch(apiUrl('/api/auth/google'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ profile }),
          });
          if (syncResp.ok) {
            const syncData = await syncResp.json();
            if (syncData?.user?.id) {
              localStorage.setItem('authUserId', syncData.user.id);
            }
          }
        } catch {
          // Keep login usable even if DB sync is temporarily unavailable.
        }

        localStorage.setItem('authProvider', 'google');
        localStorage.setItem('googleAccessToken', accessToken);
        localStorage.setItem('googleUser', JSON.stringify(profile));
        await goNext();
      } catch {
        toast.error(t('login.oauthFailed'));
      }
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

    if (!clientId) {
      toast.error(t('login.oauthMissingClientId'));
      return;
    }

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
      if (!normalizedEmail || !password) {
        toast.error(t('login.validationRequired'));
        return;
      }

      setLoginLoading(true);
      try {
        const resp = await fetch(apiUrl('/api/auth/login'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: normalizedEmail, password }),
        });
        const data = await resp.json();
        if (!resp.ok) {
          toast.error(data?.error || t('login.invalidCredentials'));
          return;
        }

        localStorage.setItem('authProvider', 'password');
        localStorage.setItem('authUserId', data.user.id);
        localStorage.setItem('authUser', JSON.stringify(data.user));
        const nextPath = await getMostRecentChatPath();
        navigate(nextPath || '/select-language');
      } catch {
        toast.error(t('login.loginFailed'));
      } finally {
        setLoginLoading(false);
      }
    };
    run();
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center px-6 relative"
      style={{
        background: 'linear-gradient(135deg, #E6E6FA 0%, #FFFBF5 100%)',
      }}
    >
      {/* Interface Language Button */}
      <button
        onClick={() => navigate('/system-settings')}
        className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2.5 shadow-md transition-transform hover:scale-105"
        style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '2px solid #E6E6FA' }}
        aria-label={t('sysSettings.langTitle')}
      >
        <Languages className="w-5 h-5 shrink-0" style={{ color: '#6B5B95' }} />
        <span className="text-sm font-medium whitespace-nowrap" style={{ color: '#6B5B95' }}>{t('sysSettings.langTitle')}</span>
      </button>

      {/* Logo & Welcome */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 mb-4" style={{ 
          backgroundColor: '#FFD1DC',
          borderRadius: '24px',
        }}>
          <Heart className="w-10 h-10" style={{ color: '#E6E6FA', fill: '#E6E6FA' }} />
        </div>
        <h1 className="text-3xl mb-2" style={{ 
          fontWeight: 700,
          color: '#6B5B95',
          letterSpacing: '-0.02em'
        }}>
          {t('login.title')}
        </h1>
        <p className="text-base" style={{ color: '#9B8FA6' }}>
          {t('login.subtitle')}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
        <div>
          <Input
            type="email"
            placeholder={t('login.email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-14 px-5 border-0 shadow-md"
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              fontSize: '16px',
              color: '#6B5B95',
            }}
            required
          />
        </div>
        <div>
          <Input
            type="password"
            placeholder={t('login.password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-14 px-5 border-0 shadow-md"
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              fontSize: '16px',
              color: '#6B5B95',
            }}
            required
          />
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            disabled={loginLoading}
            className="w-full h-14 border-0 shadow-lg"
            style={{
              backgroundColor: '#B8A9D4',
              color: '#FFFFFF',
              borderRadius: '24px',
              fontSize: '16px',
              fontWeight: 600,
            }}
          >
            {t('login.button')}
          </Button>
        </div>

        <div className="flex items-center gap-3 py-1">
          <div className="h-px flex-1" style={{ backgroundColor: '#DCCFEA' }} />
          <span className="text-xs" style={{ color: '#9B8FA6' }}>{t('login.socialHint')}</span>
          <div className="h-px flex-1" style={{ backgroundColor: '#DCCFEA' }} />
        </div>

        <Button
          type="button"
          onClick={handleGoogleOAuth}
          disabled={oauthLoading || loginLoading}
          className="w-full border-0 flex items-center justify-center gap-2"
          style={{
            backgroundColor: '#FFFFFF',
            color: '#3C4043',
            borderRadius: '4px',
            border: '1px solid #DADCE0',
            height: '40px',
            fontSize: '14px',
            fontWeight: 500,
            boxShadow: 'none',
          }}
        >
          <GoogleLogo />
          {t('login.googleButton')}
        </Button>

        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => navigate('/forgot-password')}
            className="text-sm transition-opacity hover:opacity-70"
            style={{ color: '#6B5B95' }}
          >
            {t('login.forgotPassword')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="text-sm transition-opacity hover:opacity-70"
            style={{ color: '#6B5B95' }}
          >
            {t('login.createAccount')}
          </button>
        </div>
      </form>
    </div>
  );
}