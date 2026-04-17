import { supabase } from '../lib/supabaseClient';

export default function Navbar({ user }) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="navbar animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="m9 12 2 2 4-4" /></svg>
        <h1 className="navbar-brand">NEXUS<span style={{ color: 'var(--accent-blue)', fontWeight: 400 }}>CTRL</span></h1>
      </div>
      
      <div className="navbar-user">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }}></div>
          <span className="user-email">{user?.email}</span>
        </div>
        
        <button className="btn btn-outline" onClick={handleLogout} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          Logout
        </button>
      </div>
    </nav>
  );
}