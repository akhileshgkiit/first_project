const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const Event = require('./models/Event');
const User = require('./models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/event_booking';

const seedDatabase = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB for Premium Seeding...');

        await Event.deleteMany();
        
        const adminExists = await User.findOne({ email: "admin@example.com" });
        if(!adminExists) {
            const salt = await bcrypt.genSalt(10);
            const adminPassword = await bcrypt.hash("admin123", salt);
            const adminUser = new User({
                name: "Main Admin",
                email: "admin@example.com",
                password: adminPassword,
                isAdmin: true
            });
            await adminUser.save();
        }

        const dummyEvents = [
            {
                title: "Global Tech Summit 2026",
                description: "Join developers from around the world to discuss the future of AI and Web Technologies.",
                date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), 
                category: "Seminar",
                price: 1500,
                totalSeats: 250,
                availableSeats: 250,
                imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop"
            },
            {
                title: "NH7 Weekender Festival",
                description: "A gorgeous outdoor music festival featuring top electronic and indie artists in India.",
                date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), 
                category: "Music",
                price: 3499,
                totalSeats: 500,
                availableSeats: 500,
                imageUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&auto=format&fit=crop"
            },
            {
                title: "JavaScript MERN Workshop",
                description: "Intensive 2-day workshop to master completely advanced MERN stacks.",
                date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                category: "Workshop",
                price: 999,
                totalSeats: 40,
                availableSeats: 40,
                imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop"
            },
            {
                title: "ISL Football Finals - Kolkata",
                description: "The biggest football match of the year! Book your tickets before they sell out completely.",
                date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                category: "Sports",
                price: 1200,
                totalSeats: 1000,
                availableSeats: 85,
                imageUrl: "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=600&auto=format&fit=crop"
            },
            {
                title: "Photography Exhibition & Seminar",
                description: "Learn from top photographers around the country. Focuses on cinematic shots.",
                date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                category: "Seminar",
                price: 500,
                totalSeats: 150,
                availableSeats: 150,
                imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop"
            },
            {
                title: "Standup Comedy Night",
                description: "Unfiltered laughter with the best touring comedians. 18+ only.",
                date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                category: "Other",
                price: 799,
                totalSeats: 200,
                availableSeats: 10,
                imageUrl: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=600&auto=format&fit=crop"
            },
            {
                title: "Cricket World Cup Screenings",
                description: "Live stadium-like huge screenings for the big finals!",
                date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
                category: "Sports",
                price: 350,
                totalSeats: 300,
                availableSeats: 300,
                imageUrl: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600&auto=format&fit=crop"
            },
            {
                title: "Arijit Singh Live Concert",
                description: "Experience the magic of soulful Bollywood playback singing live.",
                date: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
                category: "Music",
                price: 4999,
                totalSeats: 2000,
                availableSeats: 450,
                imageUrl: "https://images.unsplash.com/photo-1470229722913-7c090be5c526?w=600&auto=format&fit=crop"
            }
        ];

        await Event.insertMany(dummyEvents);
        console.log('Dummy Events seeded successfully with beautiful images!');

        mongoose.connection.close();
        console.log('Database seeding finished.');
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDatabase();
