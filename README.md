# Eventify - Premium Event Ticket Booking System

Eventify is a professional, full-stack event management and ticket booking application built using the MERN-lite stack (Node.js, Express, MongoDB, and Vanilla Frontend). It features a premium user interface with dark mode, interactive seat mapping, and scannable digital tickets.

## 🌟 Key Features

- **Authentication System**: Secure JWT-based login and registration for both Users and Admins.
- **Interactive Seat Selection**: A visual, grid-based seat selector for a realistic booking experience.
- **Admin Analytics Dashboard**: Real-time data visualization using Chart.js (Revenue & Category distribution).
- **Premium Payment Gateway**: A realistic, secure checkout mockup with card and UPI support.
- **Digital Tickets**: Scannable QR codes containing full ticket details and **PDF Download** functionality.
- **Sleek UI/UX**: Responsive glassmorphism design with a global **Dark Mode** toggle.

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (via Mongoose)
- **Frontend**: HTML5, Vanilla CSS3 (Variables, Flexbox, Grid), Vanilla JavaScript (ES6+)
- **Libraries**: 
  - `jsonwebtoken` & `bcryptjs` (Security)
  - `Chart.js` (Analytics)
  - `html2pdf.js` (PDF Generation)
  - `QRServer API` (QR Generation)

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) installed.
- [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally.

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/EventBookingSystem.git
   cd EventBookingSystem
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   # Create a .env file and add your JWT_SECRET and MONGODB_URI
   node seed.js # To populate the database with events and admin
   node server.js # Start the server
   ```

3. **Frontend Setup**:
   - Simply open `frontend/index.html` in your browser or use a Live Server.

## 🛡️ Admin Credentials (Demo)
- **Email**: `admin@example.com`
- **Password**: `admin123`

---
Developed for University Project / Viva Presentation.
