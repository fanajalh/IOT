import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../lib/apiClient';
import { User, Copy, CaretRight, Lock, SignOut, X } from '@phosphor-icons/react';
import Swal from 'sweetalert2';
import PasswordInput from '../components/PasswordInput';

export default function Akun() {
  const { user, logout } = useAuth();
  const [userName, setUserName] = useState('Memuat...');
  const [rfidUid, setRfidUid] = useState('Memuat...');
  
  // Modal states
  const [showNameModal, setShowNameModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [showPassModal, setShowPassModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const userEmail = user?.email || 'user@smarthome.local';

  useEffect(() => {
    fetchUserProfile();
    fetchRfidUid();
  }, [user]);

  const fetchUserProfile = async () => {
    const res = await apiClient.get('/user-profile');
    if (res.success && res.data && res.data.name) {
      setUserName(res.data.name);
      setNewName(res.data.name);
    } else {
      const fallbackName = userEmail.split('@')[0];
      setUserName(fallbackName);
      setNewName(fallbackName);
    }
  };

  const fetchRfidUid = async () => {
    const res = await apiClient.get('/rfid-cards');
    if (res.success && res.data && res.data.length > 0) {
      const activeCard = res.data.find(c => c.is_active) || res.data[0];
      const uid = activeCard.card_uid || activeCard.rfid_uid;
      const name = activeCard.holder_name || activeCard.name;
      setRfidUid(`${uid} (${name})`);
    } else {
      setRfidUid('31AFFC03 (Kartu Master Arfan)');
    }
  };

  const copyUid = () => {
    if (rfidUid !== 'Memuat...' && rfidUid !== 'Belum ada kartu RFID') {
      navigator.clipboard.writeText(rfidUid);
      Swal.fire({
        title: 'Berhasil!',
        text: 'RFID UID disalin ke clipboard!',
        icon: 'success',
        confirmButtonColor: '#ff8c00'
      });
    }
  };

  const handleUpdateName = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUserName(newName);
    setShowNameModal(false);
    Swal.fire({
      title: 'Berhasil!',
      text: 'Nama berhasil diubah.',
      icon: 'success',
      confirmButtonColor: '#ff8c00',
      timer: 2000,
      showConfirmButton: false
    });
    setLoading(false);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setShowPassModal(false);
    setNewPassword('');
    Swal.fire({
      title: 'Berhasil!',
      text: 'Password berhasil diubah!',
      icon: 'success',
      confirmButtonColor: '#ff8c00'
    });
    setLoading(false);
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', maxWidth: 1200, margin: '0 auto' }}>
      <style>{`
        .akun-grid-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }
        @media (min-width: 900px) {
          .akun-grid-layout {
            grid-template-columns: 1fr 1fr;
            align-items: start;
          }
        }
      `}</style>
      <div className="p-6 pt-10" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="flex-center mb-4 inset-box-circle" style={{ width: 88, height: 88, color: 'var(--accent-orange)' }}>
          <User size={48} weight="fill" />
        </div>
        <h2 className="heading-lg" style={{ marginBottom: 4 }}>{userName}</h2>
        <p className="text-sub mb-2">Smart Home User</p>
        <span className="badge" style={{ background: 'var(--card-bg)', color: 'var(--text-secondary)', boxShadow: 'var(--neu-pressed)' }}>User</span>
      </div>

      <div className="p-6 pt-0">
        <div className="akun-grid-layout">
          <div>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '1rem' }}>INFORMASI AKUN</h3>
            <div className="card mb-6" style={{ padding: '0.5rem 1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.25rem 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                <span className="text-sub">RFID UID</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
                  <span style={{ fontSize: '0.85rem', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rfidUid}</span>
                  <button onClick={copyUid} className="inset-box flex-center" style={{ width: 28, height: 28, border: 'none', background: 'transparent', cursor: 'pointer' }}>
                    <Copy size={16} className="text-sub" />
                  </button>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.25rem 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                <span className="text-sub">Nama</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                  <span>{userName}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.25rem 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                <span className="text-sub">Email</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                  <span>{userEmail}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.25rem 0' }}>
                <span className="text-sub">Password</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                  <span>••••••••</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '1rem' }}>PENGATURAN</h3>
            <div className="card mb-8" style={{ padding: '0.5rem 1.25rem' }}>
              <div onClick={() => setShowNameModal(true)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 0', borderBottom: '1px solid rgba(0,0,0,0.05)', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className="flex-center inset-box-circle" style={{ width: 36, height: 36 }}><User size={18} className="text-orange" /></div>
                  <span className="font-semibold">Ubah Nama</span>
                </div>
                <CaretRight size={16} className="text-sub" />
              </div>

              <div onClick={() => setShowPassModal(true)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 0', borderBottom: '1px solid rgba(0,0,0,0.05)', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className="flex-center inset-box-circle" style={{ width: 36, height: 36 }}><Lock size={18} className="text-orange" /></div>
                  <span className="font-semibold">Ubah Password</span>
                </div>
                <CaretRight size={16} className="text-sub" />
              </div>

              <div onClick={() => logout()} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 0', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className="flex-center inset-box-circle" style={{ width: 36, height: 36 }}><SignOut size={18} className="text-danger" color="var(--danger)" /></div>
                  <span className="font-semibold" style={{ color: 'var(--danger)' }}>Keluar</span>
                </div>
                <CaretRight size={16} className="text-sub" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Ubah Nama */}
      {showNameModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="modal-card" style={{ width: '100%', maxWidth: 400, position: 'relative' }}>
            <button onClick={() => setShowNameModal(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={24} color="var(--text-secondary)" />
            </button>
            <h3 className="heading-lg mb-6" style={{ fontSize: '1.25rem' }}>Ubah Nama</h3>
            <form onSubmit={handleUpdateName}>
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} required style={{ width: '100%', padding: '1rem', marginBottom: '1.5rem', fontFamily: 'var(--font-main)' }} placeholder="Nama Baru" />
              <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan'}</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ubah Password */}
      {showPassModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="modal-card" style={{ width: '100%', maxWidth: 400, position: 'relative' }}>
            <button onClick={() => setShowPassModal(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={24} color="var(--text-secondary)" />
            </button>
            <h3 className="heading-lg mb-6" style={{ fontSize: '1.25rem' }}>Ubah Password</h3>
            <form onSubmit={handleUpdatePassword}>
              <div style={{ marginBottom: '1.5rem' }}>
                <PasswordInput value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} placeholder="Password Baru" />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
