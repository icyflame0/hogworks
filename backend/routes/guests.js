const express = require('express');
const router = express.Router();
const Guest = require('../models/Guest');
const { adminAuth, guestAuth } = require('../middleware/auth');

router.get('/', adminAuth, async (req, res) => {
  try { res.json(await Guest.find().sort({ createdAt: -1 })); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', adminAuth, async (req, res) => {
  try {
    const guest = new Guest(req.body);
    await guest.save();
    res.status(201).json({ guest, message: `Guest added. Code: ${guest.accessCode}` });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', adminAuth, async (req, res) => {
  try {
    const guest = await Guest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!guest) return res.status(404).json({ message: 'Not found' });
    res.json(guest);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', adminAuth, async (req, res) => {
  try { await Guest.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/me', guestAuth, async (req, res) => {
  try {
    const guest = await Guest.findById(req.guest.id);
    if (!guest) return res.status(404).json({ message: 'Not found' });
    res.json(guest);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
