import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Heart } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/select-language');
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{
        background: 'linear-gradient(135deg, #E6E6FA 0%, #FFFBF5 100%)',
      }}
    >
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
          AI for video call demo
        </h1>
        <p className="text-base" style={{ color: '#9B8FA6' }}>
          Make every second count.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
        <div>
          <Input
            type="email"
            placeholder="Email"
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
            placeholder="Password"
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
            Log In
          </Button>
        </div>
      </form>

      {/* Social Login */}
      <div className="mt-8">
        <p className="text-sm text-center mb-4" style={{ color: '#9B8FA6' }}>
          Or continue with
        </p>
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="w-14 h-14 flex items-center justify-center shadow-md transition-transform hover:scale-105"
            style={{
              backgroundColor: '#FEE500',
              borderRadius: '24px',
            }}
          >
            <span style={{ fontSize: '24px' }}>💬</span>
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