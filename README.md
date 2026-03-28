# 🚀 Freelancer Platform

A full-stack freelance management web application built with **React**, **Node.js**, **Express**, and **MongoDB**. Manage clients, tasks, payments, and generate invoices — all in one place.

---


## ✨ Features

### 👥 Client Management
- Add, edit, and delete clients
- View all clients with contact details
- Filter payments and tasks by client

### ✅ Task Management
- Create and manage tasks with priorities (High / Medium / Low)
- Track task status (To-Do / In Progress / Done)
- Due date tracking with overdue alerts
- Task completion progress bar

### 💰 Payment Tracking
- Record payments with Paid / Pending / Overdue status
- Payment summary (total earned, pending, overdue)
- Monthly revenue trend chart (last 6 months)
- Overdue payment alert banner

### 🧾 Invoice Generation
- Generate professional PDF invoices for clients
- Download and share invoices instantly

### 📊 Dashboard & Analytics
- Real-time stats (clients, tasks, earned, pending)
- Monthly revenue area chart with trend indicator
- Payment overview bar chart
- Task status pie chart
- Smart notifications bell with alerts
- Platform health score

### 🔐 Authentication
- JWT-based secure authentication
- Protected routes
- Token stored in localStorage
- Auto logout on token expiry (401 interceptor)

### 👤 Profile Management
- Update name, email, phone, location, bio, skills
- Change password securely
- Profile stats overview

---

## 🛠️ Tech Stack

### Frontend
| Tech | Purpose |
|------|---------|
| React 18 | UI framework |
| React Router v6 | Client-side routing |
| Axios | HTTP requests |
| Recharts | Charts & data visualization |
| Tailwind CSS | Styling |
| React Hot Toast | Notifications |

### Backend
| Tech | Purpose |
|------|---------|
| Node.js | Runtime |
| Express.js | Web framework |
| MongoDB + Mongoose | Database |
| JWT | Authentication |
| bcryptjs | Password hashing |

---

## 📁 Project Structure

```
freelancer-platform/
│
├── frontend/                   # React app
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js        # Axios instance with interceptors
│   │   ├── components/
│   │   │   └── Sidebar.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Auth state management
│   │   └── pages/
│   │       ├── Dashboard.jsx
│   │       ├── Login.jsx
│   │       ├── Register.jsx
│   │       ├── Clients.jsx
│   │       ├── Tasks.jsx
│   │       ├── Payments.jsx
│   │       └── Profile.jsx
│
├── backend/                    # Node.js + Express API
│   ├── middleware/
│   │   └── auth.js             # JWT middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── client.js
│   │   ├── task.js
│   │   └── payment.js
│   ├── routes/
│   │   ├── auth.js             # Register, login, profile, password
│   │   ├── clients.js
│   │   ├── tasks.js
│   │   └── payments.js
│   ├── .env
│   └── server.js
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

---

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/freelancer-platform.git
cd freelancer-platform
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
CLIENT_URL=http://localhost:5173
```

Start the backend:

```bash
# Development
nodemon server.js

# Production
node server.js
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will run at `http://localhost:5173`

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/profile` | Get profile (protected) |
| PUT | `/api/auth/profile` | Update profile (protected) |
| PUT | `/api/auth/change-password` | Change password (protected) |

### Clients
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/clients` | Get all clients |
| POST | `/api/clients` | Add client |
| PUT | `/api/clients/:id` | Update client |
| DELETE | `/api/clients/:id` | Delete client |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get all tasks |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| PATCH | `/api/tasks/:id/status` | Update task status |
| DELETE | `/api/tasks/:id` | Delete task |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/payments` | Get all payments |
| GET | `/api/payments/summary` | Get totals (earned/pending/overdue) |
| GET | `/api/payments/monthly` | Get last 6 months earnings |
| POST | `/api/payments` | Add payment |
| PUT | `/api/payments/:id` | Update payment |
| PATCH | `/api/payments/:id/status` | Update payment status |
| DELETE | `/api/payments/:id` | Delete payment |

---

## 🌐 Deployment

### Frontend → Vercel
```bash
cd frontend
npm run build
# Deploy dist/ folder to Vercel
```

### Backend → Render
1. Push backend to GitHub
2. Create new Web Service on [render.com](https://render.com)
3. Add all `.env` variables in Render dashboard
4. Deploy!

---

## 🔒 Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Backend port (default: 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT tokens |
| `CLIENT_URL` | Frontend URL (for CORS) |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request



---




> ⭐ If you found this project helpful, please give it a star on GitHub!