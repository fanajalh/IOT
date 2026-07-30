import { useEffect, useState } from 'react';
import { apiClient } from '../lib/apiClient';

export default function DoorController({ userEmail }) {
  const [doorData, setDoorData] = useState({ device_id: 'DOOR-001', is_locked: true });
  const [loading, setLoading] = useState(false);
  const [actionType, setActionType] = useState(null); // 'UNLOCK' or 'LOCK'

  useEffect(() => {
    fetchDoor();

    const interval = setInterval(() => {
      fetchDoor();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const fetchDoor = async () => {
    const res = await apiClient.get('/doors');
    if (res.success && res.data) {
      setDoorData(res.data);
    }
  };

  const controlDoor = async (targetLocked) => {
    setLoading(true);
    setActionType(targetLocked ? 'LOCK' : 'UNLOCK');

    setDoorData(prev => ({ ...prev, is_locked: targetLocked }));

    const res = await apiClient.post('/doors/toggle', {
      is_locked: targetLocked,
      card_uid: 'WEB_APP',
      method: 'WEB_APP'
    });

    if (!res.success) {
      alert('Gagal mengirim perintah ke pintu!');
      fetchDoor();
    }
    setLoading(false);
    setActionType(null);
  };

  const isLocked = doorData.is_locked;
  const isOpen = !isLocked;

  return (
    <div className="door-card animate-fade-in delay-100">
      <div className="door-card-inner">
        
        {/* Header */}
        <div className="door-card-header">
          <div className="door-header-left">
            <div className="device-icon-badge">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
              </svg>
            </div>
            <div>
              <h3 className="door-device-name">Smart Door Lock</h3>
              <span className="door-device-id">{doorData.device_id}</span>
            </div>
          </div>
          <div className={`door-live-badge ${isOpen ? 'live-open' : 'live-closed'}`}>
            <div className="live-dot"></div>
            LIVE
          </div>
        </div>

        {/* Status Ring */}
        <div className="door-status-section">
          <div className={`door-ring ${isOpen ? 'ring-open' : 'ring-closed'}`}>
            <div className="door-ring-inner">
              {isOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              )}
            </div>
          </div>
          
          <div className={`door-status-label ${isOpen ? 'label-open' : 'label-closed'}`}>
            {isOpen ? 'TERBUKA' : 'TERKUNCI'}
          </div>
          <p className="door-status-subtitle">
            {isOpen ? 'Pintu dalam keadaan tidak terkunci' : 'Pintu dalam keadaan aman terkunci'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="door-actions">
          <button 
            onClick={() => controlDoor(false)}
            disabled={loading || isOpen}
            className={`door-btn door-btn-open ${isOpen ? 'door-btn-active' : ''}`}
          >
            <div className="door-btn-icon">
              {loading && actionType === 'UNLOCK' ? (
                <div className="btn-spinner"></div>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
                </svg>
              )}
            </div>
            <span className="door-btn-label">BUKA PINTU</span>
          </button>
          
          <button 
            onClick={() => controlDoor(true)}
            disabled={loading || isLocked}
            className={`door-btn door-btn-close ${isLocked ? 'door-btn-active' : ''}`}
          >
            <div className="door-btn-icon">
              {loading && actionType === 'LOCK' ? (
                <div className="btn-spinner"></div>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              )}
            </div>
            <span className="door-btn-label">KUNCI PINTU</span>
          </button>
        </div>

        {/* Footer */}
        <div className="door-card-footer">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
          </svg>
          Secured by Smart Door Lock System
        </div>
      </div>
    </div>
  );
}