require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

/* =========================
   Middleware
========================= */
app.use(helmet());

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS not allowed for origin: ${origin}`));
  },
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   MongoDB Connection
========================= */
const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error('❌ MONGO_URI is not defined in environment variables');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    const redactedUri = mongoUri.replace(/:\/\/[^@]+@/, '://***:***@');
    console.log('✅ Connected to MongoDB');
    console.log(`📍 Database: ${redactedUri}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

/* =========================
   Root Route
========================= */
app.get('/', (req, res) => {
  res.send('🚀 Exam System API is running...');
});

/* =========================
   Health Check
========================= */
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const isHealthy = dbState === 1;

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    status: isHealthy ? 'OK' : 'Database unavailable',
    db: mongoose.STATES[dbState],
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development',
  });
});

/* =========================
   Routes
========================= */
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/questions', require('./routes/questionRoutes'));
app.use('/api/quizzes', require('./routes/quizRoutes'));
app.use('/api/quiz-attempts', require('./routes/quizAttemptRoutes'));
//mới thêm
app.use("/api/classes", require("./routes/classRoutes"));

// subjects
app.use("/api/subjects", require("./routes/subjectRoutes"));

/* =========================
   Admin Routes
========================= */
app.use('/api/admin', require('./routes/adminRoutes'));

/* =========================
    404 Handler
========================= */
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

/* =========================
   Global Error Handler
========================= */
app.use((err, req, res, next) => {
  console.error(err.stack);
res.status(err.status || 500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

/* =========================
   Start Server
========================= */
const startServer = async () => {
  await connectDB();

  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📌 API URL: http://localhost:${PORT}/api`);
  });
};

startServer();

module.exports = app;
