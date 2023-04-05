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
    const decoded = jwt.verify(token, 'mysecretkey');
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
    if (!user) {
      return res.status(404).send({ error: 'User not found.' });
    }
    // Send response with user profile information
    res.render('index', { user });
  } catch (err) {
    res.status(500).send();
  }
});



router.post('/', auth, async (req, res) => {
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
