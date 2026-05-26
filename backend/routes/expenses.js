const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const { protect } = require('../middleware/auth');

// @GET /api/expenses
router.get('/', protect, async (req, res) => {
  try {
    const { type, category, startDate, endDate, limit = 50, page = 1 } = req.query;
    const filter = { user: req.user._id };
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Expense.countDocuments(filter);
    const expenses = await Expense.find(filter)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    res.json({ expenses, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @POST /api/expenses
router.post('/', protect, async (req, res) => {
  try {
    const { title, amount, type, category, note, date } = req.body;
    if (!title || !amount || !type || !category)
      return res.status(400).json({ message: 'Please fill required fields' });
    const expense = await Expense.create({
      user: req.user._id, title, amount, type, category, note, date: date || Date.now()
    });
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @PUT /api/expenses/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    if (expense.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    const updated = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @DELETE /api/expenses/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    if (expense.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    await expense.deleteOne();
    res.json({ message: 'Expense removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @GET /api/expenses/stats
router.get('/stats/summary', protect, async (req, res) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const y = parseInt(year) || now.getFullYear();
    const m = month !== undefined ? parseInt(month) : now.getMonth();
    const startOfMonth = new Date(y, m, 1);
    const endOfMonth = new Date(y, m + 1, 0, 23, 59, 59);

    const [monthlyStats] = await Expense.aggregate([
      { $match: { user: req.user._id, date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: '$type', total: { $sum: '$amount' } } }
    ]);

    const allStats = await Expense.aggregate([
      { $match: { user: req.user._id, date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: { type: '$type', category: '$category' }, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    const monthlyAll = await Expense.aggregate([
      { $match: { user: req.user._id, date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: '$type', total: { $sum: '$amount' } } }
    ]);

    let totalIncome = 0, totalExpense = 0;
    monthlyAll.forEach(s => {
      if (s._id === 'income') totalIncome = s.total;
      if (s._id === 'expense') totalExpense = s.total;
    });

    // Last 6 months trend
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const trend = await Expense.aggregate([
      { $match: { user: req.user._id, date: { $gte: sixMonthsAgo } } },
      { $group: {
        _id: { year: { $year: '$date' }, month: { $month: '$date' }, type: '$type' },
        total: { $sum: '$amount' }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({ totalIncome, totalExpense, balance: totalIncome - totalExpense, categoryStats: allStats, trend });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
