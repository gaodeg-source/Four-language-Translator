import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Heart, Languages } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { t } from '../../i18n';
import { toast } from 'sonner';

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

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [oauthLoading, setOauthLoading] = useState(false);

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
        const profileResp = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (!profileResp.ok) throw new Error('Failed to fetch profile');
        const profile = await profileResp.json();

        localStorage.setItem('authProvider', 'google');
        localStorage.setItem('googleAccessToken', accessToken);
        localStorage.setItem('googleUser', JSON.stringify(profile));
        navigate('/select-language');
      } catch {
        toast.error(t('login.oauthFailed'));
      }
    };

    handleOAuthCallback();
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
    navigate('/select-language');
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
      </form>

      {/* Social Login */}
      <div className="mt-8">
        <p className="text-sm text-center mb-4" style={{ color: '#9B8FA6' }}>
          {t('login.socialHint')}
        </p>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleGoogleOAuth}
            disabled={oauthLoading}
            className="w-14 h-14 flex items-center justify-center shadow-md transition-transform hover:scale-105"
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E6E6FA',
              borderRadius: '24px',
            }}
          >
            <span style={{ fontSize: '20px', fontWeight: 700, color: '#4285F4' }}>G</span>
          </button>
          <button
            type="button"
            className="w-14 h-14 flex items-center justify-center shadow-md transition-transform hover:scale-105"
            style={{
              backgroundColor: '#000000',
              borderRadius: '24px',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.08l-.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" fill="white"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}