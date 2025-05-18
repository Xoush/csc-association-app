// /backend/server.js

/**
 * Main Server File
 *
 * This file sets up the Express application, connects to the MongoDB database,
 * defines API routes for users and notifications, and serves static files for uploaded images.
 */

const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();

// Middleware to parse JSON bodies from incoming requests
app.use(express.json());

// Connect to MongoDB using the URI from environment variables
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('Mongo error:', err));

// Import route modules
const userRoutes = require('./routes/userRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Set up API routes
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);

// Serve static files for uploaded assets
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(
  '/uploads/profile-pictures',
  express.static(path.join(__dirname, 'uploads/profile-pictures'))
);
app.use(
  '/uploads/notification-images',
  express.static(path.join(__dirname, 'uploads/notification-images'))
);

// Define the port to run the server, defaulting to 5000 if not set in .env
const PORT = process.env.PORT || 5000;

// Start listening for incoming requests
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
