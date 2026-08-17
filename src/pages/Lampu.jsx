import { useState, useEffect } from 'react';
import { useLamps } from '../context/LampContext';
import { ArrowLeft, Clock, Power, Gear, Lightbulb, Moon, ShieldCheck } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

export default function Lampu() {
  const { lamps, localCounters, toggleLamp, updateBrightness, turnOffAllLamps, formatDuration, isNightMode, toggleNightMode, nightStayOnLamps, toggleNightStayOnLamp } = useLamps();
  const [selectedLampId, setSelectedLampId] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const ticker = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(ticker);
  }, []);

  if (lamps.length === 0) return <div className="p-6 text-gray-500">Memuat data lampu...</div>;

  // ==========================================
  // VIEW: LIST LAMPU
  // ==========================================
  if (!selectedLampId) {
    return (
      <div style={{ padding: '2rem', minHeight: '100vh', background: '#f0f2f5' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
          <Link to="/home" style={{ 
            color: '#4A5568', textDecoration: 'none', background: '#f0f2f5', 
            width: '45px', height: '45px', borderRadius: '50%', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '5px 5px 10px #d1d9e6, -5px -5px 10px #ffffff'
          }}>
            <ArrowLeft size={24} weight="bold" />
          </Link>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginLeft: '1.5rem', color: '#2D3748', margin: 0 }}>Daftar Lampu</h2>
        </div>

        {/* CARD MODE MALAM (NIGHT SECURITY MODE) */}
        <div style={{ 
          background: '#f0f2f5', borderRadius: '24px', padding: '1.5rem', marginBottom: '2rem',
          boxShadow: isNightMode 
            ? 'inset 5px 5px 10px #d1d9e6, inset -5px -5px 10px #ffffff, 0 10px 20px rgba(128, 90, 213, 0.15)' 
            : '8px 8px 16px #d1d9e6, -8px -8px 16px #ffffff',
          border: isNightMode ? '2px solid rgba(128, 90, 213, 0.4)' : '2px solid transparent',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isNightMode ? '1.2rem' : '0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
              <div style={{ 
                width: 50, height: 50, borderRadius: '16px',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                background: isNightMode ? '#805AD5' : '#f0f2f5',
                boxShadow: isNightMode 
                  ? '0 8px 15px rgba(128, 90, 213, 0.4)' 
                  : 'inset 4px 4px 8px #d1d9e6, inset -4px -4px 8px #ffffff'
              }}>
                <Moon size={26} weight="fill" color={isNightMode ? "#fff" : "#A0AEC0"} />
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#2D3748', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Mode Malam (Otomatisasi Pintu ↔ Lampu)
                  {isNightMode && <ShieldCheck size={18} color="#805AD5" weight="fill" />}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#718096', fontWeight: 600, marginTop: '2px' }}>
                  {isNightMode 
                    ? '🌙 Kustomisasi lampu yang TETAP ON saat pintu dikunci di bawah ini'
                    : '☀️ Mode Siang: Semua lampu mati saat pintu dikunci'}
                </div>
              </div>
            </div>
            <div 
              onClick={toggleNightMode}
              style={{
                width: '52px', height: '28px', borderRadius: '14px', flexShrink: 0,
                background: isNightMode ? '#805AD5' : '#d1d5db',
                boxShadow: isNightMode 
                  ? 'inset 2px 2px 4px rgba(0,0,0,0.15)' 
                  : 'inset 3px 3px 6px #b8bec7, inset -3px -3px 6px #ffffff',
                position: 'relative', cursor: 'pointer', transition: 'all 0.3s ease'
              }}
            >
              <div style={{
                width: '22px', height: '22px', borderRadius: '50%',
                background: '#fff', position: 'absolute', top: '3px',
                left: isNightMode ? '27px' : '3px',
                boxShadow: '2px 2px 5px rgba(0,0,0,0.2)',
                transition: 'left 0.3s ease'
              }}></div>
            </div>
          </div>

          {/* CHECKLIST KUSTOMISASI LAMPU TETAP ON */}
          {isNightMode && (
            <div style={{ 
              background: 'rgba(128, 90, 213, 0.06)', borderRadius: '16px', padding: '1rem 1.2rem',
              border: '1px solid rgba(128, 90, 213, 0.2)'
            }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#553C9A', marginBottom: '0.8rem' }}>
                📌 Pilih Lampu yang TETAP MENYALA saat Pintu Dikunci:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.8rem' }}>
                {lamps.map(lamp => {
                  const isChecked = nightStayOnLamps.includes(lamp.key);
                  return (
                    <div 
                      key={lamp.key} 
                      onClick={() => toggleNightStayOnLamp(lamp.key)}
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                        fontSize: '0.85rem', fontWeight: 700,
                        color: isChecked ? '#553C9A' : '#718096',
                        padding: '6px 12px', borderRadius: '12px',
                        background: isChecked ? 'rgba(128, 90, 213, 0.15)' : '#f0f2f5',
                        transition: 'all 0.2s ease',
                        userSelect: 'none'
                      }}
                    >
                      <input 
                        type="checkbox" 
                        checked={isChecked} 
                        onChange={() => {}} 
                        style={{ accentColor: '#805AD5', width: 16, height: 16, cursor: 'pointer', pointerEvents: 'none' }} 
                      />
                      {lamp.name}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
          {lamps.map((lamp) => (
            <div 
              key={lamp.id} 
              onClick={() => setSelectedLampId(lamp.id)}
              style={{ 
                cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '1rem',
                padding: '1.5rem', background: '#f0f2f5', borderRadius: '24px',
                boxShadow: lamp.status 
                  ? 'inset 5px 5px 10px #d1d9e6, inset -5px -5px 10px #ffffff, 0 10px 20px rgba(255, 159, 28, 0.15)' 
                  : '8px 8px 16px #d1d9e6, -8px -8px 16px #ffffff',
                border: lamp.status ? '2px solid rgba(255, 159, 28, 0.5)' : '2px solid transparent',
                transition: 'all 0.3s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', width: '100%' }}>
                <div style={{ 
                  width: 55, height: 55, borderRadius: '18px',
                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                  background: lamp.status ? '#FF9F1C' : '#f0f2f5',
                  boxShadow: lamp.status 
                    ? '0 8px 15px rgba(255, 159, 28, 0.4)' 
                    : 'inset 4px 4px 8px #d1d9e6, inset -4px -4px 8px #ffffff'
                }}>
                  <Lightbulb size={28} weight={lamp.status ? "fill" : "regular"} color={lamp.status ? "#fff" : "#A0AEC0"} style={{ transform: 'rotate(180deg)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#2D3748', marginBottom: '4px' }}>{lamp.name}</div>
                  <div style={{ fontSize: '0.85rem', color: lamp.status ? '#FF9F1C' : '#A0AEC0', fontWeight: 700 }}>
                    {lamp.status ? `Menyala (${lamp.brightness ?? 100}%)` : 'Mati'}
                  </div>
                  {lamp.status && (
                    <div style={{ fontSize: '0.75rem', color: '#A0AEC0', fontWeight: 600, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={14} weight="bold" color="#FF9F1C" />
                      {formatDuration(localCounters[lamp.id] || 0)}
                    </div>
                  )}
                </div>
                {/* Toggle Switch */}
                <div 
                  onClick={(e) => { e.stopPropagation(); toggleLamp(lamp.id, lamp.status); }}
                  style={{
                    width: '52px', height: '28px', borderRadius: '14px', flexShrink: 0,
                    background: lamp.status ? '#FF9F1C' : '#d1d5db',
                    boxShadow: lamp.status 
                      ? 'inset 2px 2px 4px rgba(0,0,0,0.15)' 
                      : 'inset 3px 3px 6px #b8bec7, inset -3px -3px 6px #ffffff',
                    position: 'relative', cursor: 'pointer', transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{
                    width: '22px', height: '22px', borderRadius: '50%',
                    background: '#fff', position: 'absolute', top: '3px',
                    left: lamp.status ? '27px' : '3px',
                    boxShadow: '2px 2px 5px rgba(0,0,0,0.2)',
                    transition: 'left 0.3s ease'
                  }}></div>
                </div>
              </div>

              {/* SLIDER KECERAHAN (DIMMER 0% - 100%) */}
              <div 
                onClick={(e) => e.stopPropagation()}
                style={{ 
                  background: 'rgba(255, 159, 28, 0.08)', borderRadius: '14px', padding: '0.6rem 1rem',
                  display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px'
                }}
              >
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#FF9F1C', minWidth: '60px' }}>
                  🔆 {lamp.brightness ?? 100}%
                </span>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={lamp.brightness ?? (lamp.status ? 100 : 0)}
                  onChange={(e) => updateBrightness(lamp.id, e.target.value)}
                  style={{ flex: 1, accentColor: '#FF9F1C', cursor: 'pointer' }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* TOMBOL MATIKAN SEMUA */}
        {lamps.some(l => l.status) && (
          <button
            onClick={turnOffAllLamps}
            style={{
              width: '100%', marginTop: '2rem', padding: '1rem 1.5rem',
              background: '#f0f2f5', borderRadius: '20px', border: '2px solid rgba(239, 68, 68, 0.4)',
              boxShadow: 'inset 5px 5px 10px #d1d9e6, inset -5px -5px 10px #ffffff, 0 8px 20px rgba(239, 68, 68, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem',
              cursor: 'pointer', transition: 'all 0.3s ease', color: '#EF4444',
              fontSize: '1rem', fontWeight: 800
            }}
          >
            <Power size={22} weight="bold" />
            Matikan Semua Lampu
          </button>
        )}
      </div>
    );
  }

  // ==========================================
  // VIEW: DETAIL LAMPU (FIX HP SLIDER)
  // ==========================================
  const activeLamp = lamps.find(l => l.id === selectedLampId) || lamps[0];
  const isLampOn = activeLamp.status;
  
  const themeLevel = isLampOn ? (activeLamp.brightness || 100) : 0;
  const isLightMode = themeLevel > 50;

  const lightnessMain = 5 + (90 * (themeLevel / 100)); 
  const lightnessBottom = 10 + (90 * (themeLevel / 100)); 

  // CSS Variable biar Render CPU HP ringan
  const dynamicStyles = {
    '--bg-main': `hsl(0, 0%, ${lightnessMain}%)`,
    '--bg-bottom': `hsl(0, 0%, ${lightnessBottom}%)`,
    '--text-main': isLightMode ? '#1A202C' : '#F7FAFC',
    '--text-muted': isLightMode ? '#718096' : '#A0AEC0',
    '--glass-bg': isLightMode ? 'rgba(0, 0, 0, 0.03)' : 'rgba(255, 255, 255, 0.05)',
    '--glass-border': isLightMode ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
    '--shadow-mode': isLightMode ? '0 8px 32px rgba(0,0,0,0.05)' : '0 8px 32px rgba(0,0,0,0.6)',
    '--thumb-bg': isLightMode ? '#FFF' : '#222',
    '--thumb-border': isLampOn ? '#FF9F1C' : '#555',
    '--track-bg': `linear-gradient(to right, ${isLampOn ? '#FF9F1C' : '#4A5568'} ${activeLamp.brightness || 100}%, ${isLightMode ? '#E2E8F0' : '#2D3748'} ${activeLamp.brightness || 100}%)`
  };

  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const dayName = days[currentTime.getDay()];
  const timeString = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <>
      <style>{`
        /* --- RESET PENGATURAN SLIDER HP BAWAAN WEBKIT --- */
        input[type=range].custom-slider {
          -webkit-appearance: none;
          width: 100%;
          background: transparent;
          margin: 10px 0;
          touch-action: none;
          cursor: pointer;
        }
        input[type=range].custom-slider:focus {
          outline: none;
        }
        
        /* 1. JALUR SLIDER (TRACK) */
        input[type=range].custom-slider::-webkit-slider-runnable-track {
          width: 100%; height: 12px; cursor: pointer;
          background: var(--track-bg);
          border-radius: 10px; border: none;
        }
        input[type=range].custom-slider::-moz-range-track {
          width: 100%; height: 12px; cursor: pointer;
          background: var(--track-bg);
          border-radius: 10px; border: none;
        }

        /* 2. BULATAN PEGANGAN (THUMB) */
        input[type=range].custom-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          box-shadow: 0 0 15px rgba(0,0,0,0.3);
          border: 5px solid var(--thumb-border);
          height: 32px; width: 32px; border-radius: 50%;
          background: var(--thumb-bg);
          cursor: pointer;
          margin-top: -10px; /* Posisikan thumb di tengah track */
          transition: border-color 0.2s ease, background 0.2s ease;
        }
        input[type=range].custom-slider::-moz-range-thumb {
          box-shadow: 0 0 15px rgba(0,0,0,0.3);
          border: 5px solid var(--thumb-border);
          height: 32px; width: 32px; border-radius: 50%;
          background: var(--thumb-bg);
          cursor: pointer;
          transition: border-color 0.2s ease, background 0.2s ease;
        }
        
        /* --- LAYOUT WRAPPER --- */
        .detail-backdrop {
          position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
          background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(8px);
          z-index: 9998;
        }
        .detail-wrapper {
          position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
          background-color: var(--bg-main); color: var(--text-main);
          z-index: 9999; display: flex; flex-direction: column; justify-content: space-between;
          transition: background-color 0.1s ease-out, color 0.3s ease;
        }
        @media (min-width: 768px) {
          .detail-wrapper {
            top: 50%; left: 50%; transform: translate(-50%, -50%);
            width: 90vw; max-width: 620px; height: 90vh; max-height: 820px;
            border-radius: 36px; box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3);
            overflow: hidden; border: 1px solid var(--glass-border);
          }
        }
        .main-content {
          flex: 1; position: relative; display: flex; align-items: center; justify-content: center;
          width: 100%; max-width: 1000px; margin: 0 auto; padding: 0 2rem;
        }
        
        /* --- MENCEGAH PHANTOM OVERLAP --- */
        .widget-container {
          position: absolute; width: 100%; padding: 0 2rem;
          display: flex; justify-content: space-between; align-items: center;
          top: 50%; transform: translateY(-50%); z-index: 5;
          pointer-events: none;
        }
        .widget-item-time, .widget-item-duration {
          pointer-events: auto;
        }
        
        .power-btn-container {
          position: absolute; bottom: 10%; z-index: 10;
          pointer-events: none;
        }
        .power-btn-container button {
          pointer-events: auto;
        }
        
        @media (max-width: 768px) {
          .widget-container { top: 5%; transform: none; }
          .widget-item-time {
            flex-direction: row !important; padding: 0.8rem 1.2rem !important; gap: 1rem !important;
            border-radius: 20px !important;
          }
          .widget-item-time .divider { width: 2px !important; height: 20px !important; margin: 0 !important; }
          .widget-item-duration {
            flex-direction: row !important; padding: 0.8rem 1.2rem !important; gap: 0.5rem !important;
            border-radius: 20px !important;
          }
          .widget-item-duration .divider { display: none; }
          .widget-item-duration .text-vertical { writing-mode: horizontal-tb !important; transform: none !important; }
        }
      `}</style>
      <div className="detail-backdrop" onClick={() => setSelectedLampId(null)}></div>
      <div className="detail-wrapper" style={dynamicStyles}>
        
        {/* Top Navbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', zIndex: 10 }}>
          <button onClick={() => setSelectedLampId(null)} style={{ 
            background: 'var(--glass-bg)', border: `1px solid var(--glass-border)`, color: 'var(--text-main)', 
            width: '45px', height: '45px', borderRadius: '14px', cursor: 'pointer', 
            backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.3s ease'
          }}>
            <ArrowLeft size={24} weight="bold" />
          </button>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, transition: 'color 0.4s ease' }}>{activeLamp.name}</h2>
          <div style={{ width: 45 }}></div> 
        </div>

        {/* Center Content */}
        <div className="main-content">
          
          <div className="widget-container">
            <div className="widget-item-time" style={{ 
              background: 'var(--glass-bg)', backdropFilter: 'blur(12px)', borderRadius: '30px', 
              padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center',
              border: `1px solid var(--glass-border)`, boxShadow: 'var(--shadow-mode)', transition: 'all 0.3s ease'
            }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{dayName}</div>
              <div className="divider" style={{ width: '100%', height: '2px', background: isLightMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)' }}></div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: isLampOn ? '#FF9F1C' : 'var(--text-main)' }}>{timeString}</div>
            </div>

            <div className="widget-item-duration" style={{ 
              background: 'var(--glass-bg)', backdropFilter: 'blur(12px)', borderRadius: '30px', 
              padding: '1.5rem 0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
              border: `1px solid var(--glass-border)`, boxShadow: 'var(--shadow-mode)', transition: 'all 0.3s ease'
            }}>
              <Clock size={24} color={isLampOn ? '#FF9F1C' : 'var(--text-muted)'} weight="bold" />
              <div className="divider" style={{ width: '2px', height: '30px', background: isLightMode ? `linear-gradient(to bottom, #FF9F1C, transparent)` : 'rgba(255,255,255,0.1)' }}></div>
              <div className="text-vertical" style={{ fontSize: '0.9rem', fontWeight: 700, writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                {formatDuration(localCounters[activeLamp.id] || 0)}
              </div>
            </div>
          </div>

          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, top: '-5%', pointerEvents: 'none' }}>
            <Lightbulb 
              size={220} weight={isLampOn ? "fill" : "regular"} 
              color={isLampOn ? `rgba(255, 159, 28, ${(themeLevel + 20) / 100})` : "#333"}
              style={{
                transform: 'rotate(180deg)', zIndex: 3,
                transition: 'all 0.2s ease',
              }}
            />
          </div>

          <div className="power-btn-container">
            <button 
              onClick={() => toggleLamp(activeLamp.id, activeLamp.status)}
              style={{
                width: '85px', height: '85px', borderRadius: '50%',
                background: isLampOn ? '#FF9F1C' : 'var(--glass-bg)',
                border: `4px solid ${isLampOn ? '#FFB142' : 'var(--glass-border)'}`,
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                cursor: 'pointer', backdropFilter: 'blur(10px)',
                boxShadow: isLampOn ? `0 10px 30px rgba(255, 159, 28, ${(themeLevel/100) * 0.8})` : 'var(--shadow-mode)',
                transition: 'all 0.3s ease'
              }}
            >
              <Power size={40} color={isLampOn ? '#FFF' : 'var(--text-muted)'} weight="bold" />
            </button>
          </div>

        </div>

        {/* BOTTOM PANEL */}
        <div style={{ 
          background: 'var(--bg-bottom)', padding: '2rem 2.5rem 3rem 2.5rem', 
          borderTopLeftRadius: '40px', borderTopRightRadius: '40px',
          zIndex: 10, width: '100%',
          boxShadow: isLightMode ? '0 -10px 40px rgba(0,0,0,0.05)' : '0 -15px 50px rgba(0,0,0,0.6)',
          transition: 'background-color 0.1s ease-out'
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem', fontWeight: 700 }}>
                <span>Redup</span>
                <span>Terang</span>
              </div>
              
              {/* SLIDER SUDAH DIBERSIHKAN DARI PENGUNCI TOUCH HP */}
              <input 
                type="range" min="0" max="100" 
                value={activeLamp.brightness || 100}
                onChange={(e) => updateBrightness(activeLamp.id, parseInt(e.target.value))}
                onInput={(e) => updateBrightness(activeLamp.id, parseInt(e.target.value))}
                className="custom-slider"
                style={{
                  position: 'relative', zIndex: 50
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ color: 'var(--text-muted)' }}><Lightbulb size={28} weight={isLampOn ? "fill" : "regular"} style={{ transform: 'rotate(180deg)' }} /></div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', fontWeight: 800, color: isLampOn ? 'var(--text-main)' : '#FFF', lineHeight: 1, transition: 'color 0.4s ease' }}>
                  {activeLamp.brightness || 100}<span style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>%</span>
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.4rem', fontWeight: 700 }}>Tingkat Kecerahan</div>
              </div>
              <div style={{ color: 'var(--text-muted)' }}><Gear size={28} /></div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}