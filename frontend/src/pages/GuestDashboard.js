import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Chatbot from '../components/Chatbot';
import api from '../utils/api';

const NAV = [
  { id: 'checkin', icon: '🔐', label: 'Check-In' },
  { id: 'wifi', icon: '📶', label: 'WiFi' },
  { id: 'appliances', icon: '🔌', label: 'Appliances' },
  { id: 'power', icon: '⚡', label: 'Power' },
  { id: 'location', icon: '🗺️', label: 'Location' },
  { id: 'contact', icon: '📱', label: 'Contact' },
  { id: 'chat', icon: '🧙', label: 'Dobby' },
];

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  return (
    <button onClick={copy} style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(201,168,76,0.3)', background: 'transparent', color: copied ? '#86efac' : 'rgba(201,168,76,0.6)', cursor: 'pointer' }}>
      {copied ? '✓' : '📋'}
    </button>
  );
}

export default function GuestDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [guest, setGuest] = useState(user);
  const [active, setActive] = useState('checkin');

  useEffect(() => {
    if (user?.id) api.get('/guests/me').then(r => setGuest(r.data)).catch(() => {});
  }, [user]);

  const goSec = (id) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const co = guest?.checkOutDate ? new Date(guest.checkOutDate) : null;
  const ci = guest?.checkInDate ? new Date(guest.checkInDate) : null;
  const daysLeft = co ? Math.ceil((co - new Date()) / 86400000) : null;
  const fmt = d => d?.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  const SC = ({ id, icon, title, children }) => (
    <div id={id} className="section-card animate-slide-up" style={{ borderRadius: '18px', padding: '20px', marginBottom: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', paddingBottom: '11px', borderBottom: '1px solid rgba(201,168,76,0.09)' }}>
        <span style={{ fontSize: '19px' }}>{icon}</span>
        <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: '14px', fontWeight: 600, color: '#fbbf24', margin: 0 }}>{title}</h2>
      </div>
      {children}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(170deg,#050010,#190929)' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(5,0,16,0.97)', borderBottom: '1px solid rgba(201,168,76,0.1)', backdropFilter: 'blur(14px)', padding: '11px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="gold-gradient" style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '13px' }}>HOGWORKS</div>
            <div style={{ color: 'rgba(201,168,76,0.4)', fontSize: '11px', marginTop: '1px' }}>Welcome, {guest?.name || user?.name} ✨</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {daysLeft !== null && <div style={{ fontSize: '11px', fontFamily: "'Cinzel', serif", fontWeight: 600, color: daysLeft <= 0 ? '#f87171' : '#fbbf24' }}>{daysLeft <= 0 ? 'Checkout today!' : `${daysLeft}d left`}</div>}
            <button onClick={() => { logout(); navigate('/'); }} style={{ fontSize: '11px', padding: '5px 10px', borderRadius: '8px', border: '1px solid rgba(201,168,76,0.18)', background: 'transparent', color: 'rgba(201,168,76,0.45)', cursor: 'pointer', fontFamily: "'Cinzel', serif" }}>Exit</button>
          </div>
        </div>
        {(ci || co) && (
          <div style={{ display: 'flex', gap: '14px', marginTop: '5px' }}>
            {ci && <span style={{ fontSize: '10px', color: 'rgba(201,168,76,0.45)' }}>📅 In: <b style={{ color: '#fbbf24' }}>{fmt(ci)}</b></span>}
            {co && <span style={{ fontSize: '10px', color: 'rgba(201,168,76,0.45)' }}>📅 Out: <b style={{ color: '#fbbf24' }}>{fmt(co)}</b></span>}
            <span style={{ fontSize: '10px', color: 'rgba(201,168,76,0.45)' }}>🚪 Room: <b style={{ color: '#fbbf24' }}>328</b></span>
          </div>
        )}
      </div>

      <div style={{ position: 'sticky', top: '62px', zIndex: 40, background: 'linear-gradient(rgba(5,0,16,0.96),transparent)', padding: '9px 16px', overflowX: 'auto', whiteSpace: 'nowrap', scrollbarWidth: 'none' }}>
        <div style={{ display: 'inline-flex', gap: '7px' }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => goSec(n.id)}
              style={{ flexShrink: 0, padding: '7px 13px', borderRadius: '100px', fontSize: '11px', fontFamily: "'Cinzel', serif", fontWeight: 600, cursor: 'pointer', transition: 'all .2s', border: active === n.id ? 'none' : '1px solid rgba(201,168,76,0.18)', background: active === n.id ? 'linear-gradient(135deg,#c9a84c,#f0c060)' : 'rgba(55,20,90,0.45)', color: active === n.id ? '#1a0900' : 'rgba(201,168,76,0.65)' }}>
              {n.icon} {n.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '6px 16px 60px' }}>
        <SC id="checkin" icon="🔐" title="Check-In Instructions">
          {[['Lockbox Code', '1010', true, true], ['Room Number', '328', true, false]].map(([l, v, c, h]) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ color: 'rgba(201,168,76,0.58)', fontSize: '13px' }}>{l}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: h ? '21px' : '16px', fontWeight: h ? 700 : 600, color: h ? '#fbbf24' : 'white' }}>{v}</span>
                {c && <CopyBtn text={v} />}
              </div>
            </div>
          ))}
          <div style={{ background: 'rgba(25,40,85,0.35)', border: '1px solid rgba(70,120,200,0.28)', borderRadius: '12px', padding: '12px', marginTop: '10px' }}>
            <p style={{ color: 'rgba(147,197,253,0.85)', fontSize: '12px', lineHeight: '1.65', margin: 0 }}>💡 Find the lockbox at the main entrance. Enter code <b style={{ color: '#93c5fd' }}>1010</b> to get your key. Room is <b style={{ color: '#93c5fd' }}>328</b>.</p>
          </div>
          <div style={{ background: 'rgba(80,15,15,0.35)', border: '1px solid rgba(200,60,60,0.25)', borderRadius: '12px', padding: '12px', marginTop: '8px' }}>
            <p style={{ color: 'rgba(252,165,165,0.82)', fontSize: '12px', margin: 0 }}>🍳 Breakfast is <b style={{ color: '#f87171' }}>not included</b> in your stay.</p>
          </div>
        </SC>

        <SC id="wifi" icon="📶" title="WiFi Details">
          <div style={{ background: 'rgba(0,0,0,0.28)', border: '1px solid rgba(74,144,217,0.22)', borderRadius: '14px', padding: '18px', textAlign: 'center', marginBottom: '12px' }}>
            <div style={{ fontSize: '34px', marginBottom: '8px' }}>📶</div>
            <div style={{ color: 'rgba(201,168,76,0.45)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.22em', marginBottom: '4px' }}>Password</div>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: '23px', fontWeight: 700, color: 'white', letterSpacing: '.1em' }}>home@328</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 0' }}>
            <span style={{ color: 'rgba(201,168,76,0.58)', fontSize: '13px' }}>WiFi Password</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: '15px', fontWeight: 600, color: '#7dd3fc' }}>home@328</span>
              <CopyBtn text="home@328" />
            </div>
          </div>
        </SC>

        <SC id="appliances" icon="🔌" title="Appliance Guide">
          {[['⚡', 'MCB (Main Circuit Breaker)', 'Behind the door'], ['❄️', 'AC Switch', 'Left side of window, behind the curtains'], ['🧊', 'Fridge Plug', 'Above the fridge on the slab'], ['🚿', 'Geyser Switch', 'Wall near the mirror in bathroom']].map(([ic, name, loc]) => (
            <div key={name} style={{ display: 'flex', gap: '12px', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.045)', marginBottom: '8px' }}>
              <div style={{ fontSize: '26px', flexShrink: 0 }}>{ic}</div>
              <div><div style={{ color: 'white', fontFamily: "'Cinzel', serif", fontSize: '12px', fontWeight: 600, marginBottom: '3px' }}>{name}</div><div style={{ color: 'rgba(201,168,76,0.55)', fontSize: '11px' }}>📍 {loc}</div></div>
            </div>
          ))}
        </SC>

        <SC id="power" icon="⚡" title="Power Guidelines">
          <div style={{ background: 'rgba(100,0,0,0.28)', border: '1px solid rgba(220,50,50,0.38)', borderRadius: '14px', padding: '14px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '24px' }}>⚠️</span>
              <div>
                <div style={{ color: '#fca5a5', fontFamily: "'Cinzel', serif", fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Important Warning</div>
                <p style={{ color: 'rgba(252,165,165,0.85)', fontSize: '13px', lineHeight: '1.65', margin: 0 }}>Do <b>NOT</b> run AC, Geyser, and Induction simultaneously — this will trip the electricity.</p>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '7px', marginBottom: '9px' }}>
            {['❄️ AC', '🚿 Geyser', '🍳 Induction'].map(item => (
              <div key={item} style={{ flex: 1, textAlign: 'center', padding: '9px 5px', borderRadius: '10px', background: 'rgba(100,0,0,0.22)', border: '1px solid rgba(220,50,50,0.22)', color: '#fca5a5', fontSize: '11px' }}>{item}</div>
            ))}
          </div>
          <div style={{ textAlign: 'center', color: 'rgba(252,165,165,0.35)', fontSize: '11px', marginBottom: '12px' }}>↑ Never run all three together ↑</div>
          <div style={{ background: 'rgba(10,60,30,0.32)', border: '1px solid rgba(50,200,80,0.28)', borderRadius: '14px', padding: '14px' }}>
            <div style={{ color: '#86efac', fontFamily: "'Cinzel', serif", fontSize: '12px', fontWeight: 600, marginBottom: '10px' }}>⚡ If electricity goes off:</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'rgba(10,60,30,0.55)', border: '1px solid rgba(50,200,80,0.38)', borderRadius: '10px', padding: '10px 15px', textAlign: 'center', flexShrink: 0 }}>
                <div style={{ fontFamily: "'Cinzel', serif", fontSize: '23px', fontWeight: 700, color: '#86efac' }}>#01</div>
                <div style={{ fontSize: '10px', color: 'rgba(134,239,172,0.45)' }}>press on meter</div>
              </div>
              <p style={{ color: 'rgba(134,239,172,0.82)', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>If the meter beeps, press <b style={{ color: '#86efac' }}>#01</b> on the meter to restore power.</p>
            </div>
          </div>
        </SC>

        <SC id="location" icon="🗺️" title="Location">
          <div style={{ borderRadius: '14px', overflow: 'hidden', marginBottom: '12px', border: '1px solid rgba(139,92,246,0.18)' }}>
            <iframe src="https://maps.google.com/maps?q=12.9716,77.5946&t=&z=15&ie=UTF8&iwloc=&output=embed" width="100%" height="195" style={{ border: 0, display: 'block' }} allowFullScreen loading="lazy" title="Location" />
          </div>
          <a href="https://maps.app.goo.gl/egrbYGxThMiRZwhi7" target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '13px', borderRadius: '12px', background: 'linear-gradient(135deg,#1d4ed8,#2563eb)', color: 'white', fontFamily: "'Cinzel', serif", fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}>
            🗺️ Open in Google Maps
          </a>
        </SC>

        <SC id="contact" icon="📱" title="Contact Host">
          <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', margin: '0 auto 12px', background: 'linear-gradient(135deg,#3d1a5e,#6b21a8)' }}>🧙</div>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: '15px', fontWeight: 600, color: 'white', marginBottom: '4px' }}>Your Host</div>
            <div style={{ color: 'rgba(201,168,76,0.45)', fontSize: '12px' }}>Hogworks Magical Homestay</div>
          </div>
          <a href="tel:+917536835669" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '13px', borderRadius: '12px', background: 'linear-gradient(135deg,#14532d,#16a34a)', color: 'white', fontFamily: "'Cinzel', serif", fontSize: '13px', fontWeight: 600, textDecoration: 'none', marginBottom: '10px' }}>📞 Call: +91 75368 35669</a>
          <a href="https://wa.me/917536835669" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '13px', borderRadius: '12px', background: 'linear-gradient(135deg,#075e54,#25d366)', color: 'white', fontFamily: "'Cinzel', serif", fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>💬 WhatsApp</a>
        </SC>

        <SC id="chat" icon="🧙" title="Ask Dobby — AI Assistant">
          <div style={{ background: 'rgba(80,20,120,0.2)', border: '1px solid rgba(139,92,246,0.18)', borderRadius: '11px', padding: '10px', marginBottom: '11px', textAlign: 'center' }}>
            <p style={{ color: 'rgba(196,181,253,0.78)', fontSize: '11px', margin: 0 }}>🪄 Ask anything about your stay!</p>
          </div>
          <Chatbot />
        </SC>
      </div>
    </div>
  );
}
