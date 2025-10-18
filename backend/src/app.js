const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const corsOptions = require('./config/cors');
const errorHandler = require('./middleware/errorHandler');

// Импорт маршрутов
const grantRoutes = require('./routes/grantRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Grant Cabinet API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/grants', grantRoutes);
app.use('/api/auth', authRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Error handler
app.use(errorHandler);

module.exports = app;