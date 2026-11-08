const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, sparse: true },
  phone: { type: String, sparse: true },
  password: { type: String, default: '' },
  role: { type: String, enum: ['customer', 'admin', 'staff'], default: 'customer' },
  tier: { type: String, default: 'Thành Viên Mới' },
  address: { type: String },
  points: { type: Number, default: 0 },
  bottlesReturned: { type: Number, default: 0 },
  ordersCount: { type: Number, default: 0 }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
