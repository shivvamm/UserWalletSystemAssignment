const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Function to generate random 6-digit number
function generateRandomNumber() {
  const min = 100000;
  const max = 999999;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

mongoose.connect('mongodb+srv://admin:1234@cluster0.26qsxtx.mongodb.net/?retryWrites=true&w=majority/test', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('register', { title: 'Express' });
});

router.post('/', async (req, res) => {
  try {
    // Check if email already exists
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(409).send({ error: 'Email already in use.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const hashedPasscode = await bcrypt.hash(req.body.passcode, salt);

    // Create new user
    const user = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      passcode: hashedPasscode,
      account: generateRandomNumber(),
    });
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, 'sdfgyikgjkury67897oiki8i73576hbrh5');

    // Send response with JWT token
    res.cookie('token', token, { httpOnly: true });
    res.redirect('/index');
  } catch (err) {
    res.status(500).send();
  }
});

module.exports = router;
