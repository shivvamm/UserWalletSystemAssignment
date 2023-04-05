const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  sender_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  status: { type: String, required: true, enum: ['Success', 'Failed'] },
  created_at: { type: Date, default: Date.now }
});

const Transaction = mongoose.model('Transactions', transactionSchema);

module.exports = Transaction;
