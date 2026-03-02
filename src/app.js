const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const messages = require('./utils/messages');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const organizationRoutes = require('./routes/organizationRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const sparePartRoutes = require('./routes/sparePartRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const equipmentRoutes = require('./routes/equipmentRoutes');
const entryRoutes = require('./routes/entryRoutes');
const outputRoutes = require('./routes/outputRoutes');
const userRoutes = require('./routes/userRoutes');
const auditRoutes = require('./routes/auditRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

const app = express();

// Configure helmet with proper settings for serving images
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false,
}));

// Configure CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://bicu-client.onrender.com',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Permitir peticiones sin origin (como las de Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploaded images) with proper headers
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
}, express.static('public/uploads'));

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: messages.health.ok,
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/spare-parts', sparePartRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/equipments', equipmentRoutes);
app.use('/api/entries', entryRoutes);
app.use('/api/outputs', outputRoutes);
app.use('/api/users', userRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/settings', settingsRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: messages.errors.routeNotFound,
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || messages.errors.internalError,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

module.exports = app;
