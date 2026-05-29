const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// @POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Please fill all fields' });

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password });
    res.status(201).json({
      _id: user._id, name: user.name, email: user.email,
      currency: user.currency, monthlyBudget: user.monthlyBudget,
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id, name: user.name, email: user.email,
        currency: user.currency, monthlyBudget: user.monthlyBudget,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

// @PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.name = req.body.name || user.name;
    user.currency = req.body.currency || user.currency;
    user.monthlyBudget = req.body.monthlyBudget !== undefined ? req.body.monthlyBudget : user.monthlyBudget;
    if (req.body.password) user.password = req.body.password;
    const updated = await user.save();
    res.json({
      _id: updated._id, name: updated.name, email: updated.email,
      currency: updated.currency, monthlyBudget: updated.monthlyBudget,
      token: generateToken(updated._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



// @POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No account found with this email' });

    // Reset token generate karo
    const resetToken = require('crypto').randomBytes(32).toString('hex');
    user.resetPasswordToken = require('crypto').createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    // Reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Email bhejo
    await require('../utils/sendEmail')({
      to: user.email,
      subject: '🔐 Spendly - Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0f; color: #f1f0ff; padding: 40px; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #7c6bff; font-size: 28px;">💰 Spendly</h1>
          </div>
          <h2 style="color: #f1f0ff;">Reset Your Password</h2>
          <p style="color: #a8a6c0;">You requested a password reset. Click the button below to reset your password. This link expires in <strong>15 minutes</strong>.</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}" style="background: linear-gradient(135deg, #7c6bff, #5b4fcf); color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 16px;">
              Reset Password →
            </a>
          </div>
          <p style="color: #6b6985; font-size: 13px;">If you didn't request this, please ignore this email. Your password will remain unchanged.</p>
          <hr style="border-color: rgba(255,255,255,0.1); margin: 24px 0;" />
          <p style="color: #6b6985; font-size: 12px; text-align: center;">© 2024 Spendly — Smart Expense Tracker</p>
        </div>
      `
    });

    res.json({ message: 'Password reset email sent!' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Email could not be sent' });
  }
});

// @POST /api/auth/reset-password/:token
router.post('/reset-password/:token', async (req, res) => {
  try {
    const resetPasswordToken = require('crypto')
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired reset token' });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: 'Password reset successful!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;
