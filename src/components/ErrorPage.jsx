import { WarningCircle, Prohibit, Clock, Bug, House } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

export default function ErrorPage({ code, title, message }) {
  
  const getIcon = () => {
    switch(code) {
      case 403: return <Prohibit size={64} weight="fill" color="var(--danger)" />;
      case 404: return <WarningCircle size={64} weight="fill" color="var(--accent-orange)" />;
      case 419: return <Clock size={64} weight="fill" color="var(--text-muted)" />;
      case 500: return <Bug size={64} weight="fill" color="var(--danger)" />;
      default: return <WarningCircle size={64} weight="fill" color="var(--accent-orange)" />;
    }
  };

  return (
    <div className="auth-container" style={{ alignItems: 'center', textAlign: 'center' }}>
      <div className="flex-center inset-box-circle" style={{ width: 140, height: 140, marginBottom: '2rem' }}>
        {getIcon()}
      </div>
      
      <h1 style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, marginBottom: '0.5rem' }}>
        {code}
      </h1>
      
      <h2 className="heading-lg mb-4" style={{ color: 'var(--text-secondary)' }}>
        {title}
      </h2>
      
      <p className="text-sub mb-6" style={{ maxWidth: 300, margin: '0 auto 2rem' }}>
        {message}
      </p>
      
      <Link to="/" className="btn-primary" style={{ textDecoration: 'none', minWidth: 200 }}>
        <House size={20} weight="fill" />
        Kembali ke Beranda
      </Link>
    </div>
  );
}
