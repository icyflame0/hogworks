const express = require('express');
const router = express.Router();
const { guestAuth } = require('../middleware/auth');

const SYSTEM_PROMPT = `You are Dobby, a warm and friendly AI assistant for Hogworks — a Harry Potter themed homestay. You speak helpfully with a subtle magical flair (occasionally say things like "Dobby is happy to help!"). Always be concise and mobile-friendly.

PROPERTY INFORMATION:
- Room Number: 328
- Lockbox code: 1010
- WiFi password: home@328
- MCB (circuit breaker): behind the door
- AC switch: left side of window, behind the curtains
- Fridge plug: above the fridge on the slab
- Geyser switch: wall near the mirror in the bathroom
- NEVER run AC + Geyser + Induction simultaneously — it will trip electricity
- If power trips and meter beeps: press #01 on the meter to restore
- Breakfast: NOT included
- Host phone: +91 7536835669 (WhatsApp or Call)
- Location: https://maps.app.goo.gl/egrbYGxThMiRZwhi7

Answer only questions related to the property. For urgent issues always suggest contacting the host.`;

function getFallback(msg) {
  const m = msg.toLowerCase();
  if (m.includes('wifi') || m.includes('password') || m.includes('internet')) return "📶 Dobby is happy to help! The WiFi password is **home@328**. Connect to the network in Room 328!";
  if (m.includes('check') || m.includes('lockbox') || m.includes('code') || m.includes('key')) return "🔐 The lockbox code is **1010**! Your room is **328**. Find the lockbox at the main entrance.";
  if (m.includes('electric') || m.includes('power') || m.includes('trip') || m.includes('meter') || m.includes('mcb')) return "⚡ If power trips and meter beeps, press **#01** on the meter! Never run AC + Geyser + Induction together. MCB is behind the door.";
  if (m.includes('ac') || m.includes('air con') || m.includes('cool')) return "❄️ The AC switch is on the **left side of the window, behind the curtains**.";
  if (m.includes('geyser') || m.includes('hot water') || m.includes('shower')) return "🚿 Geyser switch is on the **wall near the mirror in the bathroom**.";
  if (m.includes('fridge') || m.includes('refrigerator')) return "🧊 Fridge plug is **above the fridge on the slab**.";
  if (m.includes('breakfast') || m.includes('food') || m.includes('meal')) return "🍳 Breakfast is **not included** in your stay.";
  if (m.includes('host') || m.includes('contact') || m.includes('call') || m.includes('whatsapp')) return "📱 Contact your host at **+91 7536835669** (WhatsApp or Call).";
  if (m.includes('map') || m.includes('location') || m.includes('direction') || m.includes('address')) return "🗺️ Here is the location: https://maps.app.goo.gl/egrbYGxThMiRZwhi7";
  return "🪄 Dobby is here to help! Ask about WiFi, check-in, appliances, power guidelines, or how to reach your host!";
}

router.post('/message', guestAuth, async (req, res) => {
  const { message, history = [] } = req.body;
  if (!message) return res.status(400).json({ message: 'Message required' });

  const geminiKey = process.env.GEMINI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  // Try Gemini first (free)
  if (geminiKey && geminiKey !== 'your_gemini_api_key_here') {
    try {
      // Build conversation history for Gemini
      const contents = [];
      
      // Add history
      for (const h of history.slice(-8)) {
        contents.push({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.content }]
        });
      }
      
      // Add current message
      contents.push({ role: 'user', parts: [{ text: message }] });

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents,
            generationConfig: { maxOutputTokens: 400, temperature: 0.7 }
          })
        }
      );

      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (reply) return res.json({ message: reply });
    } catch (err) {
      console.error('Gemini error:', err.message);
    }
  }

  // Try Anthropic if available
  if (anthropicKey && anthropicKey !== 'none' && anthropicKey !== 'your_anthropic_api_key_here') {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': anthropicKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 400,
          system: SYSTEM_PROMPT,
          messages: [...history.slice(-8).map(h => ({ role: h.role, content: h.content })), { role: 'user', content: message }]
        })
      });
      const data = await response.json();
      const reply = data.content?.[0]?.text;
      if (reply) return res.json({ message: reply });
    } catch (err) {
      console.error('Anthropic error:', err.message);
    }
  }

  // Fallback
  res.json({ message: getFallback(message) });
});

module.exports = router;
