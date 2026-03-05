import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import GuestDashboard from './pages/GuestDashboard';
import AdminPanel from './pages/AdminPanel';

function Protected({ children, role }) {
  const { token, role: userRole, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg,#060012,#1a0a2e)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '60px', marginBottom: '16px', animation: 'float 3s ease-in-out infinite' }}>🏰</div>
        <p style={{ fontFamily: "'Cinzel', serif", color: 'rgba(201,168,76,0.6)', fontSize: '13px' }}>Opening the gates...</p>
      </div>
    </div>
  );
  if (!token) return <Navigate to="/" replace />;
  if (role && userRole !== role) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  const { token, role } = useAuth();
  return (
    <Routes>
      <Route path="/" element={token ? <Navigate to={role === 'admin' ? '/admin' : '/dashboard'} replace /> : <LoginPage />} />
      <Route path="/dashboard" element={<Protected role="guest"><GuestDashboard /></Protected>} />
      <Route path="/admin" element={<Protected role="admin"><AdminPanel /></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
