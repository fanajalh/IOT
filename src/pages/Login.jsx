import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../lib/apiClient';
import { LockKey, EnvelopeSimple, ShieldCheck, ArrowRight, WarningCircle } from '@phosphor-icons/react';
import { Link, useNavigate } from 'react-router-dom';
import PasswordInput from '../components/PasswordInput';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.post('/login', { email, password });
      if (res.success && res.data) {
        login(res.data);
        navigate('/home');
      } else {
        setError(res.message || 'Email atau password yang Anda masukkan salah.');
      }
    } catch (err) {
      setError('Gagal terhubung ke server. Silakan pastikan server backend aktif.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .login-page-bg {
          min-height: 100vh;
          background: #f0f2f5;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          position: relative;
        }
        .login-card {
          width: 100%;
          max-width: 440px;
          background: #f0f2f5;
          border-radius: 28px;
          padding: 2.5rem 2rem;
          box-shadow: 12px 12px 24px #d1d9e6, -12px -12px 24px #ffffff;
          transition: all 0.3s ease;
        }
        .login-icon-box {
          width: 86px;
          height: 86px;
          border-radius: 50%;
          background: #f0f2f5;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          box-shadow: inset 6px 6px 12px #d1d9e6, inset -6px -6px 12px #ffffff;
          position: relative;
        }
        .login-icon-inner {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #FF9F1C 0%, #FF7600 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          box-shadow: 0 10px 20px rgba(255, 159, 28, 0.4);
        }
        .login-input-group {
          margin-bottom: 1.25rem;
        }
        .login-input-label {
          display: block;
          font-size: 0.82rem;
          font-weight: 700;
          color: #4A5568;
          margin-bottom: 0.5rem;
          letter-spacing: 0.3px;
        }
        .login-input-wrapper {
          position: relative;
        }
        .login-input-field {
          width: 100%;
          padding: 0.95rem 1rem 0.95rem 3rem;
          border-radius: 16px;
          border: none;
          outline: none;
          font-size: 0.95rem;
          font-family: inherit;
          background: #f0f2f5 !important;
          color: #2D3748;
          box-shadow: inset 4px 4px 8px #d1d9e6, inset -4px -4px 8px #ffffff !important;
          transition: all 0.2s ease;
        }
        .login-input-field:focus {
          box-shadow: inset 5px 5px 10px #c2cbda, inset -5px -5px 10px #ffffff, 0 0 0 2px rgba(255, 159, 28, 0.5) !important;
        }
        .login-submit-btn {
          width: 100%;
          padding: 1rem;
          border-radius: 16px;
          border: none;
          background: linear-gradient(135deg, #FF9F1C 0%, #FF7600 100%);
          color: #ffffff;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          box-shadow: 6px 6px 14px #d1d9e6, -6px -6px 14px #ffffff, 0 8px 16px rgba(255, 159, 28, 0.3);
          transition: all 0.25s ease;
        }
        .login-submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 6px 10px 20px #c2cbda, -6px -6px 14px #ffffff, 0 12px 24px rgba(255, 159, 28, 0.45);
        }
        .login-submit-btn:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: inset 4px 4px 8px rgba(0,0,0,0.2);
        }
        .demo-chip {
          background: #f0f2f5;
          border: 1px solid rgba(255, 159, 28, 0.3);
          border-radius: 14px;
          padding: 0.6rem 0.9rem;
          font-size: 0.78rem;
          color: #4A5568;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          margin-bottom: 1.5rem;
          box-shadow: 4px 4px 8px #d1d9e6, -4px -4px 8px #ffffff;
          transition: all 0.2s ease;
        }
        .demo-chip:hover {
          background: #fff8f0;
          border-color: #FF9F1C;
        }
      `}</style>

      <div className="login-page-bg">
        <div className="login-card">
          
          {/* Header Icon */}
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <img src="/clef-logo.svg" alt="IOT CLEF Logo" style={{ width: 72, height: 72, margin: '0 auto 1rem', display: 'block', filter: 'drop-shadow(0 8px 16px rgba(255, 159, 28, 0.35))' }} />
          </div>

          {/* Title & Subtitle */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2D3748', margin: '0 0 0.4rem 0', letterSpacing: '-0.5px' }}>
              IOT <span style={{ color: '#FF9F1C' }}>CLEF</span>
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#718096', margin: 0, fontWeight: 500 }}>
              Sistem kontrol pintar pintu & lampu berbasis IoT
            </p>
          </div>

          {/* Alert Error */}
          {error && (
            <div style={{ 
              background: '#FFF5F5', border: '1px solid #FEB2B2', color: '#E53E3E',
              padding: '0.85rem 1rem', borderRadius: '14px', marginBottom: '1.5rem',
              fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.6rem'
            }}>
              <WarningCircle size={22} weight="bold" style={{ flexShrink: 0 }} />
              <div>{error}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin}>
            
            {/* Field Email */}
            <div className="login-input-group">
              <label className="login-input-label">EMAIL AKUN</label>
              <div className="login-input-wrapper">
                <EnvelopeSimple size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#A0AEC0' }} />
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="email@smarthome.local"
                  required 
                  className="login-input-field"
                />
              </div>
            </div>

            {/* Field Password */}
            <div className="login-input-group">
              <label className="login-input-label">PASSWORD</label>
              <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
              <div style={{ textAlign: 'right', marginTop: '0.6rem' }}>
                <Link to="/forgot-password" style={{ fontSize: '0.78rem', color: '#FF9F1C', textDecoration: 'none', fontWeight: 700 }}>
                  Lupa Password?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="login-submit-btn mt-4"
              disabled={loading}
            >
              {loading ? (
                <span>Mengautentikasi...</span>
              ) : (
                <>
                  <span>Masuk ke Dashboard</span>
                  <ArrowRight size={20} weight="bold" />
                </>
              )}
            </button>

          </form>

          {/* Footer badge */}
          <div style={{ marginTop: '2rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.75rem', color: '#A0AEC0', fontWeight: 600 }}>
            <ShieldCheck size={16} color="#38A169" weight="fill" />
            <span>Terhubung Aman dengan Neon PostgreSQL</span>
          </div>

        </div>
      </div>
    </>
  );
}