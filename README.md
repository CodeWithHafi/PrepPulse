# PrepPulse 🎯
### *Every Day Counts.*

A production-ready **Exam Countdown & Study Tracker** for students preparing for JEE, NEET, CUET, SSC, UPSC, Railway, Banking, and Board Exams.

---

## 📁 Project Structure

```
preppulse/
├── backend/                   # Node.js + Express API
│   ├── config/
│   │   └── db.js              # MySQL connection pool
│   ├── middleware/
│   │   └── auth.js            # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js            # Register / Login
│   │   ├── tasks.js           # Task CRUD
│   │   ├── sessions.js        # Study sessions + streak logic
│   │   ├── analytics.js       # Aggregated analytics
│   │   ├── profile.js         # Profile view/edit
│   │   └── dashboard.js       # Dashboard aggregate
│   ├── server.js              # Express entry point
│   ├── package.json
│   └── .env.example
│
├── frontend/                  # React + Vite SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Layout.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── BottomNav.jsx
│   │   │   └── common/
│   │   │       ├── ProtectedRoute.jsx
│   │   │       └── ConfirmModal.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ToastContext.jsx
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Tasks.jsx
│   │   │   ├── StudyTracker.jsx
│   │   │   ├── Analytics.jsx
│   │   │   └── Profile.jsx
│   │   ├── services/
│   │   │   └── api.js         # Centralized API client
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── database/
    └── schema.sql             # MySQL schema
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js ≥ 18
- MySQL ≥ 8.0
- npm ≥ 9

### 1. Database Setup

```bash
mysql -u root -p < database/schema.sql
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your MySQL credentials and JWT secret
npm install
npm run dev          # starts on :5000
```

### 3. Frontend Setup

```bash
cd frontend
cp .env.example .env
# VITE_API_URL is empty for dev (Vite proxy handles /api → :5000)
npm install
npm run dev          # starts on :5173
```

Open **http://localhost:5173** in your browser.

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable       | Default           | Description                         |
|----------------|-------------------|-------------------------------------|
| PORT           | 5000              | API server port                     |
| NODE_ENV       | development       | Environment mode                    |
| DB_HOST        | localhost         | MySQL host                          |
| DB_PORT        | 3306              | MySQL port                          |
| DB_USER        | root              | MySQL username                      |
| DB_PASSWORD    | —                 | MySQL password                      |
| DB_NAME        | preppulse         | MySQL database name                 |
| JWT_SECRET     | —                 | Secret key for signing tokens       |
| JWT_EXPIRES_IN | 7d                | Token expiry (e.g. 1d, 7d, 30d)    |
| CLIENT_URL     | http://localhost:5173 | Frontend URL for CORS           |

### Frontend (`frontend/.env`)

| Variable      | Default | Description                              |
|---------------|---------|------------------------------------------|
| VITE_API_URL  | (empty) | Backend base URL (empty = same origin)   |

---

## 📖 API Documentation

Base URL: `http://localhost:5000`

All protected endpoints require:
```
Authorization: Bearer <jwt_token>
```

---

### Auth

#### POST `/api/auth/register`
Register a new user.

**Request body:**
```json
{
  "name":            "Rahul Sharma",
  "email":           "rahul@example.com",
  "password":        "securepass123",
  "confirmPassword": "securepass123",
  "exam_name":       "JEE Main",
  "exam_date":       "2025-04-15"
}
```

**Response 201:**
```json
{
  "success": true,
  "token": "<jwt>",
  "user": { "id": 1, "name": "Rahul Sharma", "email": "...", "exam_name": "JEE Main", "exam_date": "2025-04-15" }
}
```

---

#### POST `/api/auth/login`
**Request body:**
```json
{ "email": "rahul@example.com", "password": "securepass123" }
```
**Response 200:** Same shape as register.

---

### Dashboard

#### GET `/api/dashboard` 🔒
Returns all data for the dashboard in one call.

**Response:**
```json
{
  "success": true,
  "dashboard": {
    "user": { "id": 1, "name": "...", "exam_name": "JEE Main", "exam_date": "..." },
    "exam": { "name": "JEE Main", "date": "...", "days_remaining": 425, "predicted_hours": 1275 },
    "today_tasks": { "total": 5, "completed": 3, "remaining": 2 },
    "all_tasks": { "total": 130, "completed": 110 },
    "streak": { "current": 12, "longest": 25 },
    "study": { "total_hours": 250 }
  }
}
```

---

### Tasks

#### GET `/api/tasks` 🔒
Returns all tasks for logged-in user (newest first).

#### POST `/api/tasks` 🔒
```json
{ "task_title": "Complete Kinematics Notes" }
```

