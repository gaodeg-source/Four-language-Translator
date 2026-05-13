import { useEffect, useState } from 'react';

function SignalIcon() {
  return (
    <svg width="17" height="12" viewBox="0 0 17 12" fill="rgba(0,0,0,0.85)">
      <rect x="0" y="9" width="3" height="3" rx="0.8" />
      <rect x="4.7" y="6" width="3" height="6" rx="0.8" />
      <rect x="9.4" y="3" width="3" height="9" rx="0.8" />
      <rect x="14.1" y="0" width="3" height="12" rx="0.8" />
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
      <circle cx="8" cy="11" r="1.6" fill="rgba(0,0,0,0.85)" />
      <path d="M4.8 7.6C5.7 6.7 6.8 6.1 8 6.1s2.3.6 3.2 1.5" stroke="rgba(0,0,0,0.85)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M1.5 4.5C3.2 2.8 5.5 1.8 8 1.8s4.8 1 6.5 2.7" stroke="rgba(0,0,0,0.85)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function BatteryIcon() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1px' }}>
      <div style={{
        width: '25px', height: '12px',
        border: '1.5px solid rgba(0,0,0,0.4)',
        borderRadius: '3.5px',
        padding: '1.5px',
        position: 'relative',
      }}>
        <div style={{
          width: '72%', height: '100%',
          background: 'rgba(0,0,0,0.8)',
          borderRadius: '1.5px',
        }} />
      </div>
      <div style={{
        width: '2px', height: '5px',
        background: 'rgba(0,0,0,0.4)',
        borderRadius: '0 1.5px 1.5px 0',
      }} />
    </div>
  );
}

function StatusBar() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const h = now.getHours().toString().padStart(2, '0');
      const m = now.getMinutes().toString().padStart(2, '0');
      setTime(`${h}:${m}`);
    };
    update();
    const id = setInterval(update, 15000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '59px',
      display: 'flex',
      alignItems: 'flex-end',
      paddingBottom: '10px',
      paddingLeft: '28px',
      paddingRight: '24px',
      zIndex: 100,
      pointerEvents: 'none',
    }}>
      <span style={{
        fontSize: '15px',
        fontWeight: 700,
        color: 'rgba(0,0,0,0.85)',
        letterSpacing: '-0.4px',
        flex: 1,
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      }}>
        {time}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
        <SignalIcon />
        <WifiIcon />
        <BatteryIcon />
      </div>
    </div>
  );
}

const ButtonLeft = ({ top, height }: { top: number; height: number }) => (
  <div style={{
    position: 'absolute',
    left: '-4px',
    top: `${top}px`,
    width: '4px',
    height: `${height}px`,
    background: 'linear-gradient(90deg, #2a2a2e 0%, #48484c 50%, #3a3a3e 100%)',
    borderRadius: '3px 0 0 3px',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.4)',
  }} />
);

export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: `
        radial-gradient(ellipse at 30% 30%, rgba(109, 40, 217, 0.35) 0%, transparent 60%),
        radial-gradient(ellipse at 75% 70%, rgba(76, 29, 149, 0.25) 0%, transparent 55%),
        linear-gradient(160deg, #0d0018 0%, #13001f 40%, #0a0015 100%)
      `,
      padding: '56px 24px',
      boxSizing: 'border-box',
    }}>
      {/* Subtle desk surface reflection */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '40%',
        background: 'linear-gradient(to top, rgba(109,40,217,0.06) 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      {/* Device outer wrapper — physical buttons attach here */}
      <div style={{ position: 'relative', flexShrink: 0 }}>

        {/* === LEFT SIDE BUTTONS === */}
        {/* Action button */}
        <ButtonLeft top={128} height={36} />
        {/* Volume Up */}
        <ButtonLeft top={186} height={68} />
        {/* Volume Down */}
        <ButtonLeft top={268} height={68} />

        {/* === RIGHT SIDE — Power button === */}
        <div style={{
          position: 'absolute',
          right: '-4px',
          top: '208px',
          width: '4px',
          height: '90px',
          background: 'linear-gradient(270deg, #2a2a2e 0%, #48484c 50%, #3a3a3e 100%)',
          borderRadius: '0 3px 3px 0',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.4)',
        }} />

        {/* === PHONE SHELL === */}
        <div style={{
          width: '393px',
          height: '852px',
          borderRadius: '55px',
          background: 'linear-gradient(155deg, #1c1c1e 0%, #111113 60%, #0d0d0f 100%)',
          position: 'relative',
          boxShadow: `
            0 0 0 1px rgba(255,255,255,0.10),
            0 0 0 2.5px #0a0a0c,
            0 0 0 4px rgba(255,255,255,0.04),
            0 60px 140px rgba(0,0,0,0.95),
            0 30px 80px rgba(0,0,0,0.7),
            0 8px 30px rgba(109,40,217,0.3),
            inset 0 1px 0 rgba(255,255,255,0.14),
            inset 0 -1px 0 rgba(0,0,0,0.7)
          `,
        }}>

          {/* === SCREEN CUTOUT === */}
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            right: '12px',
            bottom: '12px',
            borderRadius: '44px',
            overflow: 'hidden',
            background: '#fff',
          }}>
            {/* App content renders here */}
            <div style={{
              width: '100%',
              height: '100%',
              overflow: 'hidden',
              position: 'relative',
            }}>
              {children}
            </div>

            {/* Status bar overlays app content */}
            <StatusBar />
          </div>

          {/* === DYNAMIC ISLAND === */}
          <div style={{
            position: 'absolute',
            top: '23px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '126px',
            height: '37px',
            background: '#000',
            borderRadius: '20px',
            zIndex: 200,
            boxShadow: '0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 2px rgba(255,255,255,0.05)',
          }} />

          {/* === HOME INDICATOR === */}
          <div style={{
            position: 'absolute',
            bottom: '18px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '134px',
            height: '5px',
            background: 'rgba(0,0,0,0.22)',
            borderRadius: '3px',
            zIndex: 200,
          }} />

          {/* === SCREEN GLARE (top curved reflection) === */}
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            right: '12px',
            height: '220px',
            borderRadius: '44px 44px 0 0',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.012) 40%, transparent 100%)',
            pointerEvents: 'none',
            zIndex: 150,
          }} />
        </div>

        {/* === DROP SHADOW GLOW (below device) === */}
        <div style={{
          position: 'absolute',
          bottom: '-40px',
          left: '10%',
          right: '10%',
          height: '40px',
          background: 'radial-gradient(ellipse at center, rgba(109,40,217,0.35) 0%, transparent 70%)',
          filter: 'blur(12px)',
          pointerEvents: 'none',
        }} />
      </div>
    </div>
  );
}
