import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, KeyRound } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { t } from '../../i18n';
import { apiUrl } from '../lib/apiBase';

export function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [requested, setRequested] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRequestReset = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      toast.error(t('forgot.validationEmail'));
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch(apiUrl('/api/auth/forgot-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        toast.error(data?.error || t('forgot.requestFailed'));
        return;
      }
      setRequested(true);
      if (data?.devResetToken) {
        setToken(data.devResetToken);
        toast.success(`${t('forgot.tokenGenerated')}: ${data.devResetToken}`);
      } else {
        toast.success(t('forgot.requestSent'));
      }
    } catch {
      toast.error(t('forgot.requestFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !token.trim() || !newPassword) {
      toast.error(t('forgot.validationAll'));
      return;
    }
    if (newPassword.length < 8) {
      toast.error(t('register.passwordTooShort'));
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch(apiUrl('/api/auth/reset-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: normalizedEmail,
          token: token.trim(),
          newPassword,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        toast.error(data?.error || t('forgot.resetFailed'));
        return;
      }
      toast.success(t('forgot.resetSuccess'));
      navigate('/');
    } catch {
      toast.error(t('forgot.resetFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 relative"
      style={{ background: 'linear-gradient(135deg, #E6E6FA 0%, #FFFBF5 100%)' }}
    >
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 p-2 transition-opacity hover:opacity-70"
      >
        <ArrowLeft className="w-5 h-5" style={{ color: '#6B5B95' }} />
      </button>

      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 mb-4" style={{ backgroundColor: '#D4C4E8', borderRadius: '24px' }}>
          <KeyRound className="w-10 h-10" style={{ color: '#FFFFFF' }} />
        </div>
        <h1 className="text-3xl mb-2" style={{ fontWeight: 700, color: '#6B5B95', letterSpacing: '-0.02em' }}>
          {t('forgot.title')}
        </h1>
        <p className="text-base" style={{ color: '#9B8FA6' }}>{t('forgot.subtitle')}</p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        <Input
          type="email"
          placeholder={t('login.email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-14 px-5 border-0 shadow-md"
          style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', fontSize: '16px', color: '#6B5B95' }}
          required
        />

        <Button
          type="button"
          onClick={handleRequestReset}
          disabled={loading}
          className="w-full h-14 border-0 shadow-lg"
          style={{ backgroundColor: '#B8A9D4', color: '#FFFFFF', borderRadius: '24px', fontSize: '16px', fontWeight: 600 }}
        >
          {t('forgot.requestButton')}
        </Button>

        {requested && (
          <>
            <Input
              type="text"
              placeholder={t('forgot.tokenPlaceholder')}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="h-14 px-5 border-0 shadow-md"
              style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', fontSize: '16px', color: '#6B5B95' }}
            />
            <Input
              type="password"
              placeholder={t('forgot.newPassword')}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-14 px-5 border-0 shadow-md"
              style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', fontSize: '16px', color: '#6B5B95' }}
            />
            <Button
              type="button"
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full h-14 border-0 shadow-lg"
              style={{ backgroundColor: '#6B5B95', color: '#FFFFFF', borderRadius: '24px', fontSize: '16px', fontWeight: 600 }}
            >
              {t('forgot.resetButton')}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
