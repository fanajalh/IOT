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
        <div className="brand-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="url(#brandGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <defs>
              <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        </div>
        <h1 className="navbar-brand">
          krea<span className="brand-accent">DV</span>
        </h1>
        <span className="nav-badge">SMART LOCK</span>
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