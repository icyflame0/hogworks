const mongoose = require('mongoose');

const guestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  checkInDate: { type: Date, required: true },
  checkOutDate: { type: Date, required: true },
  accessCode: { type: String, unique: true },
  roomNumber: { type: String, default: '328' },
  specialNotes: { type: String },
  reminderSent: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

guestSchema.pre('save', function(next) {
  if (!this.accessCode) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'HW-';
    for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    this.accessCode = code;
  }
  next();
});

module.exports = mongoose.model('Guest', guestSchema);
