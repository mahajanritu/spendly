
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

    if (!message) {
      return res.status(400).json({
        reply: 'Message is required'
      });
    }

    // =========================
    // LANGUAGE DETECTION
    // =========================

    const isEnglish = /^[A-Za-z0-9\s!?.,₹$&()\-]+$/.test(message);

    const replyLanguage = isEnglish
      ? 'English'
      : 'Same language as user';

    // =========================
    // USER FINANCIAL DATA
    // =========================

    const expenses = await Expense.find({
      user: req.user._id
    })
      .sort({ date: -1 })
      .limit(100);

    const totalExpense = expenses
      .filter(item => item.type === 'expense')
      .reduce((sum, item) => sum + item.amount, 0);

    const totalIncome = expenses
      .filter(item => item.type === 'income')
      .reduce((sum, item) => sum + item.amount, 0);

    const balance = totalIncome - totalExpense;

    const categoryBreakdown = expenses
      .filter(item => item.type === 'expense')
      .reduce((acc, item) => {
        acc[item.category] =
          (acc[item.category] || 0) + item.amount;

        return acc;
      }, {});

    // =========================
    // GROQ AI API
    // =========================

    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          temperature: 0.5,
          max_tokens: 700,

          messages: [
            {
              role: 'system',

              content: `
You are Spendly AI, a smart and professional personal finance assistant.

STRICT RULES:
- Reply language: ${replyLanguage}
- Never mix multiple languages
- Never return JSON
- Never return code
- Never use markdown
- Keep replies short and clean
- Use ₹ symbol for currency
- Sound friendly and human
- Give accurate finance advice

USER DATA:
- Name: ${req.user.name}
- Total Income: ₹${totalIncome}
- Total Expenses: ₹${totalExpense}
- Current Savings: ₹${balance}
- Monthly Budget: ₹${req.user.monthlyBudget || 0}

CATEGORY BREAKDOWN:
${JSON.stringify(categoryBreakdown)}

RECENT TRANSACTIONS:
${JSON.stringify(expenses.slice(0, 10))}

If user asks:
- expenses → tell expenses
- savings → tell savings
- budget → give budgeting advice
- investment → give investment tips
- report → summarize monthly finance report

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

    // =========================
    // ERROR HANDLING
    // =========================

    if (data.error) {
      return res.status(500).json({
        reply: data.error.message
      });
    }

    // =========================
    // CLEAN RESPONSE
    // =========================

    let reply =
      data?.choices?.[0]?.message?.content ||
      'Sorry, I could not understand that.';

    reply = reply
      .replace(/```/g, '')
      .replace(/json/gi, '')
      .trim();

    // =========================
    // SEND RESPONSE
    // =========================

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



// =======================================
// MONTHLY REPORT ROUTE
// =======================================

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
      .filter(item => item.type === 'expense')
      .reduce((sum, item) => sum + item.amount, 0);

    const totalIncome = expenses
      .filter(item => item.type === 'income')
      .reduce((sum, item) => sum + item.amount, 0);

    const balance = totalIncome - totalExpense;

    const categoryBreakdown = expenses
      .filter(item => item.type === 'expense')
      .reduce((acc, item) => {
        acc[item.category] =
          (acc[item.category] || 0) + item.amount;

        return acc;
      }, {});

    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`
        },

        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          temperature: 0.6,
          max_tokens: 1200,

          messages: [
            {
              role: 'system',

              content: `
You are Spendly AI Financial Advisor.

Generate a professional monthly financial report.

RULES:
- Use simple English
- Use emojis naturally
- No markdown tables
- No JSON
- Keep formatting clean

Include:
1. Monthly Summary
2. Expense Analysis
3. Savings Analysis
4. Budget Suggestions
5. Investment Tips
6. Financial Goals
`
            },

            {
              role: 'user',

              content: `
Generate my monthly report.

Month:
${now.toLocaleString('default', {
  month: 'long'
})} ${now.getFullYear()}

Financial Data:
- Total Income: ₹${totalIncome}
- Total Expenses: ₹${totalExpense}
- Savings: ₹${balance}
- Monthly Budget: ₹${req.user.monthlyBudget || 0}
- Category Breakdown: ${JSON.stringify(categoryBreakdown)}
`
            }
          ]
        })
      }
    );

    const data = await response.json();

    let report =
      data?.choices?.[0]?.message?.content ||
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

