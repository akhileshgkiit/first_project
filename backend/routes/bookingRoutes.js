const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const { authMiddleware } = require('../middleware/auth');

// POST /api/bookings - Create a new booking
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { eventId, seatsBooked } = req.body;

        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        if (event.availableSeats < seatsBooked) {
            return res.status(400).json({ message: 'Not enough seats available' });
        }

        const totalPrice = event.price * seatsBooked;

        const booking = new Booking({
            user: req.user.id,
            event: eventId,
            seatsBooked,
            totalPrice
        });

        // Save booking
        await booking.save();

        // Update available seats in Event
        event.availableSeats -= seatsBooked;
        await event.save();

        // Populate event details before returning
        const populatedBooking = await Booking.findById(booking._id).populate('event', ['title', 'date', 'category']);

        res.json(populatedBooking);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// GET /api/bookings/mybookings - Get user's bookings
router.get('/mybookings', authMiddleware, async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.id })
                                      .populate('event', ['title', 'date', 'category', 'price'])
                                      .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// GET /api/bookings - Get all bookings (Admin only, optional feature but good to have)
const { adminMiddleware } = require('../middleware/auth');
router.get('/', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        const bookings = await Booking.find()
                                      .populate('user', ['name', 'email'])
                                      .populate('event', ['title', 'date'])
                                      .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
