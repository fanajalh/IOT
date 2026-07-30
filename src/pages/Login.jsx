import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, EnvelopeSimple } from '@phosphor-icons/react';
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
    login(email);
    setLoading(false);
    navigate('/home');
  };

  return (
    <div className="auth-container">
      <div style={{ textAlign: 'center', marginBottom: '3rem', marginTop: '2rem' }}>
        <div className="flex-center" style={{ width: 80, height: 80, background: 'var(--accent-orange-light)', borderRadius: 24, margin: '0 auto 1.5rem', color: 'var(--accent-orange)' }}>
          <Lock size={40} weight="fill" />
        </div>
        <h1 className="heading-lg">Smart Home</h1>
        <p className="text-sub mt-2">Masuk ke akun Anda</p>
      </div>
      
      {error && (
        <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Email</label>
          <div style={{ position: 'relative' }}>
            <EnvelopeSimple size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="email@example.com"
              required 
              style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '12px', border: 'none', outline: 'none', fontSize: '1rem', fontFamily: 'var(--font-main)', boxShadow: 'var(--neu-pressed)', background: 'var(--card-bg)' }}
            />
          </div>
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Password</label>
          <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} required />
          <div style={{ textAlign: 'right', marginTop: '0.75rem' }}>
            <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--accent-orange)', textDecoration: 'none', fontWeight: 500 }}>
              Lupa Password?
            </Link>
          </div>
        </div>
        
        <button 
          type="submit" 
          className="btn-primary mt-2"
          disabled={loading}
        >
          {loading ? 'Authenticating...' : 'Masuk'}
        </button>
      </form>
    </div>
  );
}