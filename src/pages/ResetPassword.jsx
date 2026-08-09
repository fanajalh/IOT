import { useState } from 'react';
import { LockKey, ArrowLeft, ArrowRight, ShieldCheck } from '@phosphor-icons/react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import PasswordInput from '../components/PasswordInput';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      Swal.fire({
        title: 'Gagal!',
        text: 'Password dan konfirmasi password tidak cocok.',
        icon: 'error',
        confirmButtonColor: '#E53E3E'
      });
      return;
    }
    
    if (password.length < 6) {
      Swal.fire({
        title: 'Gagal!',
        text: 'Password minimal 6 karakter.',
        icon: 'error',
        confirmButtonColor: '#E53E3E'
      });
      return;
    }

    setLoading(true);
    
    Swal.fire({
      title: 'Berhasil!',
      text: 'Password berhasil diperbarui. Silakan login kembali dengan password baru Anda.',
      icon: 'success',
      confirmButtonColor: '#FF9F1C',
    }).then(() => {
      navigate('/');
    });
    setLoading(false);
  };

  return (
    <>
      <style>{`
        .reset-page-bg {
          min-height: 100vh;
          background: #f0f2f5;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
        }
        .reset-card {
          width: 100%;
          max-width: 440px;
          background: #f0f2f5;
          border-radius: 28px;
          padding: 2.5rem 2rem;
          box-shadow: 12px 12px 24px #d1d9e6, -12px -12px 24px #ffffff;
          transition: all 0.3s ease;
        }
        .reset-back-btn {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: #f0f2f5;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 4px 4px 8px #d1d9e6, -4px -4px 8px #ffffff;
          color: #2D3748;
          text-decoration: none;
          margin-bottom: 1.5rem;
          transition: all 0.2s ease;
        }
        .reset-input-group {
          margin-bottom: 1.25rem;
        }
        .reset-input-label {
          display: block;
          font-size: 0.82rem;
          font-weight: 700;
          color: #4A5568;
          margin-bottom: 0.5rem;
          letter-spacing: 0.3px;
        }
        .reset-submit-btn {
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
        .reset-submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 6px 10px 20px #c2cbda, -6px -6px 14px #ffffff, 0 12px 24px rgba(255, 159, 28, 0.45);
        }
      `}</style>

      <div className="reset-page-bg">
        <div className="reset-card">

          <Link to="/" className="reset-back-btn" title="Kembali ke Login">
            <ArrowLeft size={20} weight="bold" />
          </Link>

          {/* Logo Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <img src="/clef-logo.svg" alt="IOT CLEF Logo" style={{ width: 64, height: 64, margin: '0 auto 0.8rem', display: 'block', filter: 'drop-shadow(0 6px 12px rgba(255, 159, 28, 0.3))' }} />
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2D3748', margin: '0 0 0.3rem 0', letterSpacing: '-0.5px' }}>
              IOT <span style={{ color: '#FF9F1C' }}>CLEF</span>
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#718096', margin: 0, fontWeight: 500 }}>
              Buat password baru untuk akun Anda
            </p>
          </div>
          
          <form onSubmit={handleUpdate}>
            <div className="reset-input-group">
              <label className="reset-input-label">PASSWORD BARU</label>
              <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="••••••••" />
            </div>

            <div className="reset-input-group">
              <label className="reset-input-label">KONFIRMASI PASSWORD BARU</label>
              <PasswordInput value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} placeholder="••••••••" />
            </div>
            
            <button 
              type="submit" 
              className="reset-submit-btn mt-4"
              disabled={loading}
            >
              {loading ? (
                <span>Memperbarui...</span>
              ) : (
                <>
                  <span>Simpan Password Baru</span>
                  <LockKey size={20} weight="fill" />
                </>
              )}
            </button>
          </form>

        </div>
      </div>
    </>
  );
}
