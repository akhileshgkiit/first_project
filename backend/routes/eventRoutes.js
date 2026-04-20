const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// GET /api/events - Get all events
router.get('/', async (req, res) => {
    try {
        const events = await Event.find().sort({ date: 1 });
        res.json(events);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// GET /api/events/:id - Get single event
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.json(event);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// POST /api/events - Create an event (Admin only)
router.post('/', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        const { title, description, date, category, price, totalSeats } = req.body;
        
        const newEvent = new Event({
            title,
            description,
            date,
            category,
            price,
            totalSeats,
            availableSeats: totalSeats // Initially, all seats are available
        });

        const event = await newEvent.save();
        res.json(event);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// PUT /api/events/:id - Update an event (Admin only)
router.put('/:id', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        let event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        // Update fields if provided
        const updateData = req.body;
        // If totalSeats changes and we need to recalculate availableSeats, 
        // we'll keep it simple: just let admin override availableSeats directly if they want
        
        event = await Event.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        );

        res.json(event);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// DELETE /api/events/:id - Delete an event (Admin only)
router.delete('/:id', [authMiddleware, adminMiddleware], async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        await event.deleteOne();
        res.json({ message: 'Event removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
