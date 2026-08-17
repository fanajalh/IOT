import { createContext, useContext, useEffect, useState, useRef } from 'react';

const RealtimeContext = createContext();

export function RealtimeProvider({ children }) {
  const [socketConnected, setSocketConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    function connectWS() {
      if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
        return;
      }

      // Tentukan URL WebSocket berdasarkan protokol & host
      const isHttps = window.location.protocol === 'https:';
      let wsUrl = 'ws://13.212.247.120/';
      
      // Jika diakses via subdomain HTTPS
      if (isHttps && window.location.hostname.includes('klikajalh.web.id')) {
        wsUrl = 'wss://api-iot.klikajalh.web.id/';
      }

      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (!isMounted) return;
          console.log('⚡ [Web-WS] WebSocket Real-Time Terhubung ke Server!');
          setSocketConnected(true);
        };

        ws.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const data = JSON.parse(event.data);
            console.log('📩 [Web-WS] Data Real-Time Diterima:', data);
            setLastMessage(data);
          } catch (e) {
            console.warn('⚠️ Gagal parse pesan WS:', e);
          }
        };

        ws.onclose = () => {
          if (!isMounted) return;
          setSocketConnected(false);
          // Auto reconnect tiap 3 detik
          reconnectTimeoutRef.current = setTimeout(connectWS, 3000);
        };

        ws.onerror = (err) => {
          console.warn('🔌 [Web-WS] Connection notice:', err);
          ws.close();
        };
      } catch (err) {
        console.warn('⚠️ WebSocket init error:', err);
        reconnectTimeoutRef.current = setTimeout(connectWS, 3000);
      }
    }

    connectWS();

    return () => {
      isMounted = false;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const sendMessage = (data) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
      return true;
    }
    return false;
  };

  return (
    <RealtimeContext.Provider value={{ socketConnected, lastMessage, sendMessage }}>
      {children}
    </RealtimeContext.Provider>
  );
}

export const useRealtime = () => useContext(RealtimeContext);
