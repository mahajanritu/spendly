# 💰 Spendly — Smart Expense Tracker

A full-stack expense tracking application built with **React.js**, **Node.js**, and **MongoDB**.

---

## 📦 Tech Stack

| Layer     | Technology               |
|-----------|--------------------------|
| Frontend  | React.js, React Router, Recharts, Axios |
| Backend   | Node.js, Express.js      |
| Database  | MongoDB + Mongoose       |
| Auth      | JWT (JSON Web Tokens) + bcrypt |

---

## 🚀 Quick Setup

### Prerequisites
- Node.js v16+ installed
- MongoDB running locally (or MongoDB Atlas URI)
- npm or yarn

---

### 1. Clone / Download
```bash
# Navigate to the project
cd spendly
```

### 2. Backend Setup
```bash
cd backend
npm install

# Edit .env with your MongoDB URI
# Default: mongodb://localhost:27017/spendly
nano .env

# Start the server
npm run dev
# Server runs on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Start the React app
npm start
# App runs on http://localhost:3000
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/spendly
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

### Frontend (optional `frontend/.env`)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 🗂️ Project Structure

```
spendly/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── middleware/
│   │   └── auth.js            # JWT middleware
│   ├── models/
│   │   ├── User.js            # User schema
│   │   └── Expense.js         # Expense schema
│   ├── routes/
│   │   ├── auth.js            # Auth routes
│   │   └── expenses.js        # Expense CRUD + stats
│   ├── .env                   # Environment config
│   ├── package.json
│   └── server.js              # Express entry point
│
└── frontend/
    ├── public/
    │   └── index.html
    └── src/
        ├── components/
        │   ├── Sidebar.js         # Navigation sidebar
        │   ├── TransactionModal.js # Add/Edit modal
        │   └── ProtectedRoute.js  # Auth guard
        ├── context/
        │   └── AuthContext.js     # Global auth state
        ├── pages/
        │   ├── Dashboard.js       # Main dashboard
        │   ├── Transactions.js    # Transactions list
        │   ├── Analytics.js       # Charts & analytics
        │   ├── Settings.js        # Profile settings
        │   ├── Login.js           # Login page
        │   └── Register.js        # Register page
        ├── utils/
        │   └── api.js             # Axios instance + API calls
        ├── App.js                 # Routing
        ├── index.js               # Entry point
        └── index.css              # Global styles & design system
```

---

## 🔗 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |

### Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses` | Get all transactions |
| POST | `/api/expenses` | Add transaction |
| PUT | `/api/expenses/:id` | Update transaction |
| DELETE | `/api/expenses/:id` | Delete transaction |
| GET | `/api/expenses/stats/summary` | Get analytics |

---

## 🌐 MongoDB Atlas (Cloud)

1. Go to [mongodb.com/atlas](https://mongodb.com/atlas) and create a free cluster
2. Copy your connection string
3. Update `backend/.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/spendly
```

---

## ✨ Features

- 🔐 Secure JWT authentication
- 📊 Dashboard with income/expense overview
- 📈 Interactive charts (area, bar, pie)
- 💼 13 expense & income categories
- 🎯 Monthly budget tracking with alerts
- 🔍 Filter & search transactions
- 📱 Responsive design
- 🌙 Dark theme UI

---

Built with ❤️ using React + Node.js + MongoDB
