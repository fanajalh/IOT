import { Outlet, Link, useLocation } from 'react-router-dom';
import { House, Door, Lightbulb, User } from '@phosphor-icons/react';

export default function Layout() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <div className="app-container">
      <Outlet />
      
      <nav className="bottom-nav">
        <Link to="/home" className={`nav-item ${path === '/home' ? 'active' : ''}`}>
          <House size={24} weight={path === '/home' ? "fill" : "regular"} />
          <span>Home</span>
        </Link>
        <Link to="/pintu" className={`nav-item ${path === '/pintu' ? 'active' : ''}`}>
          <Door size={24} weight={path === '/pintu' ? "fill" : "regular"} />
          <span>Pintu</span>
        </Link>
        <Link to="/lampu" className={`nav-item ${path === '/lampu' ? 'active' : ''}`}>
          <Lightbulb size={24} weight={path === '/lampu' ? "fill" : "regular"} />
          <span>Lampu</span>
        </Link>
        <Link to="/akun" className={`nav-item ${path === '/akun' ? 'active' : ''}`}>
          <User size={24} weight={path === '/akun' ? "fill" : "regular"} />
          <span>Akun</span>
        </Link>
      </nav>
    </div>
  );
}
