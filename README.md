<div align="center">

# 💰 Spendly — Smart Expense Tracker

### Track • Analyze • Save Smarter

[![Made with React](https://img.shields.io/badge/Frontend-React.js-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js Backend](https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![JWT Auth](https://img.shields.io/badge/Auth-JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Express.js](https://img.shields.io/badge/API-Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)

**A full-stack MERN expense tracking application with real-time analytics, budget management, and secure JWT authentication.**

[📸 Screenshots](#-screenshots) • [⚙️ Setup](#-local-setup) • [📡 API Docs](#-api-endpoints)

</div>

---

## 👩‍💻 Developer

**Ritu Mahajan**
> Full Stack Developer | MERN Stack | Passionate about building clean, functional web applications

[![GitHub](https://img.shields.io/badge/GitHub-mahajanritu-181717?style=for-the-badge&logo=github)](https://github.com/mahajanritu)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **Secure Authentication** | JWT-based login & register with bcrypt password hashing |
| 📊 **Interactive Dashboard** | Real-time income, expense & balance overview |
| 📈 **Visual Analytics** | Area charts, Bar charts & Pie charts powered by Recharts |
| 💼 **13 Categories** | Organized expense & income categories with emoji icons |
| 🎯 **Budget Tracking** | Set monthly budget with visual progress & overspend alerts |
| 🔍 **Smart Filters** | Filter by type, category, date with search functionality |
| 📱 **Responsive Design** | Works seamlessly on desktop and mobile |
| 🌙 **Dark Theme UI** | Professional dark mode interface |
| 🗄️ **MongoDB Atlas** | Cloud database with persistent data storage |
| ⚡ **Fast & Lightweight** | Optimized React components with minimal re-renders |

---

## 📸 Screenshots

### 🔐 Login Page
![Login](screenshots/login.jpg)

---

### 📝 Register Page
![Register](screenshots/Register.jpg)

---

### 📊 Dashboard
![Dashboard](screenshots/dashboard.jpg)

---

### 💸 Transactions
![Transactions](screenshots/transactions.jpg)

![Transactions Detail](screenshots/transection1.jpg)

---

### 📈 Analytics
![Analytics](screenshots/analytics.jpg)

---

### 🗄️ MongoDB Data — Expenses
![MongoDB Expenses](screenshots/Expense_DataMongodb.jpg)

---

### 👥 MongoDB Data — Users
![MongoDB Users](screenshots/Spendly_UsersList.jpg)

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React.js 18 | UI Framework |
| React Router v6 | Client-side routing |
| Recharts | Interactive charts |
| Axios | HTTP client |
| React Hot Toast | Notifications |
| Lucide React | Icon library |
| Date-fns | Date formatting |
| CSS Variables | Design system & theming |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime environment |
| Express.js | Web framework |
| Mongoose | MongoDB ODM |
| JWT | Authentication tokens |
| bcryptjs | Password hashing |
| CORS | Cross-origin requests |
| dotenv | Environment variables |
| Nodemon | Development server |

### Database
| Technology | Purpose |
|------------|---------|
| MongoDB Atlas | Cloud database |
| MongoDB Compass | Database GUI |

---

## 🗂️ Project Structure

```
spendly/
├── 📁 backend/
│   ├── 📁 config/
│   │   └── db.js              # MongoDB Atlas connection
│   ├── 📁 middleware/
│   │   └── auth.js            # JWT authentication middleware
│   ├── 📁 models/
│   │   ├── User.js            # User schema & password hashing
│   │   └── Expense.js         # Expense/Income schema
│   ├── 📁 routes/
│   │   ├── auth.js            # Auth routes (login/register)
│   │   └── expenses.js        # CRUD + Analytics routes
│   ├── .env                   # Environment variables
│   ├── package.json
│   └── server.js              # Express entry point
│
├── 📁 frontend/
│   ├── 📁 public/
│   │   └── index.html
│   └── 📁 src/
│       ├── 📁 components/
│       │   ├── Sidebar.js
│       │   ├── TransactionModal.js
│       │   └── ProtectedRoute.js
│       ├── 📁 context/
│       │   └── AuthContext.js
│       ├── 📁 pages/
│       │   ├── Dashboard.js
│       │   ├── Transactions.js
│       │   ├── Analytics.js
│       │   ├── Settings.js
│       │   ├── Login.js
│       │   └── Register.js
│       ├── 📁 utils/
│       │   └── api.js
│       ├── App.js
│       ├── index.js
│       └── index.css
│
├── 📁 screenshots/
└── README.md
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js v16+
- MongoDB (local or Atlas)
- npm or yarn

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/mahajanritu/spendly.git
cd spendly
```

### 2️⃣ Backend Setup
```bash
cd backend
npm install
```

Create `.env` file in backend folder:
```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/spendly
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

```bash
npm run dev
# Server runs on http://localhost:4000
```

### 3️⃣ Frontend Setup
```bash
cd frontend
npm install
npm start
# App runs on http://localhost:3000
```

---

## 📡 API Endpoints

### 🔐 Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/register` | Register new user | ❌ |
| `POST` | `/api/auth/login` | Login user | ❌ |
| `GET` | `/api/auth/me` | Get current user | ✅ |
| `PUT` | `/api/auth/profile` | Update profile & budget | ✅ |

### 💸 Expenses & Income
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/expenses` | Get all transactions | ✅ |
| `POST` | `/api/expenses` | Add new transaction | ✅ |
| `PUT` | `/api/expenses/:id` | Update transaction | ✅ |
| `DELETE` | `/api/expenses/:id` | Delete transaction | ✅ |
| `GET` | `/api/expenses/stats/summary` | Get analytics & stats | ✅ |

---

## 🗄️ Database Schema

### Users Collection
```json
{
  "_id": "ObjectId",
  "name": "Ritu Mahajan",
  "email": "ritu@example.com",
  "password": "hashed_password",
  "currency": "INR",
  "monthlyBudget": 50000,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Expenses Collection
```json
{
  "_id": "ObjectId",
  "user": "ObjectId (ref: User)",
  "title": "Coffee at Starbucks",
  "amount": 350,
  "type": "expense",
  "category": "Food & Dining",
  "note": "Team meeting",
  "date": "2024-01-15T00:00:00.000Z",
  "createdAt": "2024-01-15T00:00:00.000Z"
}
```

---

## 📊 Categories

| Expenses | Income |
|----------|--------|
| 🍔 Food & Dining | 💼 Salary |
| 🚗 Transportation | 💻 Freelance |
| 🛍️ Shopping | 📈 Investment |
| 🎬 Entertainment | 🎁 Gift |
| ⚡ Bills & Utilities | 📦 Other |
| 💊 Health & Medical | |
| 📚 Education | |
| ✈️ Travel | |
| 📦 Other | |

---

## 🔒 Security Features

- ✅ JWT tokens with 30-day expiry
- ✅ bcrypt password hashing (10 salt rounds)
- ✅ Protected API routes with middleware
- ✅ User-specific data isolation
- ✅ CORS configuration
- ✅ Environment variables for secrets

---

## 🚀 Deployment

| Service | Platform | Status |
|---------|----------|--------|
| Frontend | Vercel | 🔜 Coming Soon |
| Backend | Render | 🔜 Coming Soon |
| Database | MongoDB Atlas | ✅ Connected |

---

<div align="center">

**Made with ❤️ by Ritu Mahajan**

⭐ **Star this repo if you found it helpful!**

</div>
