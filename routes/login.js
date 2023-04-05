var express = require('express');
var router = express.Router();
const User = require('../models/userModel');
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

mongoose.connect('mongodb+srv://admin:1234@cluster0.26qsxtx.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
})

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('login');
});

router.post('/', async (req, res) => {
  try {
    // Find user by email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).send({ error: 'Invalid email or password.' });
    }

    if(user.isAdmin){
       const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
      return res.status(401).send({ error: 'Invalid email or password.' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, 'juifd643563hki8i73576hbrh5');

    // Redirect to the profile page with the jwt token
    res.cookie('token', token, { httpOnly: true });
    res.redirect('/admin');
    }
else{
    // Compare password hash
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
      return res.status(401).send({ error: 'Invalid email or password.' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, 'sdfgyikgjkury67897oiki8i73576hbrh5');

    // Redirect to the profile page with the jwt token
    res.cookie('token', token, { httpOnly: true });
    res.redirect('/index');
  }
  } catch (err) {
    res.status(500).send();
  }
});

module.exports = router;