#### PUT `/api/tasks/:id` 🔒
```json
{ "is_completed": true }
```
or:
```json
{ "task_title": "Updated title" }
```

#### DELETE `/api/tasks/:id` 🔒
Returns `{ "success": true, "message": "Task deleted." }`

---

### Study Sessions

#### GET `/api/sessions` 🔒
Returns all sessions (newest date first).

#### POST `/api/sessions` 🔒
```json
{
  "subject_name":  "Physics",
  "study_hours":   2,
  "study_minutes": 30,
  "session_date":  "2025-03-20"
}
```
Also automatically updates the streak.

#### DELETE `/api/sessions/:id` 🔒

---

### Analytics

#### GET `/api/analytics` 🔒
```json
{
  "analytics": {
    "total_hours": 250,
    "total_sessions": 87,
    "total_tasks": 150,
    "completed_tasks": 130,
    "completion_rate": 86.7,
    "current_streak": 12,
    "longest_streak": 25,
    "weekly": [
      { "date": "2025-03-14", "label": "Fri", "hours": 3.5 },
      ...
    ],
    "monthly": [
      { "day": 1, "hours": 2.5 },
      ...
    ]
  }
}
```

---

### Profile

#### GET `/api/profile` 🔒
#### PUT `/api/profile` 🔒
```json
{
  "name":             "New Name",
  "exam_name":        "NEET",
  "exam_date":        "2025-05-05",
  "current_password": "oldpass123",
  "new_password":     "newpass456"
}
```
All fields are optional. `current_password` is required only when changing password.

---

## 🚢 Deployment

### Frontend → Vercel

1. Push `frontend/` to GitHub
2. Import repo in [vercel.com](https://vercel.com)
3. **Framework preset:** Vite
4. **Root directory:** `frontend`
5. **Build command:** `npm run build`
6. **Output directory:** `dist`
7. Add environment variable:
   - `VITE_API_URL` = your Railway/Render backend URL

### Backend → Railway

1. Push `backend/` to GitHub (or monorepo root)
2. Create new project at [railway.app](https://railway.app)
3. Add a **MySQL** plugin to the project
4. Connect your GitHub repo
5. Set **Root directory** to `backend`
6. Set **Start command**: `node server.js`
7. Add environment variables from `.env.example`
8. Set `CLIENT_URL` to your Vercel frontend URL
9. Railway auto-assigns a public URL — copy it to Vercel's `VITE_API_URL`

### Backend → Render

1. Create **Web Service** in Render
2. Connect repo, set **Root directory:** `backend`
3. **Build command:** `npm install`
4. **Start command:** `node server.js`
5. Add environment variables
6. Separately provision a **MySQL** database on PlanetScale or Aiven

---

## 🧪 Sample Test Data (SQL)

```sql
USE preppulse;

-- Insert a test user (password: testpass123)
INSERT INTO users (name, email, password, exam_name, exam_date)
VALUES (
  'Priya Singh',
  'priya@test.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj0MLzjJnmuy',
  'NEET',
  '2025-05-04'
);

-- Tasks
INSERT INTO tasks (user_id, task_title, is_completed) VALUES
  (1, 'Complete Biology Chapter 5', 1),
  (1, 'Solve 50 Physics MCQs',      0),
  (1, 'Revise Organic Chemistry',   1),
  (1, 'Take full mock test',         0);

-- Sessions
INSERT INTO study_sessions (user_id, subject_name, study_hours, study_minutes, session_date) VALUES
  (1, 'Biology',   3, 0,  CURDATE()),
  (1, 'Physics',   2, 30, DATE_SUB(CURDATE(), INTERVAL 1 DAY)),
  (1, 'Chemistry', 2, 0,  DATE_SUB(CURDATE(), INTERVAL 2 DAY));

-- Streak
INSERT INTO streaks (user_id, current_streak, longest_streak, last_study_date)
VALUES (1, 3, 10, CURDATE());
```

---

## 🎨 UI Features

- **Responsive:** Sidebar on desktop, bottom navigation on mobile
- **Toast notifications** for every action
- **Optimistic UI updates** for task completion
- **Animated countdown ring** on dashboard
- **Chart.js** bar + line charts for analytics
- **Empty states** with helpful messages
- **Confirm modals** before destructive actions
- **Form validation** client-side + server-side

---

## 🔒 Security

- bcrypt (12 rounds) for password hashing
- JWT tokens with expiry
- `express-validator` for all inputs
- Parameterized queries (no raw string interpolation)
- CORS restricted to frontend origin
- Ownership checks on all data mutations

---

## 📄 License

MIT – build something great!
