require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { startReminderCron } = require('./cron/reminders');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/guests', require('./routes/guests'));
app.use('/api/chat', require('./routes/chat'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'The castle is standing strong! 🏰' });
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('🧙 Connected to MongoDB!');
    startReminderCron();
    app.listen(PORT, () => console.log(`🏰 Hogworks running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB error:', err.message);
    app.listen(PORT, () => console.log(`🏰 Running without DB on port ${PORT}`));
  });
