import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('hw_token');
    const r = localStorage.getItem('hw_role');
    const u = localStorage.getItem('hw_user');
    if (t && r) { setToken(t); setRole(r); if (u) setUser(JSON.parse(u)); }
    setLoading(false);
  }, []);

  const loginAdmin = (t) => {
    setToken(t); setRole('admin'); setUser({ role: 'admin' });
    localStorage.setItem('hw_token', t);
    localStorage.setItem('hw_role', 'admin');
    localStorage.setItem('hw_user', JSON.stringify({ role: 'admin' }));
  };

  const loginGuest = (t, g) => {
    setToken(t); setRole('guest'); setUser(g);
    localStorage.setItem('hw_token', t);
    localStorage.setItem('hw_role', 'guest');
    localStorage.setItem('hw_user', JSON.stringify(g));
  };

  const logout = () => {
    setToken(null); setRole(null); setUser(null);
    localStorage.removeItem('hw_token');
    localStorage.removeItem('hw_role');
    localStorage.removeItem('hw_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, role, loading, loginAdmin, loginGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
