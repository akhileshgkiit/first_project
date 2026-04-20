const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Music', 'Sports', 'Seminar', 'Workshop', 'Festival', 'Other']
    },
    imageUrl: {
        type: String,
        default: 'https://images.unsplash.com/photo-1501281668745-f7f5792203b2?q=80&w=600&auto=format&fit=crop'
    },
    price: {
        type: Number,
        required: true
    },
    totalSeats: {
        type: Number,
        required: true
    },
    availableSeats: {
        type: Number,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
