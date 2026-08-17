import { useState, useEffect } from 'react';
import { apiClient } from '../lib/apiClient';
import { useLamps } from '../context/LampContext';
import { ArrowLeft, DotsThreeVertical, LockKeyOpen, LockKey, DoorOpen, Door as DoorClosed, CreditCard, Globe, ClockCounterClockwise } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

export default function Pintu() {
  const [isLocked, setIsLocked] = useState(true);
  const [deviceId, setDeviceId] = useState('DOOR-001');
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isNightMode, nightStayOnLamps } = useLamps();

  useEffect(() => {
    fetchDoorStatus();
    fetchLogs();

    const interval = setInterval(() => {
      fetchDoorStatus();
      fetchLogs();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const fetchDoorStatus = async () => {
    try {
      const res = await apiClient.get('/doors');
      if (res.success && res.data) {
        setIsLocked(!!res.data.is_locked);
        setDeviceId(res.data.device_id || 'DOOR-001');
      }
    } catch (err) {
      console.error('fetchDoorStatus error:', err);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await apiClient.get('/access-logs');
      if (res.success && res.data) {
        setLogs(res.data.slice(0, 10));
      }
    } catch (err) {
      console.error('fetchLogs error:', err);
    }
  };

  const toggleDoor = async (targetLocked) => {
    if (isLoading) return;
    setIsLoading(true);
    
    // Optimistic UI update
    setIsLocked(targetLocked);

    await apiClient.post('/doors/toggle', {
      is_locked: targetLocked,
      card_uid: 'WEB_APP',
      method: 'WEB_APP',
      night_mode: isNightMode,
      stay_on_lamps: nightStayOnLamps
    });
    
    fetchLogs();
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMin < 1) return 'Baru saja';
    if (diffMin < 60) return `${diffMin} mnt lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;

    return date.toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const getMethodInfo = (method) => {
    if (method === 'RFID' || method === 'rfid') {
      return { label: 'Kartu RFID', icon: <CreditCard size={14} weight="fill" />, color: '#805AD5', bg: 'rgba(128, 90, 213, 0.12)' };
    }
    return { label: 'Web App', icon: <Globe size={14} weight="fill" />, color: '#3182CE', bg: 'rgba(49, 130, 206, 0.12)' };
  };

  return (
    <div>
      <style>{`
        .pintu-grid-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }
        @media (min-width: 900px) {
          .pintu-grid-layout {
            grid-template-columns: 1fr 1.2fr;
            align-items: start;
          }
        }
      `}</style>
      <div className="topbar">
        <Link to="/home" className="topbar-icon" style={{ color: 'inherit', textDecoration: 'none' }}>
          <ArrowLeft size={24} />
        </Link>
        <h2 className="page-title">Pintu ({deviceId})</h2>
        <div className="topbar-icon">
          <DotsThreeVertical size={24} />
        </div>
      </div>

      <div className="p-6 pt-0">
        <div className="pintu-grid-layout">
          
          {/* Left Column: Visual Pintu Card */}
          <div>
            <div className="card mb-6" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="grid-2" style={{ width: '100%', alignItems: 'center' }}>
                <div className="flex-center inset-box" style={{ height: 160 }}>
                  {!isLocked ? (
                    <DoorOpen size={80} color="#38A169" weight="light" />
                  ) : (
                    <DoorClosed size={80} color="#E53E3E" weight="fill" />
                  )}
                </div>
                <div>
                  <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    STATUS PINTU
                  </h3>
                  <div className="heading-lg mb-2" style={{ color: !isLocked ? '#38A169' : '#E53E3E' }}>
                    {!isLocked ? 'TERBUKA' : 'TERKUNCI'}
                  </div>
                  <div className="badge-normal">{!isLocked ? 'Akses Terbuka' : 'Solenoid Terkunci'}</div>
                </div>
              </div>

              <div className="grid-2 mt-6" style={{ width: '100%', gap: '1rem' }}>
                <button 
                  className={`btn-primary ${!isLocked ? 'active' : ''}`}
                  onClick={() => toggleDoor(false)}
                  disabled={isLoading}
                  style={{ opacity: !isLocked ? 0.8 : 1, padding: '0.85rem 0.5rem', fontSize: '0.95rem' }}
                >
                  <LockKeyOpen size={20} weight="fill" />
                  Buka Pintu
                </button>
                <button 
                  className={`btn-secondary ${isLocked ? 'active' : ''}`}
                  onClick={() => toggleDoor(true)}
                  disabled={isLoading}
                  style={{ opacity: isLocked ? 0.8 : 1, padding: '0.85rem 0.5rem', fontSize: '0.95rem' }}
                >
                  <LockKey size={20} weight="fill" color={isLocked ? 'var(--accent-orange)' : 'var(--text-primary)'} />
                  <span style={{ color: isLocked ? 'var(--accent-orange)' : 'var(--text-primary)' }}>Kunci Pintu</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Log Pintu */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                <ClockCounterClockwise size={18} weight="bold" />
                LOG AKSES PINTU
              </h3>
              {logs.length > 0 && (
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#38A169', background: 'rgba(56,161,105,0.12)', padding: '3px 10px', borderRadius: '12px' }}>
                  LIVE • {logs.length} entri
                </span>
              )}
            </div>

            <div className="card" style={{ padding: '0.5rem 1rem' }}>
          {logs.map((log, index) => {
            const methodInfo = getMethodInfo(log.method);
            return (
              <div key={log.id || index} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '1.25rem 0',
                borderBottom: index !== logs.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className="flex-center inset-box-circle" style={{ 
                    width: 44, 
                    height: 44, 
                    color: log.status === 'GRANTED' ? '#38A169' : '#E53E3E'
                  }}>
                    {log.status === 'GRANTED' ? <LockKeyOpen size={20} weight="fill" /> : <LockKey size={20} weight="fill" />}
                  </div>
                  <div>
                    <div className="font-bold" style={{ marginBottom: '4px' }}>
                      {log.card_uid === 'WEB_APP' ? 'Kontrol Web App' : `UID: ${log.card_uid}`}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      {/* Method badge */}
                      <span style={{ 
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        fontSize: '0.7rem', fontWeight: 700, 
                        color: methodInfo.color, background: methodInfo.bg,
                        padding: '2px 8px', borderRadius: '8px'
                      }}>
                        {methodInfo.icon} {methodInfo.label}
                      </span>
                      {/* Status badge */}
                      <span style={{ 
                        fontSize: '0.7rem', fontWeight: 700, 
                        color: log.status === 'GRANTED' ? '#38A169' : '#E53E3E',
                        background: log.status === 'GRANTED' ? 'rgba(56,161,105,0.12)' : 'rgba(229,62,62,0.12)',
                        padding: '2px 8px', borderRadius: '8px'
                      }}>
                        {log.status === 'GRANTED' ? '✓ Diterima' : '✗ Ditolak'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-sub" style={{ fontSize: '0.75rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                  {formatTime(log.created_at)}
                </div>
              </div>
            );
          })}
          {logs.length === 0 && (
            <div className="text-center p-4 text-sub" style={{ padding: '2rem 0' }}>
              <ClockCounterClockwise size={40} weight="light" color="#CBD5E0" style={{ marginBottom: '0.5rem' }} />
              <div>Belum ada log akses pintu.</div>
              <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>Coba tekan tombol Buka / Kunci Pintu.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
</div>
  );
}
