const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Guest = require('../models/Guest');

router.post('/admin/login', (req, res) => {
  const { password } = req.body;
  if (password !== (process.env.ADMIN_PASSWORD || 'dumbledore123'))
    return res.status(401).json({ message: 'Incorrect password.' });
  const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET || 'hogwarts_secret', { expiresIn: '24h' });
  res.json({ token, message: 'Welcome, Headmaster.' });
});

router.post('/guest/login', async (req, res) => {
  try {
    const guest = await Guest.findOne({ accessCode: req.body.accessCode?.toUpperCase().trim(), isActive: true });
    if (!guest) return res.status(401).json({ message: 'Invalid access code.' });
    const token = jwt.sign({ role: 'guest', id: guest._id, name: guest.name }, process.env.JWT_SECRET || 'hogwarts_secret', { expiresIn: '7d' });
    res.json({ token, guest: { id: guest._id, name: guest.name, checkInDate: guest.checkInDate, checkOutDate: guest.checkOutDate, roomNumber: guest.roomNumber } });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
