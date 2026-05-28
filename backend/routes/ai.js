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

    const expenses = await Expense.find({ user: req.user._id })
      .sort({ date: -1 }).limit(100);

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

    // Single API call - reply + suggestions both
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        max_tokens: 1200,
        messages: [
          {
            role: 'system',
            content: `You are Spendly AI - a smart personal finance assistant.

CRITICAL RULES:
1. ALWAYS detect the language of user's message and reply in EXACTLY that same language
2. Supported languages: English, Hindi, Marathi, Gujarati, Tamil, Telugu, Kannada, Malayalam, Bengali, Punjabi, Odia, Assamese, Urdu, Sanskrit, Nepali, Sindhi, Kashmiri, Konkani, Maithili, Manipuri, Bodo, Dogri, Santali
3. Never switch to a different language
4. Be friendly, helpful and specific with numbers
5. Give smart budget, savings and investment suggestions

User Financial Data:
- Name: ${req.user.name}
- Total Income: Rs.${totalIncome}
- Total Expenses: Rs.${totalExpense}
- Balance/Savings: Rs.${balance}
- Category Breakdown: ${JSON.stringify(categoryBreakdown)}
- Recent Transactions: ${JSON.stringify(expenses.slice(0, 15))}
- Monthly Budget: Rs.${req.user.monthlyBudget || 'Not set'}

RESPONSE FORMAT - You MUST return ONLY raw JSON, no markdown, no backticks, no explanation:
{"reply":"answer here","suggestions":["s1","s2","s3","s4"]}

The suggestions must be 4 short follow-up questions in the SAME language as user's message.`
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

    const content = data.choices[0].message.content;
    
    // Parse JSON response
    let reply = content;
    let suggestions = DEFAULT_SUGGESTIONS;
    
    try {
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        reply = parsed.reply || content;
        suggestions = parsed.suggestions || DEFAULT_SUGGESTIONS;
      }
    } catch (e) {
      reply = content;
      suggestions = DEFAULT_SUGGESTIONS;
    }

    res.json({ reply, suggestions });

  } catch (err) {
    console.error('AI Chat Error:', err.message);
    res.status(500).json({ message: err.message });
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
            content: `You are Spendly AI financial advisor. Generate a detailed monthly financial report in English. Include:
1. Monthly Summary
2. Top spending categories analysis
3. Savings rate analysis
4. Budget recommendations
5. Investment suggestions based on savings
6. Tips to reduce expenses
7. Next month goals
Use emojis. Format nicely with sections.`
          },
          {
            role: 'user',
            content: `Generate my monthly financial report for ${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}:
- Total Income: Rs.${totalIncome}
- Total Expenses: Rs.${totalExpense}
- Balance: Rs.${totalIncome - totalExpense}
- Category Breakdown: ${JSON.stringify(categoryBreakdown)}
- Monthly Budget: Rs.${req.user.monthlyBudget || 'Not set'}
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