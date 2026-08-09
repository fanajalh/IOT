import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ user }) {
  const { logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    logout();
  };

  return (
    <nav className="navbar animate-fade-in">
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <img src="/clef-logo.svg" alt="IOT CLEF Logo" style={{ width: 32, height: 32 }} />
        <h1 className="navbar-brand">
          IOT <span className="brand-accent" style={{ color: '#FF9F1C' }}>CLEF</span>
        </h1>
        <span className="nav-badge" style={{ background: 'rgba(255,159,28,0.15)', color: '#FF9F1C' }}>SMART HOME</span>
      </div>
      
      {/* User Info & Actions */}
      <div className="navbar-user">
        <div className="user-info-chip">
          <div className="online-dot"></div>
          <span className="user-email">{user?.email}</span>
        </div>
        
        <button 
          className="btn-logout" 
          onClick={handleLogout} 
          disabled={loggingOut}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          {loggingOut ? 'Signing out...' : 'Logout'}
        </button>
      </div>
    </nav>
  );
}