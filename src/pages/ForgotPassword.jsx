import { useState } from 'react';
import { EnvelopeSimple, ArrowLeft, Lock, ShieldCheck } from '@phosphor-icons/react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import PasswordInput from '../components/PasswordInput';

const API_URL = 'http://localhost:3001/api';

export default function ForgotPassword() {
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // STEP 1 — Kirim kode ke email via backend kita
  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch(`${API_URL}/send-reset-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (data.success) {
        Swal.fire({
          title: 'Kode Dikirim!',
          text: 'Cek inbox email Anda untuk kode verifikasi 6 digit.',
          icon: 'success',
          confirmButtonColor: '#ff8c00',
          timer: 3000,
          showConfirmButton: false,
        });
        setStep(2);
      } else {
        Swal.fire('Gagal!', data.message, 'error');
      }
    } catch {
      Swal.fire('Error!', 'Tidak bisa terhubung ke server.', 'error');
    }
    setLoading(false);
  };

  // STEP 2 — Verifikasi kode
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch(`${API_URL}/verify-reset-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });
      const data = await res.json();

      if (data.success) {
        Swal.fire({
          title: 'Kode Terverifikasi!',
          text: 'Silakan buat password baru Anda.',
          icon: 'success',
          confirmButtonColor: '#ff8c00',
          timer: 2000,
          showConfirmButton: false,
        });
        setStep(3);
      } else {
        Swal.fire('Gagal!', data.message, 'error');
      }
    } catch {
      Swal.fire('Error!', 'Tidak bisa terhubung ke server.', 'error');
    }
    setLoading(false);
  };

  // STEP 3 — Set password baru via backend
  const handleResetPassword = async (e) => {
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
    
    try {
      const res = await fetch(`${API_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword: password })
      });
      const data = await res.json();

      if (data.success) {
        Swal.fire({
          title: 'Berhasil!',
          text: 'Password berhasil diperbarui. Silakan login kembali.',
          icon: 'success',
          confirmButtonColor: '#ff8c00',
        }).then(() => {
          navigate('/');
        });
      } else {
        Swal.fire('Gagal!', data.message, 'error');
      }
    } catch {
      Swal.fire('Error!', 'Tidak bisa terhubung ke server.', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="topbar" style={{ padding: '0 0 2rem 0', background: 'transparent' }}>
        <Link to="/" className="topbar-icon" style={{ color: 'inherit', textDecoration: 'none' }}>
          <ArrowLeft size={24} />
        </Link>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {[1,2,3].map(s => (
            <div key={s} style={{ 
              width: s === step ? 24 : 8, 
              height: 8, 
              borderRadius: 4, 
              background: s <= step ? 'var(--accent-orange)' : '#d1d5db',
              transition: 'all 0.3s ease'
            }} />
          ))}
        </div>
      </div>

      {/* ===== STEP 1: Masukkan Email ===== */}
      {step === 1 && (
        <>
          <div style={{ marginBottom: '2rem' }}>
            <div className="flex-center inset-box-circle" style={{ width: 64, height: 64, marginBottom: '1.5rem', color: 'var(--accent-orange)' }}>
              <EnvelopeSimple size={32} weight="fill" />
            </div>
            <h1 className="heading-lg">Lupa Password?</h1>
            <p className="text-sub mt-2">Masukkan email Anda. Kami akan mengirim kode verifikasi 6 digit.</p>
          </div>
          
          <form onSubmit={handleSendCode} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Email</label>
              <div style={{ position: 'relative' }}>
                <EnvelopeSimple size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)} 
                  placeholder="email@example.com" required 
                  style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', fontSize: '1rem', fontFamily: 'var(--font-main)' }}
                />
              </div>
            </div>
            <button type="submit" className="btn-primary mt-2" disabled={loading}>
              {loading ? 'Mengirim...' : 'Kirim Kode Verifikasi'}
            </button>
          </form>
        </>
      )}

      {/* ===== STEP 2: Masukkan Kode ===== */}
      {step === 2 && (
        <>
          <div style={{ marginBottom: '2rem' }}>
            <div className="flex-center inset-box-circle" style={{ width: 64, height: 64, marginBottom: '1.5rem', color: 'var(--accent-orange)' }}>
              <ShieldCheck size={32} weight="fill" />
            </div>
            <h1 className="heading-lg">Masukkan Kode</h1>
            <p className="text-sub mt-2">Kami telah mengirim kode 6 digit ke <strong>{email}</strong></p>
          </div>
          
          <form onSubmit={handleVerifyCode} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Kode Verifikasi</label>
              <input 
                type="text" value={code} 
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} 
                placeholder="000000" required maxLength={6}
                style={{ width: '100%', padding: '1.25rem', fontSize: '2rem', fontFamily: 'var(--font-main)', textAlign: 'center', letterSpacing: '0.75rem', fontWeight: 700 }}
              />
            </div>
            <button type="submit" className="btn-primary mt-2" disabled={loading || code.length !== 6}>
              {loading ? 'Memverifikasi...' : 'Verifikasi Kode'}
            </button>
            <button type="button" onClick={() => { setStep(1); setCode(''); }} className="btn-secondary" style={{ marginTop: '-0.5rem' }}>
              Kirim Ulang Kode
            </button>
          </form>
        </>
      )}

      {/* ===== STEP 3: Password Baru ===== */}
      {step === 3 && (
        <>
          <div style={{ marginBottom: '2rem' }}>
            <div className="flex-center inset-box-circle" style={{ width: 64, height: 64, marginBottom: '1.5rem', color: 'var(--accent-orange)' }}>
              <Lock size={32} weight="fill" />
            </div>
            <h1 className="heading-lg">Password Baru</h1>
            <p className="text-sub mt-2">Masukkan password baru untuk akun Anda.</p>
          </div>
          
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Password Baru</label>
              <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Konfirmasi Password</label>
              <PasswordInput value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} />
            </div>
            <button type="submit" className="btn-primary mt-2" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Password Baru'}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
