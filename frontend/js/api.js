const API_URL = 'http://localhost:5000/api';

// Helper to get headers with or without auth token
const getHeaders = (withAuth = false) => {
    const headers = { 'Content-Type': 'application/json' };
    if (withAuth) {
        const token = localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }
    return headers;
};

// Authentication API
const authAPI = {
    login: async (email, password) => {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ email, password })
        });
        return res.json();
    },
    register: async (name, email, password) => {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ name, email, password })
        });
        return res.json();
    }
};

// Events API
const eventAPI = {
    getAll: async () => {
        const res = await fetch(`${API_URL}/events`);
        return res.json();
    },
    create: async (eventData) => {
        const res = await fetch(`${API_URL}/events`, {
            method: 'POST',
            headers: getHeaders(true),
            body: JSON.stringify(eventData)
        });
        return res;
    },
    update: async (id, eventData) => {
        const res = await fetch(`${API_URL}/events/${id}`, {
            method: 'PUT',
            headers: getHeaders(true),
            body: JSON.stringify(eventData)
        });
        return res;
    },
    delete: async (id) => {
        const res = await fetch(`${API_URL}/events/${id}`, {
            method: 'DELETE',
            headers: getHeaders(true)
        });
        return res;
    }
};

// Bookings API
const bookingAPI = {
    bookEvent: async (eventId, seatsBooked) => {
        const res = await fetch(`${API_URL}/bookings`, {
            method: 'POST',
            headers: getHeaders(true),
            body: JSON.stringify({ eventId, seatsBooked })
        });
        return res;
    },
    getMyBookings: async () => {
        const res = await fetch(`${API_URL}/bookings/mybookings`, {
            headers: getHeaders(true)
        });
        return res.json();
    }
};

// Check if user is logged in
const checkAuthStatus = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    
    const authLink = document.getElementById('auth-link');
    if (authLink) {
        if (user && token) {
            authLink.innerHTML = `<a href="dashboard.html">Dashboard</a>`;
        } else {
            authLink.innerHTML = `<a href="login.html">Login</a>`;
        }
    }
    return { user, token };
};

// Initialize common UI immediately
document.addEventListener('DOMContentLoaded', checkAuthStatus);

// Global Theme Management
document.addEventListener('DOMContentLoaded', () => {
    const themeBtn = document.getElementById('theme-toggle');
    if(themeBtn) {
        if(localStorage.getItem('theme') === 'dark') {
            document.body.classList.add('dark-mode');
            themeBtn.textContent = '☀️';
        }
        themeBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            if(document.body.classList.contains('dark-mode')) {
                localStorage.setItem('theme', 'dark');
                themeBtn.textContent = '☀️';
            } else {
                localStorage.setItem('theme', 'light');
                themeBtn.textContent = '🌙';
            }
        });
    }
});
