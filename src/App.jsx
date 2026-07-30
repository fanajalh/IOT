import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Home from './pages/Home';
import Pintu from './pages/Pintu';
import Lampu from './pages/Lampu';
import Akun from './pages/Akun';
import ForgotPassword from './pages/ForgotPassword';
import Layout from './components/Layout';
import SplashScreen from './components/SplashScreen';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorPage from './components/ErrorPage';

function App() {
  const { user, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash || loading) {
    return <SplashScreen />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={user ? <Navigate to="/home" replace /> : <Login />} />
      <Route path="/forgot-password" element={user ? <Navigate to="/home" replace /> : <ForgotPassword />} />
      
      {/* Protected Routes */}
      <Route element={<Layout />}>
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/pintu" element={<ProtectedRoute><Pintu /></ProtectedRoute>} />
        <Route path="/lampu" element={<ProtectedRoute><Lampu /></ProtectedRoute>} />
        <Route path="/akun" element={<ProtectedRoute><Akun /></ProtectedRoute>} />
      </Route>
      
      {/* Redirects */}
      <Route path="/dashboard" element={<Navigate to="/home" replace />} />
      
      {/* Error Pages */}
      <Route path="/403" element={<ErrorPage code={403} title="Akses Ditolak" message="Halaman ini tidak boleh diakses oleh publik." />} />
      <Route path="/419" element={<ErrorPage code={419} title="Sesi Berakhir" message="Sesi login Anda sudah kedaluwarsa. Silakan login kembali." />} />
      <Route path="/500" element={<ErrorPage code={500} title="Kesalahan Server" message="Terjadi masalah pada server. Silakan coba beberapa saat lagi." />} />
      <Route path="*" element={<ErrorPage code={404} title="Halaman Tidak Ditemukan" message="Halaman yang Anda cari tidak ada atau telah dipindahkan." />} />
    </Routes>
  );
}

export default App;