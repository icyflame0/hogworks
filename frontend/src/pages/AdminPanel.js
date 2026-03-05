import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function AdminPanel() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', checkInDate: '', checkOutDate: '', specialNotes: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('active');
  const [delId, setDelId] = useState(null);

  useEffect(() => { fetchGuests(); }, []);

  const fetchGuests = async () => {
    try { setGuests((await api.get('/guests')).data); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const addGuest = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      const res = await api.post('/guests', form);
      setNewCode(res.data.guest.accessCode); setNewName(res.data.guest.name);
      setShowAdd(false); setShowSuccess(true);
      setForm({ name: '', email: '', phone: '', checkInDate: '', checkOutDate: '', specialNotes: '' });
      fetchGuests();
    } catch (err) { setError(err.response?.data?.message || 'Failed to add guest'); }
    finally { setSaving(false); }
  };

  const deleteGuest = async (id) => {
    try { await api.delete(`/guests/${id}`); setDelId(null); fetchGuests(); } catch (e) { console.error(e); }
  };

  const toggleActive = async (g) => {
    try { await api.put(`/guests/${g._id}`, { isActive: !g.isActive }); fetchGuests(); } catch (e) { console.error(e); }
  };

  const today = new Date();
  const filtered = tab === 'active' ? guests.filter(g => g.isActive) : guests;
  const getStatus = (g) => {
    const ci = new Date(g.checkInDate), co = new Date(g.checkOutDate);
    if (today < ci) return { l: 'Upcoming', bg: 'rgba(23,45,120,0.4)', c: '#93c5fd', b: 'rgba(59,130,246,0.28)' };
    if (today >= ci && today <= co) return { l: 'Staying', bg: 'rgba(4,60,38,0.4)', c: '#6ee7b7', b: 'rgba(34,197,94,0.28)' };
    return { l: 'Checked Out', bg: 'rgba(25,25,25,0.4)', c: '#9ca3af', b: 'rgba(107,114,128,0.28)' };
  };
  const fmt = d => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : '';

  const Modal = ({ show, onClose, children }) => !show ? null : (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '16px' }}>
      <div onClick={e => e.stopPropagation()} className="animate-slide-up" style={{ width: '100%', maxWidth: '420px', background: 'linear-gradient(145deg,#2a0d42,#170826)', border: '1px solid rgba(201,168,76,0.28)', borderRadius: '22px', padding: '22px' }}>
        {children}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(170deg,#050010,#190929)' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(5,0,16,0.97)', borderBottom: '1px solid rgba(139,92,246,0.13)', backdropFilter: 'blur(14px)', padding: '11px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="gold-gradient" style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '13px' }}>HOGWORKS</div>
          <div style={{ color: 'rgba(167,139,250,0.42)', fontSize: '11px', marginTop: '1px' }}>Headmaster's Panel</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setShowAdd(true)} className="gold-btn" style={{ padding: '7px 14px', borderRadius: '10px', border: 'none', fontFamily: "'Cinzel', serif", fontSize: '12px', cursor: 'pointer' }}>+ Add Guest</button>
          <button onClick={() => { logout(); navigate('/'); }} style={{ padding: '7px 12px', borderRadius: '10px', border: '1px solid rgba(139,92,246,0.28)', background: 'transparent', color: 'rgba(167,139,250,0.55)', fontSize: '12px', cursor: 'pointer' }}>Exit</button>
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginBottom: '18px' }}>
          {[[guests.length, 'Total', '📋', 'rgba(110,70,0,0.28)', 'rgba(201,168,76,0.18)'], [guests.filter(g => g.isActive).length, 'Active', '✅', 'rgba(4,50,25,0.32)', 'rgba(34,197,94,0.18)'], [guests.filter(g => new Date(g.checkOutDate).toDateString() === today.toDateString()).length, 'Out Today', '🚪', 'rgba(80,8,8,0.32)', 'rgba(239,68,68,0.18)']].map(([v, l, ic, bg, b]) => (
            <div key={l} style={{ borderRadius: '14px', padding: '12px 7px', textAlign: 'center', background: bg, border: `1px solid ${b}` }}>
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>{ic}</div>
              <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: '22px', color: 'white' }}>{v}</div>
              <div style={{ color: 'rgba(201,168,76,0.4)', fontSize: '10px', marginTop: '2px' }}>{l}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
          {['active', 'all'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '7px 16px', borderRadius: '100px', fontFamily: "'Cinzel', serif", fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: tab === t ? 'none' : '1px solid rgba(201,168,76,0.18)', background: tab === t ? 'linear-gradient(135deg,#c9a84c,#f0c060)' : 'rgba(55,20,90,0.45)', color: tab === t ? '#1a0900' : 'rgba(201,168,76,0.62)' }}>
              {t === 'active' ? '✅ Active' : '📋 All Guests'}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px', color: 'rgba(201,168,76,0.4)' }}><div style={{ fontSize: '40px', marginBottom: '12px' }}>🔮</div>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px', color: 'rgba(201,168,76,0.3)' }}><div style={{ fontSize: '40px', marginBottom: '12px' }}>📜</div>No guests yet</div>
        ) : filtered.map(g => {
          const s = getStatus(g);
          return (
            <div key={g._id} className="animate-fade-in" style={{ borderRadius: '16px', padding: '15px', marginBottom: '9px', background: 'rgba(12,4,26,0.98)', border: '1px solid rgba(201,168,76,0.09)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '11px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg,#8b5e00,#c9a84c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: '14px', color: '#1a0900', flexShrink: 0 }}>{g.name.charAt(0)}</div>
                  <div>
                    <div style={{ color: 'white', fontFamily: "'Cinzel', serif", fontSize: '13px', fontWeight: 600 }}>{g.name}</div>
                    <div style={{ color: 'rgba(201,168,76,0.4)', fontSize: '11px', marginTop: '1px' }}>{g.phone || g.email || 'No contact'}</div>
                  </div>
                </div>
                <span style={{ fontSize: '10px', padding: '4px 10px', borderRadius: '100px', background: s.bg, color: s.c, border: `1px solid ${s.b}`, fontFamily: "'Cinzel', serif", fontWeight: 600, flexShrink: 0 }}>{s.l}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px', marginBottom: '11px' }}>
                {[['Check-in', g.checkInDate], ['Check-out', g.checkOutDate]].map(([lbl, d]) => (
                  <div key={lbl} style={{ background: 'rgba(0,0,0,0.22)', borderRadius: '9px', padding: '8px' }}>
                    <div style={{ color: 'rgba(201,168,76,0.4)', fontSize: '10px', marginBottom: '2px' }}>{lbl}</div>
                    <div style={{ color: 'white', fontFamily: "'Cinzel', serif", fontSize: '11px' }}>{fmt(d)}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ fontFamily: "'Cinzel', serif", fontSize: '11px', color: '#fbbf24', background: 'rgba(110,70,0,0.28)', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(201,168,76,0.18)' }}>{g.accessCode}</span>
                  <button onClick={() => navigator.clipboard.writeText(g.accessCode)} style={{ color: 'rgba(201,168,76,0.35)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}>📋</button>
                </div>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button onClick={() => toggleActive(g)} style={{ fontSize: '11px', padding: '5px 10px', borderRadius: '8px', border: '1px solid rgba(201,168,76,0.22)', background: 'transparent', color: 'rgba(201,168,76,0.55)', cursor: 'pointer', fontFamily: "'Cinzel', serif" }}>{g.isActive ? 'Deactivate' : 'Activate'}</button>
                  <button onClick={() => setDelId(g._id)} style={{ fontSize: '11px', padding: '5px 10px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.28)', background: 'transparent', color: 'rgba(239,68,68,0.55)', cursor: 'pointer' }}>🗑️</button>
                </div>
              </div>
              {g.reminderSent && <div style={{ marginTop: '7px', color: 'rgba(134,239,172,0.55)', fontSize: '11px' }}>✓ Checkout reminder sent</div>}
              {g.specialNotes && <div style={{ marginTop: '7px', background: 'rgba(80,20,120,0.18)', border: '1px solid rgba(139,92,246,0.18)', borderRadius: '8px', padding: '8px', color: 'rgba(196,181,253,0.62)', fontSize: '11px' }}>📝 {g.specialNotes}</div>}
            </div>
          );
        })}
      </div>

      <Modal show={showAdd} onClose={() => { setShowAdd(false); setError(''); }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
          <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: '14px', fontWeight: 600, color: '#fbbf24', margin: 0 }}>✨ Enroll New Guest</h3>
          <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', color: 'rgba(201,168,76,0.45)', fontSize: '24px', cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>
        <form onSubmit={addGuest} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '60vh', overflowY: 'auto', paddingRight: '2px' }}>
          {[['name', 'Full Name *', 'text', 'Harry Potter', true], ['phone', 'Phone', 'tel', '+91 XXXXX XXXXX', false], ['email', 'Email', 'email', 'guest@example.com', false]].map(([k, l, t, p, req]) => (
            <div key={k}>
              <label style={{ display: 'block', color: 'rgba(201,168,76,0.52)', fontSize: '10px', fontFamily: "'Cinzel', serif", letterSpacing: '.16em', textTransform: 'uppercase', marginBottom: '6px' }}>{l}</label>
              <input type={t} placeholder={p} value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} required={req} />
            </div>
          ))}
          {[['checkInDate', 'Check-in Date & Time *', true], ['checkOutDate', 'Check-out Date & Time *', true]].map(([k, l, req]) => (
            <div key={k}>
              <label style={{ display: 'block', color: 'rgba(201,168,76,0.52)', fontSize: '10px', fontFamily: "'Cinzel', serif", letterSpacing: '.16em', textTransform: 'uppercase', marginBottom: '6px' }}>{l}</label>
              <input type="datetime-local" value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} required={req} />
            </div>
          ))}
          <div>
            <label style={{ display: 'block', color: 'rgba(201,168,76,0.52)', fontSize: '10px', fontFamily: "'Cinzel', serif", letterSpacing: '.16em', textTransform: 'uppercase', marginBottom: '6px' }}>Special Notes</label>
            <textarea value={form.specialNotes} onChange={e => setForm({ ...form, specialNotes: e.target.value })} placeholder="Any special requirements..." rows={2} style={{ resize: 'none' }} />
          </div>
          {error && <div style={{ background: 'rgba(100,0,0,0.3)', border: '1px solid rgba(200,50,50,0.3)', borderRadius: '10px', padding: '10px', color: '#fca5a5', fontSize: '12px', textAlign: 'center' }}>{error}</div>}
          <button type="submit" disabled={saving} className="gold-btn" style={{ padding: '13px', border: 'none', borderRadius: '12px', fontFamily: "'Cinzel', serif", fontSize: '13px', cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
            {saving ? '✨ Enrolling...' : '🚪 Add Guest to Registry'}
          </button>
        </form>
      </Modal>

      <Modal show={showSuccess} onClose={() => setShowSuccess(false)}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '52px', marginBottom: '12px' }} className="animate-float">🎉</div>
          <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: '16px', fontWeight: 600, color: '#fbbf24', marginBottom: '8px' }}>Guest Enrolled!</h3>
          <p style={{ color: 'rgba(201,168,76,0.55)', fontSize: '13px', marginBottom: '16px' }}>{newName} has been added to the registry.</p>
          <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(201,168,76,0.28)', borderRadius: '14px', padding: '16px', marginBottom: '15px' }}>
            <div style={{ color: 'rgba(201,168,76,0.45)', fontSize: '11px', marginBottom: '6px' }}>Guest Access Code</div>
            <div className="gold-gradient" style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '24px', letterSpacing: '.2em' }}>{newCode}</div>
          </div>
          <button onClick={() => navigator.clipboard.writeText(newCode)} style={{ width: '100%', padding: '11px', borderRadius: '12px', border: '1px solid rgba(201,168,76,0.32)', background: 'transparent', color: 'rgba(201,168,76,0.65)', fontFamily: "'Cinzel', serif", fontSize: '12px', cursor: 'pointer', marginBottom: '8px' }}>📋 Copy Access Code</button>
          <button onClick={() => setShowSuccess(false)} className="gold-btn" style={{ width: '100%', padding: '12px', border: 'none', borderRadius: '12px', fontFamily: "'Cinzel', serif", fontSize: '13px', cursor: 'pointer' }}>Done</button>
        </div>
      </Modal>

      <Modal show={!!delId} onClose={() => setDelId(null)}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🗑️</div>
          <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: '14px', fontWeight: 600, color: 'white', marginBottom: '8px' }}>Remove Guest?</h3>
          <p style={{ color: 'rgba(201,168,76,0.45)', fontSize: '12px', marginBottom: '15px' }}>This will permanently delete the guest record.</p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setDelId(null)} style={{ flex: 1, padding: '11px', borderRadius: '12px', border: '1px solid rgba(201,168,76,0.28)', background: 'transparent', color: 'rgba(201,168,76,0.55)', fontFamily: "'Cinzel', serif", fontSize: '12px', cursor: 'pointer' }}>Cancel</button>
            <button onClick={() => deleteGuest(delId)} style={{ flex: 1, padding: '11px', borderRadius: '12px', border: 'none', background: 'rgba(180,25,25,0.85)', color: 'white', fontFamily: "'Cinzel', serif", fontSize: '12px', cursor: 'pointer' }}>Remove</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
