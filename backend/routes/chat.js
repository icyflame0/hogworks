const express = require('express');
const router = express.Router();
const { guestAuth } = require('../middleware/auth');

const SYSTEM_PROMPT = `You are Dobby, a warm friendly AI assistant for Hogworks homestay. Subtle magical flair. Be concise.
FACTS: Room 328 | Lockbox: 1010 | WiFi: home@328 | MCB: behind door | AC: left side window behind curtains | Fridge plug: above fridge on slab | Geyser: bathroom mirror wall | Never run AC+Geyser+Induction together | Power trip: press #01 on meter | Breakfast: not included | Host: +91 7536835669 | Map: https://maps.app.goo.gl/egrbYGxThMiRZwhi7`;

function getFallback(msg) {
  const m = msg.toLowerCase();
  if (m.includes('wifi')||m.includes('password')) return "📶 WiFi password is **home@328**";
  if (m.includes('check')||m.includes('lockbox')||m.includes('code')) return "🔐 Lockbox code: **1010**, Room: **328**";
  if (m.includes('electric')||m.includes('power')||m.includes('trip')||m.includes('meter')) return "⚡ Press **#01** on meter to restore power! Never run AC+Geyser+Induction together.";
  if (m.includes('ac')||m.includes('air con')) return "❄️ AC switch: **left side of window, behind curtains**";
  if (m.includes('geyser')||m.includes('hot water')) return "🚿 Geyser: **wall near mirror in bathroom**";
  if (m.includes('fridge')) return "🧊 Fridge plug: **above fridge on slab**";
  if (m.includes('breakfast')||m.includes('food')) return "🍳 Breakfast **not included**";
  if (m.includes('host')||m.includes('contact')||m.includes('call')) return "📱 Host: **+91 7536835669**";
  if (m.includes('map')||m.includes('location')) return "🗺️ https://maps.app.goo.gl/egrbYGxThMiRZwhi7";
  return "🪄 Ask about WiFi, check-in, appliances, power, or host contact!";
}

router.post('/message', guestAuth, async (req, res) => {
  const { message, history = [] } = req.body;
  if (!message) return res.status(400).json({ message: 'Message required' });

  // Try Gemini (free)
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      const contents = [
        ...history.slice(-6).map(h => ({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.content }]
        })),
        { role: 'user', parts: [{ text: message }] }
      ];
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents,
            generationConfig: { maxOutputTokens: 350, temperature: 0.7 }
          })
        }
      );
      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (reply) return res.json({ message: reply });
    } catch (err) { console.error('Gemini error:', err.message); }
  }

  // Try Ollama (local only)
  try {
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2:1b',
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...history.slice(-6).map(h => ({ role: h.role === 'assistant' ? 'assistant' : 'user', content: h.content })), { role: 'user', content: message }],
        stream: false,
        options: { temperature: 0.7, num_predict: 300 }
      })
    });
    if (response.ok) {
      const data = await response.json();
      const reply = data.message?.content;
      if (reply) return res.json({ message: reply });
    }
  } catch (_) {}

  res.json({ message: getFallback(message) });
});

module.exports = router;
