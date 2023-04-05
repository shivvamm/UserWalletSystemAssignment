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
    const decoded = jwt.verify(token, 'juifd643563hki8i73576hbrh5');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).send({ error: 'Unauthorized.' });
  }
};


router.get('/', auth, async (req, res) => {
 try {
    // Find user by ID
    const users = await User.find({ isAdmin: false });
    const transactions = await Transaction.find().sort({ created_at: 'desc' });
    if (!users) {
      return res.status(404).send({ error: 'User not found.' });
    }
    // Send response with user profile information
    res.render('admin', {users,transactions});
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
});


module.exports = router;
