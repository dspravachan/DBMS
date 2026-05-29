const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const restaurantRoutes = require('./routes/restaurants');
const foodRoutes = require('./routes/foods');
const mealPlanRoutes = require('./routes/mealPlans');
const weeklyMenuRoutes = require('./routes/weeklyMenu');
const subscriptionRoutes = require('./routes/subscriptions');
const deliveryRoutes = require('./routes/deliveries');
const cartRoutes = require('./routes/cart');
const wishlistRoutes = require('./routes/wishlist');
const reviewRoutes = require('./routes/reviews');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const walletRoutes = require('./routes/wallet');
const couponRoutes = require('./routes/coupons');
const membershipRoutes = require('./routes/memberships');
const adminRoutes = require('./routes/admin');

const app = express();

// ============================================================
// Security & Middleware
// ============================================================
app.use(helmet());

app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5174',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================================
// Health Check
// ============================================================
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'MealMatrix API is running',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
  });
});

// ============================================================
// API Routes
// ============================================================
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/meal-plans', mealPlanRoutes);
app.use('/api/weekly-menu', weeklyMenuRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/memberships', membershipRoutes);
app.use('/api/admin', adminRoutes);

// ============================================================
// 404 Handler
// ============================================================
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ============================================================
// Global Error Handler
// ============================================================
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);

  // Handle specific error types
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      message: 'Duplicate entry. This record already exists.',
    });
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({
      success: false,
      message: 'Invalid reference. Related record does not exist.',
    });
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// ============================================================
// Start Server
// ============================================================
const PORT = parseInt(process.env.PORT) || 5000;

app.listen(PORT, () => {
  console.log(`🚀 MealMatrix API Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 API URL: http://localhost:${PORT}/api`);
});

module.exports = app;
