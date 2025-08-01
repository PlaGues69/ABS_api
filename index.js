require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const connectDB = require('./config/db');

// Custom middlewares
const errorHandler = require('./middlewares/errorHandler');
const adminAuth = require('./middlewares/adminAuth');
// Example: const validateUser = require('./middlewares/validateUser');

// Swagger docs
const setupSwagger = require('./swagger');


const userRoutes = require('./routes/userRoute');
const productRoutes = require('./routes/productRoute');
const postRoutes = require('./routes/postRoute');
const adminUserRoutes = require('./routes/admin/userRouteAdmin');
const adminProductRoutes = require('./routes/admin/productRouteAdmin');
const orderRoutes = require('./routes/orderRoute');
const downloadRoutes = require('./routes/downloadRoute');
const authRoutes = require('./routes/authRoute');
const jwtAuth = require('./middlewares/jwtAuth');

const app = express();
const PORT = process.env.PORT || 5050;

// ✅ Ensure 'uploads/' folder exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log("📁 'uploads/' folder created.");
}

// Connect to MongoDB
connectDB();

// Setup Swagger docs
setupSwagger(app);

// Security Middlewares
app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })); // 100 requests/15min

// Logging
app.use(morgan('dev'));

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Handle favicon.ico request
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// Routes
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to the API',
    endpoints: [
      '/api/auth - Authentication endpoints',
      '/api/users - User management',
      '/api/products - Product catalog',
      '/api/posts - Blog/Post management',
      '/api/orders - Order management',
      '/api/admin - Admin panel (requires admin privileges)'
    ]
  });
});

// API Routes
app.use("/api/posts", postRoutes);

app.use("/api/auth", authRoutes); // Register, login, etc.
app.use("/api/users", jwtAuth, userRoutes); // Protect user routes
app.use("/api/products", productRoutes);
// Protect admin routes
app.use("/api/admin/products", jwtAuth, adminAuth, adminProductRoutes);
app.use("/api/admin/users", jwtAuth, adminAuth, adminUserRoutes);
app.use("/api/orders", jwtAuth, orderRoutes); // Protect orders
app.use("/api/download", jwtAuth, downloadRoutes);

// Health check
app.get('/hey', (req, res) => {
  res.send('Hello World!');
});

// Error handler (should be last middleware)
app.use(errorHandler);

// ✅ Only start the server if not in test mode
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`✅ Server running on port number ${PORT}`);
  });
}

// ✅ Export app for testing
module.exports = app;
