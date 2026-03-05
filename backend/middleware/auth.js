const jwt = require('jsonwebtoken');

const adminAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hogwarts_secret');
    if (decoded.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    req.admin = decoded;
    next();
  } catch { return res.status(401).json({ message: 'Invalid token' }); }
};

const guestAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hogwarts_secret');
    req.guest = decoded;
    next();
  } catch { return res.status(401).json({ message: 'Invalid token' }); }
};

module.exports = { adminAuth, guestAuth };
