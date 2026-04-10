import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Heart } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { t } from '../../i18n';
import { apiUrl } from '../lib/apiBase';

export function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !username.trim() || !password) {
      toast.error(t('register.validationRequired'));
      return;
    }
    if (password.length < 8) {
      toast.error(t('register.passwordTooShort'));
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch(apiUrl('/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          username: username.trim(),
          password,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        toast.error(data?.error || t('register.failed'));
        return;
      }

      localStorage.setItem('authProvider', 'password');
      localStorage.setItem('authUserId', data.user.id);
      localStorage.setItem('authUser', JSON.stringify(data.user));
      toast.success(t('register.success'));
      navigate('/select-language');
    } catch {
      toast.error(t('register.failed'));
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
        <div className="inline-flex items-center justify-center w-20 h-20 mb-4" style={{ backgroundColor: '#FFD1DC', borderRadius: '24px' }}>
          <Heart className="w-10 h-10" style={{ color: '#E6E6FA', fill: '#E6E6FA' }} />
        </div>
        <h1 className="text-3xl mb-2" style={{ fontWeight: 700, color: '#6B5B95', letterSpacing: '-0.02em' }}>
          {t('register.title')}
        </h1>
        <p className="text-base" style={{ color: '#9B8FA6' }}>{t('register.subtitle')}</p>
      </div>

      <form onSubmit={handleRegister} className="w-full max-w-sm space-y-4">
        <Input
          type="email"
          placeholder={t('login.email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-14 px-5 border-0 shadow-md"
          style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', fontSize: '16px', color: '#6B5B95' }}
          required
        />
        <Input
          type="text"
          placeholder={t('register.username')}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="h-14 px-5 border-0 shadow-md"
          style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', fontSize: '16px', color: '#6B5B95' }}
          required
        />
        <Input
          type="password"
          placeholder={t('login.password')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-14 px-5 border-0 shadow-md"
          style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', fontSize: '16px', color: '#6B5B95' }}
          required
        />
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-14 border-0 shadow-lg"
          style={{ backgroundColor: '#B8A9D4', color: '#FFFFFF', borderRadius: '24px', fontSize: '16px', fontWeight: 600 }}
        >
          {t('register.button')}
        </Button>
      </form>
    </div>
  );
}
