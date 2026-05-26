const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['expense', 'income'], required: true },
  category: {
    type: String,
    required: true,
    enum: [
      'Food & Dining', 'Transportation', 'Shopping', 'Entertainment',
      'Bills & Utilities', 'Health & Medical', 'Education', 'Travel',
      'Salary', 'Freelance', 'Investment', 'Gift', 'Other'
    ]
  },
  note: { type: String, trim: true },
  date: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Expense', expenseSchema);
