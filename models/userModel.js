const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  account: { type: Number,required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  wallet_balance: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  passcode: { type: String, required: true },
  isAdmin:{ type: Boolean, default: false },
});

const User = mongoose.model('Users', userSchema);

module.exports = User;