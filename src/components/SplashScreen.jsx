import { LockKey } from '@phosphor-icons/react';

export default function SplashScreen() {
  return (
    <div style={{ 
      height: '100vh', 
      width: '100vw', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'var(--bg-main)',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 9999
    }}>
      <div className="flex-center inset-box-circle" style={{ 
        width: 120, 
        height: 120, 
        color: 'var(--accent-orange)',
        animation: 'pulse 2s infinite'
      }}>
        <LockKey size={60} weight="fill" />
      </div>
      <h1 className="heading-lg mt-6" style={{ fontSize: '2rem' }}>Smart Home</h1>
      <p className="text-sub mt-2" style={{ fontWeight: 500 }}>Memuat sistem...</p>
      
      <style>{`
        @keyframes pulse {
          0% { box-shadow: var(--neu-pressed); }
          50% { box-shadow: var(--neu-flat); transform: scale(1.05); }
          100% { box-shadow: var(--neu-pressed); transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
