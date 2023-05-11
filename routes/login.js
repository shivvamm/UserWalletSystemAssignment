// Import required modules
var express = require('express');
var router = express.Router();
const User = require('../models/userModel');
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// Connect to MongoDB Atlas database
mongoose.connect('', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
})

/* GET login page. */
router.get('/', function(req, res, next) {
  res.render('login');
});

// Handle login form submission
router.post('/', async (req, res) => {
  try {
    // Find user by email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).send({ error: 'Invalid email or password.' });
    }

    // Check if user is an admin
    if(user.isAdmin){
      // Compare admin password hash
      const validPassword = await bcrypt.compare(req.body.password, user.password);
      if (!validPassword) {
        return res.status(401).send({ error: 'Invalid email or password.' });
      }

      // Generate JWT token for admin user
      const token = jwt.sign({ userId: user._id }, 'juifd643563hki8i73576hbrh5');

      // Redirect to the admin profile page with the jwt token
      res.cookie('token', token, { httpOnly: true });
      res.redirect('/admin');
    } else {
      // Compare regular user password hash
      const validPassword = await bcrypt.compare(req.body.password, user.password);
      if (!validPassword) {
        return res.status(401).send({ error: 'Invalid email or password.' });
      }

      // Generate JWT token for regular user
      const token = jwt.sign({ userId: user._id }, 'sdfgyikgjkury67897oiki8i73576hbrh5');

      // Redirect to the regular user profile page with the jwt token
      res.cookie('token', token, { httpOnly: true });
      res.redirect('/index');
    }
  } catch (err) {
    // Handle any errors that occur during login
    res.status(500).send();
  }
});

// Export the router module for use in other files
module.exports = router;
