var express = require('express');
var router = express.Router();
const User = require('../models/userModel');
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


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
    const user = await User.findById(req.user._id);

    // Send response with user profile information
    res.render('index', { title: 'Express' });
  } catch (err) {
    res.status(500).send();
  }
 
});

module.exports = router;
