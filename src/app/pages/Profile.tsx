import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, LogOut, User } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { t } from '../../i18n';
import { apiUrl } from '../lib/apiBase';

export function Profile() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [provider, setProvider] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [resolvedUserId, setResolvedUserId] = useState('');

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

        const syncResp = await fetch(apiUrl('/api/auth/google'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile }),
        });
        if (syncResp.ok) {
          const syncData = await syncResp.json();
          if (syncData?.user?.id) {
            localStorage.setItem('authUserId', syncData.user.id);
            localStorage.setItem('authUser', JSON.stringify(syncData.user));
            return syncData.user.id;
          }
        }
        return profile.sub;
      } catch {
        return '';
      }
    };

    const loadProfile = async () => {
      const userId = await hydrateGoogleSessionIfNeeded();
      if (!userId) {
        navigate('/');
        return;
      }
      setResolvedUserId(userId);

      try {
        const resp = await fetch(apiUrl(`/api/auth/profile?userId=${encodeURIComponent(userId)}`));
        const data = await resp.json();
        if (!resp.ok) throw new Error(data?.error || 'Load profile failed');
        setEmail(data.user.email || '');
        setProvider(data.user.provider || '');
        setUsername(data.user.username || data.user.name || '');
        localStorage.setItem('authUser', JSON.stringify(data.user));
      } catch {
        toast.error(t('profile.loadFailed'));
      }
    };
    void loadProfile();
  }, [navigate]);

  const handleSave = async () => {
    const userId = resolvedUserId || localStorage.getItem('authUserId') || '';
    const nextUsername = username.trim();
    if (!userId || !nextUsername) {
      toast.error(t('profile.validationRequired'));
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch(apiUrl('/api/auth/profile'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, username: nextUsername }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        toast.error(data?.error || t('profile.updateFailed'));
        return;
      }
      localStorage.setItem('authUser', JSON.stringify(data.user));
      setUsername(data.user.username || nextUsername);
      toast.success(t('profile.updateSuccess'));
    } catch {
      toast.error(t('profile.updateFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="min-h-screen px-6 md:px-12 lg:px-24 py-8" style={{ backgroundColor: '#FFFBF5' }}>
      <button
        onClick={() => navigate(-1)}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 transition-opacity hover:opacity-70"
      >
        <ArrowLeft className="w-5 h-5" style={{ color: '#6B5B95' }} />
        <span style={{ fontSize: '14px', color: '#6B5B95' }}>{t('profile.back')}</span>
      </button>

      <div className="max-w-2xl mx-auto pt-10 space-y-10">
        <div>
          <h1 className="text-3xl mb-2" style={{ fontWeight: 700, color: '#6B5B95', letterSpacing: '-0.02em' }}>
            {t('profile.title')}
          </h1>
          <p style={{ fontSize: '14px', color: '#9B8FA6' }}>{t('profile.subtitle')}</p>
        </div>

        <div className="space-y-5">
          <div>
            <p className="mb-2" style={{ fontSize: '14px', fontWeight: 600, color: '#6B5B95' }}>{t('profile.email')}</p>
            <Input
              type="text"
              value={email}
              disabled
              className="h-12 px-5 border-0 shadow-md"
              style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', fontSize: '16px', color: '#9B8FA6' }}
            />
          </div>

          <div>
            <p className="mb-2" style={{ fontSize: '14px', fontWeight: 600, color: '#6B5B95' }}>{t('profile.provider')}</p>
            <Input
              type="text"
              value={provider || 'password'}
              disabled
              className="h-12 px-5 border-0 shadow-md"
              style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', fontSize: '16px', color: '#9B8FA6' }}
            />
          </div>

          <div>
            <p className="mb-2" style={{ fontSize: '14px', fontWeight: 600, color: '#6B5B95' }}>{t('profile.username')}</p>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-12 px-5 border-0 shadow-md"
              style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', fontSize: '16px', color: '#6B5B95' }}
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={loading}
            className="w-full h-14 border-0 shadow-lg"
            style={{ backgroundColor: '#B8A9D4', color: '#FFFFFF', borderRadius: '24px', fontSize: '16px', fontWeight: 600 }}
          >
            <User className="w-4 h-4 mr-2" />
            {t('profile.save')}
          </Button>
        </div>

        <div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-5 py-4 shadow-md transition-all hover:shadow-lg"
            style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '2px solid #E6E6FA' }}
          >
            <LogOut className="w-5 h-5" style={{ color: '#E74C3C' }} />
            <span style={{ fontSize: '16px', fontWeight: 600, color: '#E74C3C' }}>{t('profile.logOut')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
