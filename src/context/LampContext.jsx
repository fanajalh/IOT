import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { apiClient } from '../lib/apiClient';

const LampContext = createContext();

export function LampProvider({ children }) {
  const [lamps, setLamps] = useState([
    { id: 1, key: 'lamp1_on', name: 'Lampu 1 (Ruang Tamu)', status: false },
    { id: 2, key: 'lamp2_on', name: 'Lampu 2 (Kamar Utama)', status: false },
    { id: 3, key: 'lamp3_on', name: 'Lampu 3 (Dapur)', status: false },
    { id: 4, key: 'lamp4_on', name: 'Lampu 4 (Teras)', status: false },
  ]);
  const [localCounters, setLocalCounters] = useState({});
  const lampsRef = useRef([]);

  useEffect(() => {
    lampsRef.current = lamps;
  }, [lamps]);

  useEffect(() => {
    fetchLamps();

    // Auto sync with server every 2 seconds
    const pollInterval = setInterval(() => {
      fetchLamps();
    }, 2000);

    // Global ticker for lamp active durations
    const ticker = setInterval(() => {
      setLocalCounters(prev => {
        const next = { ...prev };
        lampsRef.current.forEach(lamp => {
          if (lamp.status) next[lamp.id] = (next[lamp.id] || 0) + 1;
          else next[lamp.id] = 0;
        });
        return next;
      });
    }, 1000);

    return () => {
      clearInterval(pollInterval);
      clearInterval(ticker);
    };
  }, []);

  const fetchLamps = async () => {
    const res = await apiClient.get('/lamps');
    if (res.success && res.data) {
      const data = res.data;
      setLamps([
        { id: 1, key: 'lamp1_on', name: 'Lampu 1 (Ruang Tamu)', status: !!data.lamp1_on, brightness: data.lamp1_brightness ?? 100 },
        { id: 2, key: 'lamp2_on', name: 'Lampu 2 (Kamar Utama)', status: !!data.lamp2_on, brightness: data.lamp2_brightness ?? 100 },
        { id: 3, key: 'lamp3_on', name: 'Lampu 3 (Dapur)', status: !!data.lamp3_on, brightness: data.lamp3_brightness ?? 100 },
        { id: 4, key: 'lamp4_on', name: 'Lampu 4 (Teras)', status: !!data.lamp4_on, brightness: data.lamp4_brightness ?? 100 },
      ]);
    }
  };

  const toggleLamp = async (id, currentStatus) => {
    const targetLamp = lamps.find(l => l.id === id);
    if (!targetLamp) return;
    const newStatus = !currentStatus;

    setLamps(prev => prev.map(lamp => lamp.id === id ? { ...lamp, status: newStatus } : lamp));
    
    const res = await apiClient.post('/lamps/toggle', {
      lampKey: targetLamp.key,
      status: newStatus
    });

    if (!res.success) {
      setLamps(prev => prev.map(lamp => lamp.id === id ? { ...lamp, status: currentStatus } : lamp));
    }
  };

  const updateBrightness = async (id, brightnessValue) => {
    const targetLamp = lamps.find(l => l.id === id);
    if (!targetLamp) return;
    const bVal = Math.max(0, Math.min(100, parseInt(brightnessValue) || 0));

    setLamps(prev => prev.map(lamp => lamp.id === id ? { ...lamp, brightness: bVal, status: bVal > 0 } : lamp));

    await apiClient.post('/lamps/brightness', {
      lampKey: targetLamp.key,
      brightness: bVal
    });
  };

  const turnOffAllLamps = async () => {
    const activeLamps = lamps.filter(l => l.status);
    if (activeLamps.length === 0) return;

    setLamps(prev => prev.map(lamp => ({ ...lamp, status: false })));
    await apiClient.post('/lamps/off-all');
  };

  const cascadeTurnOnAll = async () => {
    const offLamps = lampsRef.current.filter(l => !l.status);
    if (offLamps.length === 0) return;
    for (let i = 0; i < offLamps.length; i++) {
      const target = offLamps[i];
      setLamps(prev => prev.map(lamp => lamp.id === target.id ? { ...lamp, status: true } : lamp));
      await apiClient.post('/lamps/toggle', { lampKey: target.key, status: true });
      if (i < offLamps.length - 1) await new Promise(r => setTimeout(r, 300));
    }
  };

  const cascadeTurnOffAll = async () => {
    const onLamps = lampsRef.current.filter(l => l.status);
    if (onLamps.length === 0) return;
    for (let i = 0; i < onLamps.length; i++) {
      const target = onLamps[i];
      setLamps(prev => prev.map(lamp => lamp.id === target.id ? { ...lamp, status: false } : lamp));
      await apiClient.post('/lamps/toggle', { lampKey: target.key, status: false });
      if (i < onLamps.length - 1) await new Promise(r => setTimeout(r, 300));
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0 dtk';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}j ${m}m`;
    if (m > 0) return `${m}m ${s}d`;
    return `${s} dtk`;
  };

  const [isNightMode, setIsNightMode] = useState(true);
  const [nightStayOnLamps, setNightStayOnLamps] = useState(['lamp4_on']);

  // Load night mode config from server on mount
  useEffect(() => {
    const loadNightConfig = async () => {
      const res = await apiClient.get('/night-mode-config');
      if (res.success && res.data) {
        setIsNightMode(!!res.data.night_mode_enabled);
        const stayOn = [];
        if (res.data.night_lamp1_stay_on) stayOn.push('lamp1_on');
        if (res.data.night_lamp2_stay_on) stayOn.push('lamp2_on');
        if (res.data.night_lamp3_stay_on) stayOn.push('lamp3_on');
        if (res.data.night_lamp4_stay_on) stayOn.push('lamp4_on');
        setNightStayOnLamps(stayOn);
      }
    };
    loadNightConfig();
  }, []);

  const saveNightConfigToDB = async (enabled, stayOnArr) => {
    await apiClient.post('/night-mode-config', {
      night_mode_enabled: enabled,
      stay_on_lamps: stayOnArr
    });
  };

  const toggleNightMode = () => {
    setIsNightMode(prev => {
      const next = !prev;
      saveNightConfigToDB(next, nightStayOnLamps);
      return next;
    });
  };

  const toggleNightStayOnLamp = (lampKey) => {
    setNightStayOnLamps(prev => {
      const next = prev.includes(lampKey)
        ? prev.filter(k => k !== lampKey)
        : [...prev, lampKey];
      saveNightConfigToDB(isNightMode, next);
      return next;
    });
  };

  return (
    <LampContext.Provider value={{
      lamps, localCounters, fetchLamps,
      toggleLamp, updateBrightness, turnOffAllLamps,
      cascadeTurnOnAll, cascadeTurnOffAll, formatDuration,
      isNightMode, toggleNightMode,
      nightStayOnLamps, toggleNightStayOnLamp
    }}>
      {children}
    </LampContext.Provider>
  );
}

export const useLamps = () => useContext(LampContext);
