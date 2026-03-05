const cron = require('node-cron');
const Guest = require('../models/Guest');

const startReminderCron = () => {
  cron.schedule('0 11 * * *', async () => {
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate()+1);
    try {
      const guests = await Guest.find({ checkOutDate: { $gte: today, $lt: tomorrow }, reminderSent: false, isActive: true });
      for (const g of guests) {
        console.log(`📬 CHECKOUT REMINDER → ${g.name} | ${g.phone || g.email || 'no contact'} | Checkout today!`);
        await Guest.findByIdAndUpdate(g._id, { reminderSent: true });
      }
      if (guests.length) console.log(`✅ ${guests.length} reminder(s) sent`);
    } catch(err) { console.error('Reminder error:', err); }
  }, { timezone: 'Asia/Kolkata' });
  console.log('⏰ Checkout reminder cron scheduled for 11:00 AM IST daily');
};

module.exports = { startReminderCron };
