import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../lib/apiClient';
import { useRealtime } from '../context/RealtimeContext';
import { ArrowLeft, Bell, BellRinging, CheckCircle, Trash, Door, Lightbulb, ShieldCheck, CreditCard, Globe, SlidersHorizontal, Check } from '@phosphor-icons/react';

const READ_NOTIFS_KEY = 'smart_home_read_notifications';
const DELETED_NOTIFS_KEY = 'smart_home_deleted_notifications';

const getStoredIds = (key) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
};

const saveStoredIds = (key, ids) => {
  try {
    localStorage.setItem(key, JSON.stringify(ids));
  } catch (e) {}
};

export default function Notifikasi() {
  const { lastMessage } = useRealtime();
  const [filter, setFilter] = useState('semua'); // 'semua', 'pintu', 'lampu', 'sistem'
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ⚡ SINKRONISASI REAL-TIME WEBSOCKET (DATA MASUK INSTAN TANPA REFRESH)
  useEffect(() => {
    if (!lastMessage) return;

    if (lastMessage.type === 'DOOR_COMMAND' || lastMessage.type === 'DOOR_STATE_UPDATE') {
      fetchNotificationData();
    }
  }, [lastMessage]);

  useEffect(() => {
    fetchNotificationData();
  }, []);

  const fetchNotificationData = async () => {
    setIsLoading(true);
    try {
      const readIds = getStoredIds(READ_NOTIFS_KEY);
      const deletedIds = getStoredIds(DELETED_NOTIFS_KEY);
      const rawItems = [];

      // 1. Real Door Access Logs from Neon PostgreSQL database
      const logsRes = await apiClient.get('/access-logs');
      if (logsRes.success && Array.isArray(logsRes.data)) {
        logsRes.data.forEach((log, index) => {
          const notifId = `log-${log.id || index}`;
          if (!deletedIds.includes(notifId)) {
            rawItems.push({
              id: notifId,
              category: 'pintu',
              title: log.status === 'GRANTED' ? 'Akses Pintu Diterima' : 'Akses Pintu Ditolak',
              message: log.card_uid === 'WEB_APP'
                ? 'Kontrol Pintu dilakukan dari Web App Smart Home'
                : `Akses Pintu via Kartu RFID (UID: ${log.card_uid})`,
              time: log.created_at || new Date().toISOString(),
              read: readIds.includes(notifId),
              type: log.status === 'GRANTED' ? 'success' : 'danger'
            });
          }
        });
      }

      // 2. Real Door Status from Neon PostgreSQL database
      const doorRes = await apiClient.get('/doors');
      if (doorRes.success && doorRes.data) {
        const isLocked = !!doorRes.data.is_locked;
        const notifId = `door-status-${doorRes.data.id || 'current'}`;
        if (!deletedIds.includes(notifId)) {
          rawItems.push({
            id: notifId,
            category: 'pintu',
            title: isLocked ? 'Status Pintu: TERKUNCI' : 'Status Pintu: TERBUKA',
            message: `Perangkat ${doorRes.data.device_id || 'DOOR-001'} saat ini ${isLocked ? 'terkunci rapat' : 'dalam keadaan terbuka'}.`,
            time: doorRes.data.updated_at || new Date().toISOString(),
            read: readIds.includes(notifId),
            type: isLocked ? 'success' : 'warning'
          });
        }
      }

      // 3. Real Night Mode & Lamp Config from Neon PostgreSQL database
      const nightRes = await apiClient.get('/night-mode-config');
      if (nightRes.success && nightRes.data) {
        const notifId = 'night-mode-status';
        if (!deletedIds.includes(notifId)) {
          rawItems.push({
            id: notifId,
            category: 'lampu',
            title: nightRes.data.night_mode_enabled ? 'Mode Malam Aktif' : 'Mode Malam Nonaktif',
            message: nightRes.data.night_mode_enabled 
              ? 'Pengaturan otomatisasi mode malam sedang aktif di database.'
              : 'Pengaturan mode malam dinonaktifkan.',
            time: new Date().toISOString(),
            read: readIds.includes(notifId),
            type: 'info'
          });
        }
      }

      // Sort items by time DESC
      rawItems.sort((a, b) => new Date(b.time) - new Date(a.time));

      setNotifications(rawItems);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => {
      const next = prev.map(n => ({ ...n, read: true }));
      const readIds = next.map(n => n.id);
      saveStoredIds(READ_NOTIFS_KEY, readIds);
      return next;
    });
  };

  const toggleReadStatus = (id) => {
    setNotifications(prev => {
      const next = prev.map(n => n.id === id ? { ...n, read: !n.read } : n);
      const readIds = next.filter(n => n.read).map(n => n.id);
      saveStoredIds(READ_NOTIFS_KEY, readIds);
      return next;
    });
  };

  const deleteNotification = (id) => {
    setNotifications(prev => {
      const next = prev.filter(n => n.id !== id);
      const deletedIds = getStoredIds(DELETED_NOTIFS_KEY);
      saveStoredIds(DELETED_NOTIFS_KEY, [...new Set([...deletedIds, id])]);
      return next;
    });
  };

  const clearAllNotifications = () => {
    const allIds = notifications.map(n => n.id);
    const deletedIds = getStoredIds(DELETED_NOTIFS_KEY);
    saveStoredIds(DELETED_NOTIFS_KEY, [...new Set([...deletedIds, ...allIds])]);
    setNotifications([]);
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

  const filteredNotifs = notifications.filter(n => {
    if (filter === 'semua') return true;
    return n.category === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <style>{`
        .notif-wrapper {
          padding: 1.5rem;
          min-height: 100vh;
          background: #f0f2f5;
          color: #2D3748;
          max-width: 1200px;
          margin: 0 auto;
        }
        .notif-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2rem;
        }
        .notif-back-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #f0f2f5;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 4px 4px 8px #d1d9e6, -4px -4px 8px #ffffff;
          color: #2D3748;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .notif-back-btn:active {
          box-shadow: inset 3px 3px 6px #d1d9e6, inset -3px -3px 6px #ffffff;
        }
        .notif-tabs-track {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px;
          border-radius: 24px;
          background: #f0f2f5;
          box-shadow: inset 4px 4px 8px #d1d9e6, inset -4px -4px 8px #ffffff;
          margin-bottom: 1.5rem;
          overflow-x: auto;
        }
        .notif-tab-btn {
          flex: 1;
          min-width: max-content;
          padding: 0.6rem 1rem;
          border-radius: 18px;
          border: none;
          font-weight: 700;
          font-size: 0.8rem;
          cursor: pointer;
          white-space: nowrap;
          background: transparent;
          color: #718096;
          box-shadow: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .notif-tab-btn.active {
          background: linear-gradient(135deg, #FF9F1C 0%, #FF7600 100%);
          color: #ffffff;
          box-shadow: 4px 4px 10px #d1d9e6, -4px -4px 10px #ffffff, 0 4px 12px rgba(255, 159, 28, 0.4);
        }
        .notif-count-badge {
          font-size: 0.7rem;
          padding: 2px 7px;
          border-radius: 10px;
          background: rgba(0,0,0,0.06);
          color: inherit;
        }
        .notif-tab-btn.active .notif-count-badge {
          background: rgba(255,255,255,0.25);
          color: #ffffff;
        }
        .notif-card {
          background: #f0f2f5;
          border-radius: 20px;
          padding: 1.25rem;
          margin-bottom: 1rem;
          box-shadow: 6px 6px 12px #d1d9e6, -6px -6px 12px #ffffff;
          display: flex;
          gap: 1rem;
          position: relative;
          transition: all 0.25s ease;
          border: 1px solid transparent;
        }
        .notif-card.unread {
          border-left: 4px solid #FF9F1C;
          background: #fffbf5;
        }
        .notif-icon-box {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: #f0f2f5;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: inset 3px 3px 6px #d1d9e6, inset -3px -3px 6px #ffffff;
        }
        .notif-action-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #A0AEC0;
          padding: 4px;
          border-radius: 8px;
          transition: color 0.2s ease;
        }
        .notif-action-btn:hover {
          color: #E53E3E;
        }
        @media (min-width: 768px) {
          .notif-wrapper {
            padding: 2.5rem;
          }
        }
      `}</style>

      <div className="notif-wrapper">
        
        {/* Header */}
        <div className="notif-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link to="/home" className="notif-back-btn">
              <ArrowLeft size={22} weight="bold" />
            </Link>
            <div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: '#2D3748' }}>
                Notifikasi
              </h1>
              <p style={{ fontSize: '0.85rem', color: '#718096', margin: 0, fontWeight: 600 }}>
                {unreadCount > 0 ? `${unreadCount} belum dibaca` : 'Semua notifikasi sudah dibaca'}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead} 
                title="Tandai semua dibaca"
                style={{ 
                  background: '#f0f2f5', border: 'none', padding: '0.6rem 0.9rem', borderRadius: '14px',
                  boxShadow: '4px 4px 8px #d1d9e6, -4px -4px 8px #ffffff', cursor: 'pointer',
                  fontWeight: 700, fontSize: '0.75rem', color: '#38A169', display: 'flex', alignItems: 'center', gap: '5px'
                }}
              >
                <CheckCircle size={16} weight="bold" /> Tandai Dibaca
              </button>
            )}
            {notifications.length > 0 && (
              <button 
                onClick={clearAllNotifications} 
                title="Hapus semua"
                style={{ 
                  background: '#f0f2f5', border: 'none', padding: '0.6rem 0.8rem', borderRadius: '14px',
                  boxShadow: '4px 4px 8px #d1d9e6, -4px -4px 8px #ffffff', cursor: 'pointer',
                  fontWeight: 700, fontSize: '0.75rem', color: '#E53E3E', display: 'flex', alignItems: 'center', gap: '4px'
                }}
              >
                <Trash size={16} weight="bold" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs Track */}
        <div className="notif-tabs-track">
          <button className={`notif-tab-btn ${filter === 'semua' ? 'active' : ''}`} onClick={() => setFilter('semua')}>
            <span>Semua</span>
            <span className="notif-count-badge">{notifications.length}</span>
          </button>
          <button className={`notif-tab-btn ${filter === 'pintu' ? 'active' : ''}`} onClick={() => setFilter('pintu')}>
            <span>Pintu</span>
            <span className="notif-count-badge">{notifications.filter(n => n.category === 'pintu').length}</span>
          </button>
          <button className={`notif-tab-btn ${filter === 'lampu' ? 'active' : ''}`} onClick={() => setFilter('lampu')}>
            <span>Lampu</span>
            <span className="notif-count-badge">{notifications.filter(n => n.category === 'lampu').length}</span>
          </button>
          <button className={`notif-tab-btn ${filter === 'sistem' ? 'active' : ''}`} onClick={() => setFilter('sistem')}>
            <span>Sistem</span>
            <span className="notif-count-badge">{notifications.filter(n => n.category === 'sistem').length}</span>
          </button>
        </div>

        {/* Notifications List */}
        <div>
          {filteredNotifs.map((item) => {
            let icon = <Bell size={22} color="#FF9F1C" weight="fill" />;
            if (item.category === 'pintu') icon = <Door size={22} color={item.type === 'danger' ? '#E53E3E' : '#38A169'} weight="fill" />;
            if (item.category === 'lampu') icon = <Lightbulb size={22} color="#FF9F1C" weight="fill" />;
            if (item.category === 'sistem') icon = <ShieldCheck size={22} color="#3182CE" weight="fill" />;

            return (
              <div key={item.id} className={`notif-card ${!item.read ? 'unread' : ''}`}>
                <div className="notif-icon-box">
                  {icon}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#2D3748', margin: 0 }}>
                      {item.title}
                    </h3>
                    <span style={{ fontSize: '0.72rem', color: '#A0AEC0', fontWeight: 600 }}>
                      {formatTime(item.time)}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#4A5568', margin: '0 0 0.6rem 0', lineHeight: '1.4' }}>
                    {item.message}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {/* Tag badge */}
                    <span style={{ 
                      fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase',
                      padding: '3px 9px', borderRadius: '8px',
                      background: item.category === 'pintu' ? 'rgba(56,161,105,0.12)' : item.category === 'lampu' ? 'rgba(255,159,28,0.12)' : 'rgba(49,130,206,0.12)',
                      color: item.category === 'pintu' ? '#38A169' : item.category === 'lampu' ? '#D69E2E' : '#3182CE'
                    }}>
                      {item.category}
                    </span>

                    {/* Individual Actions */}
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button 
                        onClick={() => toggleReadStatus(item.id)} 
                        className="notif-action-btn"
                        title={item.read ? 'Tandai belum dibaca' : 'Tandai sudah dibaca'}
                      >
                        <Check size={16} weight={item.read ? "bold" : "regular"} color={item.read ? "#38A169" : "#A0AEC0"} />
                      </button>
                      <button 
                        onClick={() => deleteNotification(item.id)} 
                        className="notif-action-btn"
                        title="Hapus"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Empty State */}
          {filteredNotifs.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#A0AEC0' }}>
              <BellRinging size={56} weight="light" color="#CBD5E0" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#4A5568', marginBottom: '0.4rem' }}>
                Tidak Ada Notifikasi
              </h3>
              <p style={{ fontSize: '0.85rem', margin: 0 }}>
                {filter === 'semua' ? 'Belum ada notifikasi atau semua telah dihapus.' : `Tidak ada notifikasi untuk kategori ${filter}.`}
              </p>
            </div>
          )}
        </div>

      </div>
    </>
  );
}
