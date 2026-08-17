import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { apiClient } from '../lib/apiClient';

const RealtimeContext = createContext();

export function RealtimeProvider({ children }) {
  const [socketConnected, setSocketConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const lastStateRef = useRef({ doorLocked: null, lamps: null });

  useEffect(() => {
    let isMounted = true;

    // Smart High-Frequency Poller (Fallback Real-Time jika WS belum SSL)
    const smartPoller = setInterval(async () => {
      try {
        const [doorRes, lampRes] = await Promise.all([
          apiClient.get('/doors'),
          apiClient.get('/lamps')
        ]);

        if (!isMounted) return;

        // Cek perubahan status pintu
        if (doorRes.success && doorRes.data) {
          const isLocked = !!doorRes.data.is_locked;
          if (lastStateRef.current.doorLocked !== null && lastStateRef.current.doorLocked !== isLocked) {
            setLastMessage({
              type: 'DOOR_STATE_UPDATE',
              device_id: doorRes.data.device_id || 'DOOR-001',
              is_locked: isLocked
            });
          }
          lastStateRef.current.doorLocked = isLocked;
        }

        // Cek perubahan status lampu
        if (lampRes.success && lampRes.data) {
          const lData = lampRes.data;
          const lampKeyStr = `${lData.lamp1_on}-${lData.lamp2_on}-${lData.lamp3_on}-${lData.lamp4_on}-${lData.lamp1_brightness}-${lData.lamp2_brightness}-${lData.lamp3_brightness}-${lData.lamp4_brightness}`;
          if (lastStateRef.current.lamps !== null && lastStateRef.current.lamps !== lampKeyStr) {
            setLastMessage({
              type: 'LAMP_STATE_UPDATE',
              device_id: 'LAMPU-001',
              data: lData
            });
          }
          lastStateRef.current.lamps = lampKeyStr;
        }
      } catch (err) {
        // Silent error handling
      }
    }, 1200);

    // Coba koneksi WebSocket jika berada di protokol yang mendukung
    function connectWS() {
      if (window.location.protocol === 'https:') {
        // Browser HTTPS memblokir ws:// insecure, gunakan smartPoller di atas
        return;
      }

      if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
        return;
      }

      try {
        const ws = new WebSocket('ws://13.212.247.120/');
        wsRef.current = ws;

        ws.onopen = () => {
          if (!isMounted) return;
          console.log('⚡ [Web-WS] WebSocket Real-Time Aktif!');
          setSocketConnected(true);
        };

        ws.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const data = JSON.parse(event.data);
            setLastMessage(data);
          } catch (e) {}
        };

        ws.onclose = () => {
          if (!isMounted) return;
          setSocketConnected(false);
          reconnectTimeoutRef.current = setTimeout(connectWS, 4000);
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch (err) {
        reconnectTimeoutRef.current = setTimeout(connectWS, 4000);
      }
    }

    connectWS();

    return () => {
      isMounted = false;
      clearInterval(smartPoller);
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
