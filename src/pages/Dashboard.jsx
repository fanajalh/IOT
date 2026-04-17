import Navbar from '../components/Navbar';
import DoorController from '../components/DoorController';
import AccessHistory from '../components/AccessHistory';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <>
      <Navbar user={user} />
      
      <main className="container">
        
        {/* --- Header / Sapaan Pengguna --- */}
        <div style={{ marginBottom: '2.5rem' }} className="animate-fade-in">
          <h2 style={{ 
            fontSize: '2.5rem',
            margin: '0 0 0.5rem 0',
            letterSpacing: '-0.5px'
          }} className="glow-text">
            Command Center
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: 0 }}>
            Welcome back, <strong style={{ color: 'var(--text-primary)' }}>Operator {user?.email?.split('@')[0]}</strong>. Connected via Supabase Realtime.
          </p>
        </div>

        {/* --- Layout Utama (Grid Responsif) --- */}
        <div className="grid-layout">
          
          {/* Kolom Kiri: Tombol Pintu & Info Sistem */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <DoorController userEmail={user?.email} />
            
            {/* Kartu Info Tambahan */}
            <div className="glass-panel animate-fade-in delay-300">
              <h4 style={{ 
                marginTop: 0, 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                fontSize: '1.1rem',
                color: 'white',
                marginBottom: '1rem'
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path><path d="m9 12 2 2 4-4"></path></svg>
                System Diagnostics
              </h4>
              <ul className="stats-list">
                <li className="stats-item">
                  <span>Database Link</span>
                  <span className="badge badge-success">SECURE</span>
                </li>
                <li className="stats-item">
                  <span>Realtime Sync</span>
                  <span className="badge badge-success">ACTIVE</span>
                </li>
                <li className="stats-item">
                  <span>Auto Logging</span>
                  <span className="badge" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>ENABLED</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Kolom Kanan: Riwayat Akses */}
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <AccessHistory />
          </div>
          
        </div>
      </main>
    </>
  );
}