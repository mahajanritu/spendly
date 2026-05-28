const fetch = require('node-fetch');
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Expense = require('../models/Expense');

router.post('/chat', protect, async (req, res) => {
  try {
    const { message } = req.body;

    // User ka poora data lo
    const expenses = await Expense.find({ user: req.user._id })
      .sort({ date: -1 }).limit(100);

    const totalExpense = expenses
      .filter(e => e.type === 'expense')
      .reduce((sum, e) => sum + e.amount, 0);

    const totalIncome = expenses
      .filter(e => e.type === 'income')
      .reduce((sum, e) => sum + e.amount, 0);

    const balance = totalIncome - totalExpense;

    // Category wise breakdown
    const categoryBreakdown = expenses
      .filter(e => e.type === 'expense')
      .reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
      }, {});

    // Groq API call
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        max_tokens: 1000,
        messages: [
          {
            role: 'system',
            
content: `You are Spendly AI - a smart personal finance assistant.

CRITICAL LANGUAGE RULE: You MUST detect the language of the user's message and reply in EXACTLY the same language.
- If user writes in Marathi -> reply ONLY in Marathi
- If user writes in Hindi -> reply ONLY in Hindi  
- If user writes in English -> reply ONLY in English
- If user writes in Hinglish -> reply ONLY in Hinglish
- If user writes in Gujarati -> reply ONLY in Gujarati
- Never switch languages under any circumstances

User Financial Data:
- Name: ${req.user.name}
- Total Income: Rs.${totalIncome}
- Total Expenses: Rs.${totalExpense}
- Balance/Savings: Rs.${balance}
- Category Breakdown: ${JSON.stringify(categoryBreakdown)}
- Recent Transactions: ${JSON.stringify(expenses.slice(0, 15))}
- Monthly Budget: Rs.${req.user.monthlyBudget || 'Not set'}`
          },
          {
            role: 'user',
            content: message
          }
        ]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      return res.status(500).json({ message: data.error.message });
    }

    res.json({ reply: data.choices[0].message.content });

  } catch (err) {
    console.error('AI Chat Error:', err);
    res.status(500).json({ message: err.message, stack: err.stack });
  }
});

// Monthly Report Route
router.get('/report', protect, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const expenses = await Expense.find({
      user: req.user._id,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const totalExpense = expenses
      .filter(e => e.type === 'expense')
      .reduce((sum, e) => sum + e.amount, 0);

    const totalIncome = expenses
      .filter(e => e.type === 'income')
      .reduce((sum, e) => sum + e.amount, 0);

    const categoryBreakdown = expenses
      .filter(e => e.type === 'expense')
      .reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
      }, {});

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        max_tokens: 1500,
        messages: [
          {
            role: 'system',
            content: `You are Spendly AI financial advisor. Generate a detailed monthly financial report in a friendly tone. Include:
1. Monthly Summary
2. Top spending categories analysis
3. Savings rate analysis
4. Budget recommendations
5. Investment suggestions based on savings
6. Tips to reduce expenses
7. Next month goals

Always reply in English. Use emojis. Format nicely with sections.`
          },
          {
            role: 'user',
            content: `Generate my monthly financial report for ${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}:
- Total Income: ₹${totalIncome}
- Total Expenses: ₹${totalExpense}
- Balance: ₹${totalIncome - totalExpense}
- Category Breakdown: ${JSON.stringify(categoryBreakdown)}
- Monthly Budget: ₹${req.user.monthlyBudget || 'Not set'}
- Transactions count: ${expenses.length}`
          }
        ]
      })
    });

    const data = await response.json();
    res.json({ 
      report: data.choices[0].message.content,
      stats: { totalIncome, totalExpense, balance: totalIncome - totalExpense, categoryBreakdown }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;