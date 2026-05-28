const fetch = require('node-fetch');
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Expense = require('../models/Expense');

const DEFAULT_SUGGESTIONS = [
  'This month expenses?',
  'What are my savings?',
  'Suggest a budget',
  'Investment tips',
];

router.post('/chat', protect, async (req, res) => {
  try {
    const { message } = req.body;

    // Fetch user expenses
    const expenses = await Expense.find({ user: req.user._id })
      .sort({ date: -1 })
      .limit(100);

    // Calculate totals
    const totalExpense = expenses
      .filter(e => e.type === 'expense')
      .reduce((sum, e) => sum + e.amount, 0);

    const totalIncome = expenses
      .filter(e => e.type === 'income')
      .reduce((sum, e) => sum + e.amount, 0);

    const balance = totalIncome - totalExpense;

    // Category breakdown
    const categoryBreakdown = expenses
      .filter(e => e.type === 'expense')
      .reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
      }, {});

    // AI API Call
    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          temperature: 0.7,
          max_tokens: 700,
          messages: [
            {
              role: 'system',
              content: `
You are Spendly AI, a smart personal finance assistant.

STRICT RULES:
- Reply in the EXACT SAME language as user's message
- Never mix languages
- Never return JSON
- Never return code blocks
- Never use markdown formatting
- Keep replies short, friendly and professional
- Use ₹ symbol for money
- Sound natural like a real assistant

User Financial Data:
- Name: ${req.user.name}
- Total Income: ₹${totalIncome}
- Total Expenses: ₹${totalExpense}
- Balance/Savings: ₹${balance}
- Monthly Budget: ₹${req.user.monthlyBudget || 'Not set'}
- Category Breakdown: ${JSON.stringify(categoryBreakdown)}

Recent Transactions:
${JSON.stringify(expenses.slice(0, 10))}

If user asks:
- expenses → answer expense summary
- savings → answer savings amount
- budget → give budgeting advice
- investment → give beginner-friendly investment tips
- report → summarize financial report

Reply ONLY with plain text.
`
            },
            {
              role: 'user',
              content: message
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({
        message: data.error.message
      });
    }

    // Clean AI response
    let reply =
      data?.choices?.[0]?.message?.content?.trim() ||
      'Sorry, I could not understand that.';

    // Remove unwanted formatting
    reply = reply
      .replace(/```/g, '')
      .replace(/json/gi, '')
      .trim();

    res.json({
      reply,
      suggestions: DEFAULT_SUGGESTIONS
    });

  } catch (err) {
    console.error('AI Chat Error:', err);

    res.status(500).json({
      reply: '❌ Something went wrong. Please try again later.'
    });
  }
});

// Monthly Report Route
router.get('/report', protect, async (req, res) => {
  try {
    const now = new Date();

    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0
    );

    const expenses = await Expense.find({
      user: req.user._id,
      date: {
        $gte: startOfMonth,
        $lte: endOfMonth
      }
    });

    const totalExpense = expenses
      .filter(e => e.type === 'expense')
      .reduce((sum, e) => sum + e.amount, 0);

    const totalIncome = expenses
      .filter(e => e.type === 'income')
      .reduce((sum, e) => sum + e.amount, 0);

    const balance = totalIncome - totalExpense;

    const categoryBreakdown = expenses
      .filter(e => e.type === 'expense')
      .reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
      }, {});

    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          temperature: 0.7,
          max_tokens: 1200,
          messages: [
            {
              role: 'system',
              content: `
You are Spendly AI financial advisor.

Generate a clean monthly financial report.

Rules:
- Use simple English
- Use emojis naturally
- Keep formatting clean
- No markdown tables
- No JSON

Include:
1. Monthly Summary
2. Top Expenses
3. Savings Analysis
4. Budget Advice
5. Investment Tips
6. Financial Goals
`
            },
            {
              role: 'user',
              content: `
Generate my monthly report.

Month: ${now.toLocaleString('default', {
  month: 'long'
})} ${now.getFullYear()}

Financial Data:
- Total Income: ₹${totalIncome}
- Total Expenses: ₹${totalExpense}
- Savings: ₹${balance}
- Monthly Budget: ₹${req.user.monthlyBudget || 'Not set'}
- Category Breakdown: ${JSON.stringify(categoryBreakdown)}
`
            }
          ]
        })
      }
    );

    const data = await response.json();

    let report =
      data?.choices?.[0]?.message?.content?.trim() ||
      'Unable to generate report.';

    report = report
      .replace(/```/g, '')
      .replace(/json/gi, '')
      .trim();

    res.json({
      report,
      stats: {
        totalIncome,
        totalExpense,
        balance,
        categoryBreakdown
      }
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message
    });
  }
});

module.exports = router;

