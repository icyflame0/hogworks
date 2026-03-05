import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function LoginPage() {
  const [mode, setMode] = useState('guest');
  const [accessCode, setAccessCode] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { loginAdmin, loginGuest } = useAuth();
  const navigate = useNavigate();

  const handleGuest = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const res = await api.post('/auth/guest/login', { accessCode });
      loginGuest(res.data.token, res.data.guest);
      navigate('/dashboard');
    } catch (err) { setError(err.response?.data?.message || 'Invalid access code.'); }
    finally { setLoading(false); }
  };

  const handleAdmin = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const res = await api.post('/auth/admin/login', { password: adminPassword });
      loginAdmin(res.data.token);
      navigate('/admin');
    } catch (err) { setError(err.response?.data?.message || 'Invalid password.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: 'linear-gradient(180deg,#060012,#1a0a2e,#2d1045)' }}>
      {[...Array(40)].map((_, i) => (
        <div key={i} className="fixed rounded-full bg-white pointer-events-none"
          style={{ left: `${Math.random()*100}%`, top: `${Math.random()*100}%`, width: `${Math.random()*2.5+0.5}px`, height: `${Math.random()*2.5+0.5}px`, opacity: Math.random()*0.6+0.1, animation: `sparkle ${Math.random()*3+2}s ease-in-out infinite`, animationDelay: `${Math.random()*3}s` }} />
      ))}

      <div className="w-full max-w-sm relative z-10 animate-slide-up">
        <div className="text-center mb-8">
          <div className="text-6xl mb-3 animate-float">🏰</div>
          <h1 className="font-magical text-2xl gold-gradient mb-1" style={{ fontFamily: "'Cinzel Decorative', serif" }}>HOGWORKS</h1>
          <p style={{ fontFamily: "'Cinzel', serif", fontSize: '10px', color: 'rgba(201,168,76,0.5)', letterSpacing: '.35em' }}>GUEST ASSISTANT</p>
        </div>

        <div className="flex rounded-xl overflow-hidden mb-5 border border-yellow-600/20">
          <button onClick={() => { setMode('guest'); setError(''); }}
            className="flex-1 py-2.5 text-xs font-semibold transition-all cursor-pointer border-none"
            style={{ fontFamily: "'Cinzel', serif", background: mode === 'guest' ? 'linear-gradient(135deg,#5c2c00,#8a4e00)' : 'transparent', color: mode === 'guest' ? '#f5d87a' : 'rgba(201,168,76,0.45)' }}>
            🧳 Guest Entry
          </button>
          <button onClick={() => { setMode('admin'); setError(''); }}
            className="flex-1 py-2.5 text-xs font-semibold transition-all cursor-pointer border-none"
            style={{ fontFamily: "'Cinzel', serif", background: mode === 'admin' ? 'linear-gradient(135deg,#380c5a,#5b1a88)' : 'transparent', color: mode === 'admin' ? '#d8b4fe' : 'rgba(201,168,76,0.45)' }}>
            🧙 Headmaster
          </button>
        </div>

        <div className="spell-card rounded-2xl p-6">
          {mode === 'guest' ? (
            <form onSubmit={handleGuest}>
              <div className="text-center mb-4">
                <p style={{ color: 'rgba(201,168,76,0.7)', fontSize: '13px' }}>Enter your magical access code</p>
                <p style={{ color: 'rgba(201,168,76,0.35)', fontSize: '11px', marginTop: '4px' }}>Found in your booking confirmation</p>
              </div>
              <label style={{ display: 'block', color: 'rgba(201,168,76,0.55)', fontSize: '10px', fontFamily: "'Cinzel', serif", letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: '7px' }}>Access Code</label>
              <input value={accessCode} onChange={e => setAccessCode(e.target.value.toUpperCase())} placeholder="HW-XXXXXX" required
                style={{ textAlign: 'center', fontFamily: "'Cinzel', serif", fontSize: '18px', letterSpacing: '.3em', marginBottom: '14px' }} />
              {error && <div style={{ background: 'rgba(100,0,0,.3)', border: '1px solid rgba(200,50,50,.3)', borderRadius: '10px', padding: '10px', marginBottom: '12px', color: '#fca5a5', fontSize: '12px', textAlign: 'center' }}>{error}</div>}
              <button type="submit" disabled={loading} className="gold-btn w-full py-3 rounded-xl cursor-pointer border-none"
                style={{ fontFamily: "'Cinzel', serif", fontSize: '13px', letterSpacing: '.07em', opacity: loading ? 0.6 : 1 }}>
                {loading ? '✨ Opening doors...' : '🚪 Enter Hogworks'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleAdmin}>
              <div className="text-center mb-4">
                <p style={{ color: 'rgba(216,180,254,0.7)', fontSize: '13px' }}>Headmaster's Chamber</p>
                <p style={{ color: 'rgba(216,180,254,0.35)', fontSize: '11px', marginTop: '4px' }}>Restricted access only</p>
              </div>
              <label style={{ display: 'block', color: 'rgba(216,180,254,0.55)', fontSize: '10px', fontFamily: "'Cinzel', serif", letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: '7px' }}>Password</label>
              <input type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} placeholder="Enter the secret" required style={{ marginBottom: '14px' }} />
              {error && <div style={{ background: 'rgba(100,0,0,.3)', border: '1px solid rgba(200,50,50,.3)', borderRadius: '10px', padding: '10px', marginBottom: '12px', color: '#fca5a5', fontSize: '12px', textAlign: 'center' }}>{error}</div>}
              <button type="submit" disabled={loading} className="w-full py-3 rounded-xl cursor-pointer border-none font-bold"
                style={{ fontFamily: "'Cinzel', serif", fontSize: '13px', background: 'linear-gradient(135deg,#52169e,#7c2ede)', color: 'white', opacity: loading ? 0.6 : 1 }}>
                {loading ? '🔮 Verifying...' : '🔐 Enter Chamber'}
              </button>
            </form>
          )}
        </div>
        <p className="text-center mt-4" style={{ color: 'rgba(201,168,76,0.2)', fontSize: '11px' }}>✦ Hogworks Magical Homestay ✦</p>
      </div>
    </div>
  );
}
