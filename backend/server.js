const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connecting to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/event_booking';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connection successful! API is fully online.'))
  .catch(err => console.error('MongoDB connection error. Ensure MongoDB is running:', err));

// Routes Configuration
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));

// Basic health check
app.get('/', (req, res) => {
    res.send('Event Booking API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
