const express = require('express');
const cors = require('cors');
const http = require('http');
const dotenv = require('dotenv');

// Load environment variables FIRST (before other imports that use them)
dotenv.config();

const connectDB = require('./config/db');
const cloudinary = require('./config/cloudinary');
const errorHandler = require('./middleware/errorHandler');

// Initialize Express app
const app = express();

// Create HTTP server (needed for Socket.io later in Phase 8)
const server = http.createServer(app);

// --------------- Middleware ---------------

// Enable CORS — allows the React frontend to make API calls
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Parse incoming JSON request bodies
app.use(express.json());

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// --------------- Test Route ---------------

// Simple test endpoint to verify the server is running
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is running...',
    environment: process.env.NODE_ENV,
  });
});

// --------------- API Routes ---------------
// Routes will be added here phase by phase
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// --------------- Error Handler ---------------
// Must be AFTER all routes
app.use(errorHandler);

// --------------- Start Server ---------------

const PORT = process.env.PORT || 5000;

// Connect to MongoDB, then start the server
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`Cloudinary configured for cloud: ${process.env.CLOUDINARY_CLOUD_NAME || 'NOT SET'}`);
  });
});
