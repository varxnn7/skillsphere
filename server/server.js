const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const helmet = require('helmet');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

// Connect to Database
connectDB();

const app = express();

// ─────────────────────────────────────────────
// Trust proxy (required for Render / reverse proxies)
// ─────────────────────────────────────────────
app.set('trust proxy', 1);

// ─────────────────────────────────────────────
// Security Headers (Helmet)
// ─────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// ─────────────────────────────────────────────
// Compression
// ─────────────────────────────────────────────
app.use(compression());

// ─────────────────────────────────────────────
// CORS
// ─────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || (!isProduction && origin.startsWith('http://localhost:'))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ─────────────────────────────────────────────
// Body Parsing with size limits
// ─────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─────────────────────────────────────────────
// MongoDB Query Sanitization (prevents NoSQL injection)
// ─────────────────────────────────────────────
app.use(mongoSanitize());

// ─────────────────────────────────────────────
// HTTP Request Logging (dev only)
// ─────────────────────────────────────────────
if (!isProduction) {
  app.use(morgan('dev'));
}

// ─────────────────────────────────────────────
// Rate Limiting
// ─────────────────────────────────────────────

// Strict limit on auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});
app.use('/api/auth', authLimiter);

// General API limit
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later'
  }
});
app.use('/api', generalLimiter);

// ─────────────────────────────────────────────
// Serve uploaded static files
// ─────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─────────────────────────────────────────────
// Health Check Route (required by Render)
// ─────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SkillSphere API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// ─────────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/gigs', require('./routes/gigs'));
app.use('/api/proposals', require('./routes/proposals'));
app.use('/api/search', require('./routes/search'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/conversations', require('./routes/conversations'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/disputes', require('./routes/disputes'));
app.use('/api/admin', require('./routes/admin'));

// Root path fallback
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Welcome to SkillSphere API' });
});

// ─────────────────────────────────────────────
// 404 Handler
// ─────────────────────────────────────────────
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'API Endpoint not found' });
});

// ─────────────────────────────────────────────
// Global Error Handler
// ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('API Error:', err.message || err);
  const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  res.status(statusCode).json({
    success: false,
    message: isProduction ? 'Something went wrong' : (err.message || 'Internal Server Error'),
    ...(isProduction ? {} : { stack: err.stack })
  });
});

// ─────────────────────────────────────────────
// HTTP Server + Socket.IO
// ─────────────────────────────────────────────
const server = http.createServer(app);

// Initialize Socket.IO
const { initSocket } = require('./socket');
const { sendRealTimeNotification, io } = initSocket(server, allowedOrigins);
app.set('sendRealTimeNotification', sendRealTimeNotification);
app.set('io', io);

// ─────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// ─────────────────────────────────────────────
// Keep-alive ping (prevents Render free tier spin-down)
// Pings /health every 14 minutes to keep the dyno awake
// ─────────────────────────────────────────────
if (isProduction) {
  setInterval(() => {
    const https = require('https');
    const backendUrl = process.env.RENDER_EXTERNAL_URL || `https://skillsphere-api.onrender.com`;
    https.get(`${backendUrl}/health`, (res) => {
      console.log(`Keep-alive ping: ${res.statusCode}`);
    }).on('error', (err) => {
      console.log('Keep-alive error:', err.message);
    });
  }, 14 * 60 * 1000); // every 14 minutes
}

// ─────────────────────────────────────────────
// Unhandled Promise Rejections
// ─────────────────────────────────────────────
process.on('unhandledRejection', (err) => {
  console.log(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});
