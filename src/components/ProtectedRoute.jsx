import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // Saat masih mengecek sesi, tampilkan layar kosong (bukan flash halaman)
  if (loading) {
    return <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }} />;
  }

  // Jika tidak ada user → tendang ke login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
}
