import React, { useState, useRef, useEffect } from 'react';
import api from '../utils/api';

const SESSION_ID = `session_${Date.now()}`;
const QUICK = [
  { l: '📶 WiFi', m: 'What is the WiFi password?' },
  { l: '🔐 Check-in', m: 'How do I check in?' },
  { l: '⚡ Power trip', m: 'Electricity tripped, what do I do?' },
  { l: '❄️ AC', m: 'Where is the AC switch?' },
  { l: '🚿 Geyser', m: 'Where is the geyser switch?' },
  { l: '📱 Host', m: 'How do I contact the host?' },
];

export default function Chatbot() {
  const [messages, setMessages] = useState([{ role: 'assistant', content: "🧙 Dobby is happy to help! Ask me anything about your stay — WiFi, check-in, appliances, power, or how to reach your host!" }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    const newMsgs = [...messages, { role: 'user', content: msg }];
    setMessages(newMsgs);
    setInput('');
    setLoading(true);
    try {
      const res = await api.post('/chat/message', { message: msg, sessionId: SESSION_ID, history: messages });
      setMessages([...newMsgs, { role: 'assistant', content: res.data.message }]);
    } catch {
      setMessages([...newMsgs, { role: 'assistant', content: '⚠️ Something went wrong. Contact host: +91 7536835669' }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col">
      <div className="overflow-y-auto space-y-3 mb-3 pr-1" style={{ height: '280px' }}>
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start items-start gap-2'}`}>
            {m.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-1" style={{ background: 'linear-gradient(135deg,#3d1a5e,#6b21a8)' }}>🧙</div>
            )}
            <div className={`max-w-xs px-3 py-2 text-sm leading-relaxed ${m.role === 'user' ? 'chat-user text-white' : 'chat-ai text-purple-100'}`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-start gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0" style={{ background: 'linear-gradient(135deg,#3d1a5e,#6b21a8)' }}>🧙</div>
            <div className="chat-ai px-3 py-2 text-sm text-yellow-400/60">✨ Thinking<span className="animate-sparkle">...</span></div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3" style={{ scrollbarWidth: 'none' }}>
        {QUICK.map((q, i) => (
          <button key={i} onClick={() => send(q.m)} disabled={loading}
            className="flex-shrink-0 text-xs px-2.5 py-1.5 rounded-full border border-yellow-600/30 text-yellow-400/80 hover:border-yellow-500 transition-colors disabled:opacity-50 whitespace-nowrap"
            style={{ background: 'rgba(61,26,94,0.5)' }}>
            {q.l}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && send()}
          placeholder="Ask Dobby anything..." disabled={loading} style={{ borderRadius: '12px' }} />
        <button onClick={() => send()} disabled={loading || !input.trim()}
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-all"
          style={{ background: 'linear-gradient(135deg,#8b5e00,#c9a84c)', border: 'none', cursor: 'pointer' }}>
          <svg className="w-4 h-4 text-white" fill="none" stroke="white" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );
}
