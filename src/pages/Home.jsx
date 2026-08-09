import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLamps } from '../context/LampContext';
import { apiClient } from '../lib/apiClient';
import { Link } from 'react-router-dom';
import { List, Bell, Door, Lightbulb, TrendUp, Clock, LockOpen, Lock, Power } from '@phosphor-icons/react';

export default function Home() {
  const { user } = useAuth();
  const { lamps, localCounters, formatDuration, cascadeTurnOnAll, cascadeTurnOffAll } = useLamps();
  const [userName, setUserName] = useState('');
  const [doorStatus, setDoorStatus] = useState('Memuat...');
  const [deviceId, setDeviceId] = useState('DOOR-001');

  const activeLampsCount = lamps.filter(l => l.status).length;
  const totalLampsCount = lamps.length || 0;

  let avgTimeString = '0 dtk';
  if (activeLampsCount > 0) {
    let totalSeconds = 0;
    lamps.forEach(lamp => {
      if (lamp.status) totalSeconds += (localCounters[lamp.id] || 0);
    });
    const avg = totalSeconds / activeLampsCount;
    if (avg < 60) avgTimeString = `${Math.floor(avg)} dtk`;
    else if (avg < 3600) avgTimeString = `${Math.floor(avg / 60)} mnt`;
    else avgTimeString = `${Math.floor(avg / 3600)} jam`;
  }

  useEffect(() => {
    fetchUserProfile();
    fetchDoor();

    const interval = setInterval(() => {
      fetchDoor();
    }, 2000);

    return () => clearInterval(interval);
  }, [user]);

  const fetchDoor = async () => {
    const res = await apiClient.get('/doors');
    if (res.success && res.data) {
      setDeviceId(res.data.device_id || 'DOOR-001');
      setDoorStatus(res.data.is_locked ? 'TERKUNCI' : 'TERBUKA');
    }
  };

  const toggleDoor = async (targetLocked) => {
    setDoorStatus(targetLocked ? 'TERKUNCI' : 'TERBUKA');
    await apiClient.post('/doors/toggle', {
      is_locked: targetLocked,
      card_uid: 'WEB_APP',
      method: 'WEB_APP'
    });
  };

  const fetchUserProfile = async () => {
    const res = await apiClient.get('/user-profile');
    if (res.success && res.data && res.data.name) {
      setUserName(res.data.name);
    } else {
      setUserName(user?.email?.split('@')[0] || 'Arfan');
    }
  };

  const isOpen = doorStatus === 'TERBUKA';

  return (
    <>
      <style>{`
        .home-wrapper {
          padding: 1.5rem;
          min-height: 100vh;
          background: #f0f2f5;
          color: #2D3748;
        }
        .home-status-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }
        .home-shortcut-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .home-analytics-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 0.8rem;
          margin-bottom: 2rem;
        }
        .home-analytics-grid > div {
          min-width: 0;
        }
        .home-ctrl-btn {
          flex: 1; padding: 0.5rem 0.3rem; border-radius: 12px; border: none;
          font-weight: 800; font-size: 0.7rem; display: flex; align-items: center;
          justify-content: center; gap: 3px; transition: all 0.3s ease;
          white-space: nowrap;
        }
        @media (min-width: 480px) {
          .home-status-grid { grid-template-columns: 1fr 1fr; gap: 1.2rem; }
          .home-shortcut-grid { gap: 1.2rem; }
          .home-analytics-grid { gap: 1.2rem; }
          .home-ctrl-btn { padding: 0.6rem; font-size: 0.75rem; gap: 4px; }
        }
        @media (min-width: 768px) {
          .home-wrapper { padding: 2.5rem; }
          .home-status-grid { gap: 1.5rem; }
          .home-shortcut-grid { gap: 1.5rem; margin-bottom: 2.5rem; }
          .home-analytics-grid { gap: 1.5rem; margin-bottom: 2.5rem; }
        }
      `}</style>
      <div className="home-wrapper">
      
      {/* TOPBAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div style={{ 
          width: '45px', height: '45px', borderRadius: '50%', background: '#f0f2f5',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '5px 5px 10px #d1d9e6, -5px -5px 10px #ffffff', color: '#4A5568'
        }}>
          <List size={24} weight="bold" />
        </div>
        <Link to="/notifikasi" style={{ 
          position: 'relative', width: '45px', height: '45px', borderRadius: '50%', background: '#f0f2f5',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '5px 5px 10px #d1d9e6, -5px -5px 10px #ffffff', color: '#4A5568', textDecoration: 'none'
        }}>
          <Bell size={24} weight="bold" />
          <div style={{ position: 'absolute', top: '12px', right: '12px', width: '8px', height: '8px', background: '#FF9F1C', borderRadius: '50%', boxShadow: '0 0 5px rgba(255,159,28,0.5)' }}></div>
        </Link>
      </div>

      {/* HEADER GREETING */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.5rem', color: '#2D3748', letterSpacing: '-0.5px' }}>
          Halo, <span style={{ color: '#FF9F1C' }}>{userName || 'Memuat...'}</span> 👋
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#A0AEC0', margin: 0, fontWeight: 600 }}>Selamat datang di IOT CLEF.</p>
      </div>

      {/* STATUS SISTEM CARD */}
      <div style={{ 
        background: '#f0f2f5', borderRadius: '28px', padding: '1.5rem', marginBottom: '2.5rem',
        boxShadow: '8px 8px 16px #d1d9e6, -8px -8px 16px #ffffff'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#4A5568', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <TrendUp size={20} color="#FF9F1C" weight="bold" />
            STATUS SISTEM
          </h3>
          <div style={{ background: 'rgba(72, 187, 120, 0.15)', color: '#38A169', padding: '6px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800 }}>
            ONLINE
          </div>
        </div>
        
        <div className="home-status-grid">
          {/* Box Pintu */}
          <div style={{ 
            background: '#f0f2f5', borderRadius: '20px', padding: '1.2rem',
            boxShadow: isOpen 
              ? 'inset 5px 5px 10px #d1d9e6, inset -5px -5px 10px #ffffff, 0 10px 20px rgba(229, 62, 62, 0.1)'
              : 'inset 5px 5px 10px #d1d9e6, inset -5px -5px 10px #ffffff',
            border: isOpen ? '2px solid rgba(229, 62, 62, 0.4)' : '2px solid transparent',
            display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ 
                width: '45px', height: '45px', borderRadius: '14px', background: '#f0f2f5',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '4px 4px 8px #d1d9e6, -4px -4px 8px #ffffff'
              }}>
                <Door size={24} color="#2D3748" weight="fill" />
              </div>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#A0AEC0', fontWeight: 800, letterSpacing: '0.5px', marginBottom: '4px' }}>AKSES PINTU</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: isOpen ? '#E53E3E' : '#FF9F1C', marginBottom: '1rem' }}>
                {doorStatus === 'Memuat...' ? '...' : doorStatus}
              </div>
              {/* Door Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="home-ctrl-btn" onClick={() => toggleDoor(false)} disabled={isOpen} style={{
                  cursor: isOpen ? 'default' : 'pointer',
                  background: isOpen ? 'rgba(56, 161, 105, 0.12)' : '#f0f2f5', color: isOpen ? '#38A169' : '#4A5568',
                  boxShadow: isOpen ? 'inset 3px 3px 6px #d1d9e6, inset -3px -3px 6px #fff' : '3px 3px 6px #d1d9e6, -3px -3px 6px #fff',
                  opacity: isOpen ? 0.5 : 1
                }}>
                  <LockOpen size={14} weight="bold" /> Buka
                </button>
                <button className="home-ctrl-btn" onClick={() => toggleDoor(true)} disabled={!isOpen} style={{
                  cursor: !isOpen ? 'default' : 'pointer',
                  background: !isOpen ? 'rgba(229, 62, 62, 0.12)' : '#f0f2f5',
                  color: !isOpen ? '#E53E3E' : '#4A5568',
                  boxShadow: !isOpen ? 'inset 3px 3px 6px #d1d9e6, inset -3px -3px 6px #fff' : '3px 3px 6px #d1d9e6, -3px -3px 6px #fff',
                  opacity: !isOpen ? 0.5 : 1
                }}>
                  <Lock size={14} weight="bold" /> Tutup
                </button>
              </div>
            </div>
          </div>

          {/* Box Lampu */}
          <div style={{ 
            background: '#f0f2f5', borderRadius: '20px', padding: '1.2rem',
            boxShadow: activeLampsCount > 0 
              ? 'inset 5px 5px 10px #d1d9e6, inset -5px -5px 10px #ffffff, 0 10px 20px rgba(255, 159, 28, 0.15)' 
              : 'inset 5px 5px 10px #d1d9e6, inset -5px -5px 10px #ffffff',
            border: activeLampsCount > 0 ? '2px solid rgba(255, 159, 28, 0.5)' : '2px solid transparent',
            display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ 
                width: '45px', height: '45px', borderRadius: '14px', background: activeLampsCount > 0 ? '#FF9F1C' : '#f0f2f5',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: activeLampsCount > 0 ? '0 8px 15px rgba(255, 159, 28, 0.4)' : '4px 4px 8px #d1d9e6, -4px -4px 8px #ffffff'
              }}>
                <Lightbulb size={24} color={activeLampsCount > 0 ? '#fff' : '#A0AEC0'} weight={activeLampsCount > 0 ? "fill" : "regular"} style={{ transform: 'rotate(180deg)' }} />
              </div>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#A0AEC0', fontWeight: 800, letterSpacing: '0.5px', marginBottom: '4px' }}>LAMPU AKTIF</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#FF9F1C', marginBottom: '1rem' }}>
                {activeLampsCount} <span style={{ fontSize: '1rem', color: '#A0AEC0' }}>/ {totalLampsCount}</span>
              </div>
              {/* Lamp Cascade Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="home-ctrl-btn" onClick={cascadeTurnOnAll} disabled={activeLampsCount === totalLampsCount} style={{
                  cursor: activeLampsCount === totalLampsCount ? 'default' : 'pointer',
                  background: '#f0f2f5', color: '#38A169',
                  boxShadow: activeLampsCount === totalLampsCount ? 'inset 3px 3px 6px #d1d9e6, inset -3px -3px 6px #fff' : '3px 3px 6px #d1d9e6, -3px -3px 6px #fff',
                  opacity: activeLampsCount === totalLampsCount ? 0.5 : 1
                }}>
                  <Power size={14} weight="bold" /> Nyala
                </button>
                <button className="home-ctrl-btn" onClick={cascadeTurnOffAll} disabled={activeLampsCount === 0} style={{
                  cursor: activeLampsCount === 0 ? 'default' : 'pointer',
                  background: '#f0f2f5', color: '#E53E3E',
                  boxShadow: activeLampsCount === 0 ? 'inset 3px 3px 6px #d1d9e6, inset -3px -3px 6px #fff' : '3px 3px 6px #d1d9e6, -3px -3px 6px #fff',
                  opacity: activeLampsCount === 0 ? 0.5 : 1
                }}>
                  <Power size={14} weight="bold" /> Mati
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SHORTCUT SECTION */}
      <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#4A5568', marginBottom: '1.2rem', marginLeft: '0.5rem' }}>SHORTCUT CEPAT</h3>
      <div className="home-shortcut-grid">
        <Link to="/pintu" style={{ 
          background: '#f0f2f5', borderRadius: '24px', padding: '1.2rem', textDecoration: 'none',
          boxShadow: '8px 8px 16px #d1d9e6, -8px -8px 16px #ffffff', display: 'flex', alignItems: 'center', gap: '1rem'
        }}>
          <div style={{ 
            width: '45px', height: '45px', borderRadius: '14px', background: '#f0f2f5', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'inset 4px 4px 8px #d1d9e6, inset -4px -4px 8px #ffffff'
          }}>
            <Door size={24} color="#FF9F1C" weight="fill" />
          </div>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#2D3748' }}>Pintu</div>
            <div style={{ fontSize: '0.8rem', color: '#A0AEC0', fontWeight: 700 }}>Kelola Akses</div>
          </div>
        </Link>

        <Link to="/lampu" style={{ 
          background: '#f0f2f5', borderRadius: '24px', padding: '1.2rem', textDecoration: 'none',
          boxShadow: '8px 8px 16px #d1d9e6, -8px -8px 16px #ffffff', display: 'flex', alignItems: 'center', gap: '1rem'
        }}>
          <div style={{ 
            width: '45px', height: '45px', borderRadius: '14px', background: '#f0f2f5', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'inset 4px 4px 8px #d1d9e6, inset -4px -4px 8px #ffffff'
          }}>
            <Lightbulb size={24} color="#FF9F1C" weight="fill" style={{ transform: 'rotate(180deg)' }} />
          </div>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#2D3748' }}>Lampu</div>
            <div style={{ fontSize: '0.8rem', color: '#A0AEC0', fontWeight: 700 }}>Atur Cahaya</div>
          </div>
        </Link>
      </div>

      {/* ANALITIK SISTEM */}
      <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#4A5568', marginBottom: '1.2rem', marginLeft: '0.5rem' }}>ANALITIK PENGGUNAAN</h3>
      <div className="home-analytics-grid">
        
        <div style={{ 
          background: '#f0f2f5', borderRadius: '24px', padding: '1.2rem', position: 'relative', overflow: 'hidden',
          boxShadow: '8px 8px 16px #d1d9e6, -8px -8px 16px #ffffff', display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ fontSize: '0.75rem', color: '#A0AEC0', fontWeight: 800, marginBottom: '0.5rem' }}>TOTAL LAMPU</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2D3748', lineHeight: '1', position: 'relative', zIndex: 1 }}>
            {totalLampsCount} <span style={{ fontSize: '0.8rem', color: '#A0AEC0' }}>Unit</span>
          </div>
          <Lightbulb size={60} color="#e2e8f0" weight="fill" style={{ position: 'absolute', right: '-15px', bottom: '-15px', zIndex: 0 }} />
        </div>

        <div style={{ 
          background: '#f0f2f5', borderRadius: '24px', padding: '1.2rem', position: 'relative', overflow: 'hidden',
          boxShadow: activeLampsCount > 0
            ? '8px 8px 16px #d1d9e6, -8px -8px 16px #ffffff, 0 10px 20px rgba(255, 159, 28, 0.15)'
            : '8px 8px 16px #d1d9e6, -8px -8px 16px #ffffff',
          border: activeLampsCount > 0 ? '2px solid rgba(255, 159, 28, 0.5)' : '2px solid transparent',
          display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ fontSize: '0.75rem', color: '#A0AEC0', fontWeight: 800, marginBottom: '0.5rem' }}>SEDANG AKTIF</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FF9F1C', lineHeight: '1', position: 'relative', zIndex: 1 }}>
            {activeLampsCount} <span style={{ fontSize: '0.8rem', color: '#A0AEC0' }}>Unit</span>
          </div>
          <Lightbulb size={60} color="#e2e8f0" weight="fill" style={{ position: 'absolute', right: '-15px', bottom: '-15px', zIndex: 0 }} />
        </div>

        <div style={{ 
          background: '#f0f2f5', borderRadius: '24px', padding: '1.2rem', position: 'relative', overflow: 'hidden',
          boxShadow: '8px 8px 16px #d1d9e6, -8px -8px 16px #ffffff', display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ fontSize: '0.75rem', color: '#A0AEC0', fontWeight: 800, marginBottom: '0.5rem' }}>RATA-RATA</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2D3748', lineHeight: '1', position: 'relative', zIndex: 1, marginTop: '4px' }}>
            {avgTimeString}
          </div>
          <Clock size={60} color="#e2e8f0" weight="fill" style={{ position: 'absolute', right: '-15px', bottom: '-15px', zIndex: 0 }} />
        </div>

      </div>

    </div>
    </>
  );
}
