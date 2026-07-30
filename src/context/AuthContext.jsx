import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('smart_home_user');
    return saved ? JSON.parse(saved) : { id: 'usr_001', email: 'user@smarthome.local' };
  });
  const [loading, setLoading] = useState(false);

  const login = (email) => {
    const u = { id: 'usr_001', email: email || 'user@smarthome.local' };
    setUser(u);
    localStorage.setItem('smart_home_user', JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('smart_home_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);