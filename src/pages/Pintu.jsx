import { useState, useEffect } from 'react';
import { apiClient } from '../lib/apiClient';
import { ArrowLeft, DotsThreeVertical, LockKeyOpen, LockKey, DoorOpen, Door as DoorClosed } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

export default function Pintu() {
  const [isLocked, setIsLocked] = useState(true);
  const [deviceId, setDeviceId] = useState('DOOR-001');
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

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
    const res = await apiClient.get('/doors');
    if (res.success && res.data) {
      setIsLocked(!!res.data.is_locked);
      setDeviceId(res.data.device_id || 'DOOR-001');
    }
  };

  const fetchLogs = async () => {
    const res = await apiClient.get('/access-logs');
    if (res.success && res.data) {
      setLogs(res.data.slice(0, 6));
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
      method: 'WEB_APP'
    });
    
    fetchLogs();
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
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
        
        {/* Visual Pintu Card */}
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

        {/* Log Pintu */}
        <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '1rem' }}>LOG AKSES PINTU</h3>
        <div className="card" style={{ padding: '0.5rem 1rem' }}>
          {logs.map((log, index) => (
            <div key={log.id} style={{ 
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
                  <div className="font-bold">UID: {log.card_uid}</div>
                  <div className="text-sub">Metode: {log.method || 'RFID'} • Status: {log.status}</div>
                </div>
              </div>
              <div className="text-sub" style={{ fontSize: '0.8rem' }}>
                {formatTime(log.created_at)}
              </div>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-center p-4 text-sub">Tidak ada log pintu.</div>
          )}
        </div>

      </div>
    </div>
  );
}
