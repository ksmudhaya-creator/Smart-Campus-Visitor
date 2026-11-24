const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const { connectDB } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const seedData = require('./services/seedService');
const User = require('./models/User');

// Route imports
const authRoutes = require('./routes/authRoutes');
const visitorRoutes = require('./routes/visitorRoutes');
const fsmRoutes = require('./routes/fsmRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const logRoutes = require('./routes/logRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Security HTTP headers
app.use(helmet());

// Cross-Origin Resource Sharing
app.use(
  cors({
    origin: '*', // Allow development frontend
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Request Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiting (General API)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});
app.use('/api', apiLimiter);

// Health check and root route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Smart Campus Visitor Entry and Exit State Tracking System',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.get('/', (req, res) => {
  res.json({
    name: 'Smart Campus Visitor Entry & Exit Tracking API',
    documentation: '/api/health',
    endpoints: {
      auth: '/api/auth',
      visitors: '/api/visitors',
      fsm: '/api/fsm',
      dashboard: '/api/dashboard',
      logs: '/api/logs',
      users: '/api/users'
    }
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/fsm', fsmRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/users', userRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start Server & Connect to DB
const startServer = async () => {
  try {
    await connectDB();

    // Check if initial seeding is needed (auto-seed if empty database)
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Bootstrap] No existing user records detected. Auto-seeding initial database...');
      await seedData(false);
    }

    const server = app.listen(PORT, () => {
      console.log('==================================================================');
      console.log(`  Smart Campus Visitor Tracking Server running on port: ${PORT}  `);
      console.log(`  Mode: ${process.env.NODE_ENV || 'development'}                `);
      console.log(`  API Health: http://localhost:${PORT}/api/health              `);
      console.log('==================================================================');
    });

    return server;
  } catch (err) {
    console.error('Fatal Server Error:', err.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
