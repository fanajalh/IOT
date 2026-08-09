import { useState, useEffect } from 'react';
import { Lock } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      Swal.fire('Gagal!', 'Password dan konfirmasi tidak cocok.', 'error');
      return;
    }
    
    if (password.length < 6) {
      Swal.fire('Gagal!', 'Password minimal 6 karakter.', 'error');
      return;
    }

    setLoading(true);
    
    Swal.fire({
      title: 'Berhasil!',
      text: 'Password berhasil diperbarui. Silakan login kembali dengan password baru Anda.',
      icon: 'success',
      confirmButtonColor: '#ff8c00',
    }).then(() => {
      navigate('/');
    });
    setLoading(false);
  };

  return (
    <div className="auth-container">

      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div className="flex-center inset-box-circle" style={{ width: 80, height: 80, margin: '0 auto 1.5rem', color: 'var(--accent-orange)' }}>
          <Lock size={40} weight="fill" />
        </div>
        <h1 className="heading-lg">Buat Password Baru</h1>
        <p className="text-sub mt-2">Masukkan password baru Anda di bawah ini.</p>
      </div>
      
      <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Password Baru</label>
          <div style={{ position: 'relative' }}>
            <Lock size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••"
              required
              minLength={6}
              style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', fontSize: '1rem', fontFamily: 'var(--font-main)' }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Konfirmasi Password</label>
          <div style={{ position: 'relative' }}>
            <Lock size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              placeholder="••••••••"
              required
              minLength={6}
              style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', fontSize: '1rem', fontFamily: 'var(--font-main)' }}
            />
          </div>
        </div>
        
        <button 
          type="submit" 
          className="btn-primary mt-2"
          disabled={loading}
        >
          {loading ? 'Memperbarui...' : 'Simpan Password Baru'}
        </button>
      </form>
    </div>
  );
}
