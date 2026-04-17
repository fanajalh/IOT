import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const DEVICE_ID = 'PINTU-001';

export default function DoorController({ userEmail }) {
  const [doorStatus, setDoorStatus] = useState('IDLE');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDoorStatus();

    // Realtime listener untuk perubahan status pintu
    const channel = supabase
      .channel('public:devices')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'devices', 
        filter: `device_id=eq.${DEVICE_ID}` 
      }, 
        (payload) => {
          setDoorStatus(payload.new.door_command);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchDoorStatus = async () => {
    const { data, error } = await supabase
      .from('devices')
      .select('door_command')
      .eq('device_id', DEVICE_ID)
      .single();

    if (data) setDoorStatus(data.door_command);
    if (error) console.error('Fetch status error:', error);
  };

  const controlDoor = async (command) => {
    setLoading(true);
    const { error } = await supabase
      .from('devices')
      .update({ door_command: command })
      .eq('device_id', DEVICE_ID);

    if (!error) {
      setDoorStatus(command);

      // Log akses
      await supabase.from('access_logs').insert([
        { user_email: userEmail, action: command === 'OPEN' ? 'UNLOCKED' : 'LOCKED' }
      ]);
    } else {
      console.error('Control door error:', error);
      alert('Gagal mengirim perintah!');
    }
    setLoading(false);
  };

  const isOpen = doorStatus === 'OPEN';
  const isClosed = doorStatus === 'CLOSE';

  return (
    <div className="glass-panel animate-fade-in delay-100">
      <div className="door-status-wrapper">
        <h3 style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
          Realtime Status
        </h3>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.8rem', opacity: 0.7 }}>
          {DEVICE_ID}
        </p>
        
        <div className={`status-indicator ${isOpen ? 'unlocked' : isClosed ? 'locked' : 'idle'}`}>
          {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>
          ) : isClosed ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          )}
        </div>
        
        <div className={`status-text ${isOpen ? 'unlocked' : isClosed ? 'locked' : 'idle'}`}>
          {isOpen ? 'PINTU TERBUKA' : isClosed ? 'PINTU TERKUNCI' : 'IDLE'}
        </div>

        {/* Dua tombol terpisah: BUKA dan KUNCI */}
        <div style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: '350px' }}>
          <button 
            onClick={() => controlDoor('OPEN')}
            disabled={loading || isOpen}
            className="btn btn-lock action-unlocked"
            style={{ flex: 1, fontSize: '1rem', padding: '1rem 1.5rem' }}
          >
            {loading ? (
              <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto' }}><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
            ) : (
              'BUKA PINTU'
            )}
          </button>
          <button 
            onClick={() => controlDoor('CLOSE')}
            disabled={loading || isClosed}
            className="btn btn-lock action-locked"
            style={{ flex: 1, fontSize: '1rem', padding: '1rem 1.5rem' }}
          >
            {loading ? (
              <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto' }}><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
            ) : (
              'KUNCI PINTU'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}