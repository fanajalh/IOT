import { useEffect, useState } from 'react';
import { apiClient } from '../lib/apiClient';

export default function AccessHistory() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchLogs();

    const interval = setInterval(() => {
      fetchLogs();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const fetchLogs = async () => {
    const res = await apiClient.get('/access-logs');
    if (res.success && res.data) {
      setLogs(res.data.slice(0, 10));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="glass-panel animate-fade-in delay-200" style={{ height: '100%' }}>
      <div className="history-header">
        <h3 className="history-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          Activity Log
        </h3>
        <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>LIVE</span>
      </div>
      
      {logs.length === 0 ? (
        <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 1rem', opacity: 0.5 }}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <p>Belum ada data log aktivitas.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="history-table">
            <thead>
              <tr>
                <th>WAKTU</th>
                <th>CARD / OPERATOR</th>
                <th>METODE</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr key={log.id || i} style={{ animation: `fadeIn 0.5s ease-out ${i * 0.05}s forwards`, opacity: 0 }}>
                  <td style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                    {formatDate(log.created_at)}
                  </td>
                  <td style={{ fontWeight: 700 }}>{log.card_uid}</td>
                  <td>
                    <span className="badge-normal" style={{ fontSize: '0.75rem' }}>{log.method || 'RFID'}</span>
                  </td>
                  <td>
                    <span className={`log-action ${log.status === 'GRANTED' ? 'unlocked' : 'locked'}`}>
                      {log.status === 'GRANTED' ? (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>
                          GRANTED
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                          DENIED
                        </>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}