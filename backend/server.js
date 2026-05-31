// server.js
// PrepPulse API Server

require('dotenv').config();

const express = require('express');
const cors    = require('cors');

const authRoutes      = require('./routes/auth');
const taskRoutes      = require('./routes/tasks');
const sessionRoutes   = require('./routes/sessions');
const analyticsRoutes = require('./routes/analytics');
const profileRoutes   = require('./routes/profile');
const dashboardRoutes = require('./routes/dashboard');

const app  = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ──────────────────────────────────────────────
app.use(cors({
  origin:      process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'PrepPulse API is running 🚀', timestamp: new Date() });
});

// ─── Routes ──────────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/tasks',     taskRoutes);
app.use('/api/sessions',  sessionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/profile',   profileRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ─── 404 Handler ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// ─── Global Error Handler ────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

// ─── Start Server ────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀  PrepPulse API listening on port ${PORT}`);
  console.log(`📍  Environment: ${process.env.NODE_ENV || 'development'}`);
});
