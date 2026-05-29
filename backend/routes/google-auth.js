const express = require('express');
const router = express.Router();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const User = require('../models/User');

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.log('Google OAuth not configured');
  module.exports = require('express').Router();
  return;
}

// Google Strategy setup
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'https://spendly-production-1721.up.railway.app/api/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check user already exists
    let user = await User.findOne({ email: profile.emails[0].value });
    
    if (!user) {
      // New user — create karo
      user = await User.create({
        name: profile.displayName,
        email: profile.emails[0].value,
        password: 'google_oauth_' + profile.id, // dummy password
        googleId: profile.id
      });
    }
    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));

// Google Login
router.get('/login', passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false
}));

// Google Callback
router.get('/callback', 
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_failed` }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    const user = {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      currency: req.user.currency,
      monthlyBudget: req.user.monthlyBudget,
      token
    };
    // Frontend pe redirect karo token ke saath
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`);
  }
);

module.exports = router;