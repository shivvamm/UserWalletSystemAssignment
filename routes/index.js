var express = require('express');
var router = express.Router();
const User = require('../models/userModel');
const Transaction = require('../models/transactionsModel');
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

mongoose.connect('mongodb+srv://admin:1234@cluster0.26qsxtx.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})


/* GET home page. */
// Middleware to verify JWT token
const auth = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).send({ error: 'Unauthorized.' });
  }

  try {
    const decoded = jwt.verify(token, 'sdfgyikgjkury67897oiki8i73576hbrh5');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).send({ error: 'Unauthorized.' });
  }
};


router.get('/', auth, async (req, res) => {
 try {
    // Find user by ID
    const user = await User.findById(req.user.userId);
    const transactions = await Transaction.find({ $or: [{ sender_id: user._id }, { receiver_id: user._id }] }).sort({ created_at: 'desc' });
   
    if (!user) {
      return res.status(404).send({ error: 'User not found.' });
    }
    // Send response with user profile information
    res.render('index', {user,transactions});
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
});





router.post('/addmoney', auth, async (req, res) => {
  // Find user by user ID from JWT token
  const user = await User.findById(req.user.userId);
  try {
    if (!user) {
      return res.status(404).send({ error: 'User not found.' });
    }

    // Check if passcode is correct
    const passcode = await bcrypt.compare(req.body.passcode, user.passcode);
    if (!passcode) {
      return res.status(401).send({ error: 'Invalid passcode.' });
    }

    // Update user balance
    const amount = parseFloat(req.body.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).send({ error: 'Invalid amount.' });
    }
    user.wallet_balance += amount;
    await user.save();

    // Add transaction record
    const transaction = new Transaction({
      sender_id:user._id ,
      receiver_id: user._id,
      amount: amount,
      status: 'Success',
    });
    await transaction.save();

    const message= 'Money added successfully';
    res.redirect('/index');
  } catch (err) {
    // Add transaction record if transaction failed
    const transaction = new Transaction({
      sender_id: null,
      receiver_id: user._id,
      amount: parseFloat(req.body.amount),
      status: 'Failed',
    });
    await transaction.save();

    res.status(500).send({ error: 'Internal server error.' });
  }
});


router.post('/transfer', auth, async (req, res) => {
  try {
    // Find sender by user ID from JWT token
    const sender = await User.findById(req.user.userId);
    if (!sender) {
      return res.status(404).send({ error: 'User not found.' });
    }

    // Find receiver by email
    const receiver = await User.findOne({ email: req.body.email });
    if (!receiver) {
      return res.status(404).send({ error: 'Receiver not found.' });
    }

    // Check if sender has enough balance
    if (sender.wallet_balance < req.body.amount) {
      return res.status(400).send({ error: 'Insufficient funds.' });
    }

    // Check if passcode is correct
    const passcode = await bcrypt.compare(req.body.passcode, sender.passcode);
    if (!passcode) {
      return res.status(401).send({ error: 'Invalid passcode.' });
    }

    const amount = parseFloat(req.body.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).send({ error: 'Invalid amount.' });
    }

    // Add transaction record
    const transaction = new Transaction({
      sender_id: sender._id,
      receiver_id: receiver._id,
      amount: amount,
      status: 'Success',
    });
    await transaction.save();

    // Update sender balance
    sender.wallet_balance -= amount;
    await sender.save();

    // Update receiver balance
    receiver.wallet_balance += amount;
    await receiver.save();

    const message= 'Money added successfully';
    res.redirect('/index');
  } catch (err) {
    // Add transaction record if transaction failed
    const transaction = new Transaction({
      sender_id: sender._id,
      receiver_id: receiver._id,
      amount: req.body.amount,
      status: 'Failed',
    });
    await transaction.save();

    res.status(500).send({ error: 'Internal server error.' });
  }
});


router.post('/logout', auth, async (req, res) => {
  try {
    // Clear the token cookie
    res.cookie('token', '', { maxAge: 0 });

    // Remove the auth token for the user
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token
    })
    await req.user.save()

    // Redirect the user to the login page
    res.redirect('/')
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
})


module.exports = router;
