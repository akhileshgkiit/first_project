document.addEventListener('DOMContentLoaded', async () => {
    const eventsContainer = document.getElementById('events-container');
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const searchBtn = document.getElementById('search-btn');
    const loadingSpinner = document.getElementById('loading-spinner');
    
    // Booking Modal
    const bookingModal = document.getElementById('booking-modal');
    const closeModal = document.getElementById('close-modal');
    const seatCount = document.getElementById('seat-count');
    const confirmBtn = document.getElementById('confirm-booking-btn');
    
    // Payment Modal Elements
    const paymentModal = document.getElementById('payment-modal');
    const closePaymentModal = document.getElementById('close-payment-modal');
    const paymentForm = document.getElementById('payment-form');
    const paymentTotalAmount = document.getElementById('payment-total-amount');
    const processPaymentBtn = document.getElementById('process-payment-btn');

    // Payment Methods toggler
    const methodTabs = document.querySelectorAll('.payment-methods .method');
    const cardInputs = document.getElementById('card-inputs');
    const upiInputs = document.getElementById('upi-inputs');

    if (methodTabs.length > 0) {
        methodTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                methodTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                if (tab.dataset.method === 'upi') {
                    cardInputs.style.display = 'none';
                    upiInputs.style.display = 'block';
                    cardInputs.querySelectorAll('input').forEach(inp => inp.required = false);
                    document.getElementById('upi-id-input').required = true;
                } else {
                    cardInputs.style.display = 'block';
                    upiInputs.style.display = 'none';
                    cardInputs.querySelectorAll('input').forEach(inp => inp.required = true);
                    document.getElementById('upi-id-input').required = false;
                }
            });
        });
    }

    let allEvents = [];
    let selectedEventForBooking = null;

    // Load Events
    const loadEvents = async () => {
        try {
            loadingSpinner.style.display = 'block';
            eventsContainer.innerHTML = '';
            
            allEvents = await eventAPI.getAll();
            renderEvents(allEvents);
        } catch (err) {
            eventsContainer.innerHTML = '<p class="error">Failed to load events. Ensure backend is running.</p>';
        } finally {
            loadingSpinner.style.display = 'none';
        }
    };

    const renderEvents = (events) => {
        eventsContainer.innerHTML = '';
        if (events.length === 0) {
            eventsContainer.innerHTML = '<p>No events found.</p>';
            return;
        }

        events.forEach(event => {
            const card = document.createElement('div');
            card.className = 'event-card';
            
            const eventDate = new Date(event.date).toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'
            });

            card.innerHTML = `
                <div class="card-image" style="background-image: url('${event.imageUrl || 'https://images.unsplash.com/photo-1501281668745-f7f5792203b2?q=80&w=600&auto=format&fit=crop'}')"></div>
                <div class="card-content">
                    <span class="category">${event.category}</span>
                    <h3>${event.title}</h3>
                    <p><strong>Date:</strong> ${eventDate}</p>
                <p>${event.description}</p>
                <div class="price-row">
                    <span>₹${event.price} / ticket</span>
                    <span style="font-size:0.85em; color: var(--text-secondary);">
                        ${event.availableSeats} / ${event.totalSeats} seats left
                    </span>
                </div>
                <button class="btn-primary book-btn" ${event.availableSeats <= 0 ? 'disabled' : ''} data-id="${event._id}">
                    ${event.availableSeats > 0 ? 'Book Ticket' : 'Sold Out'}
                </button>
                </div>
            `;
            eventsContainer.appendChild(card);
        });

        // Add event listeners to book buttons
        document.querySelectorAll('.book-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const eventId = e.target.getAttribute('data-id');
                openBookingModal(eventId);
            });
        });
    };

    // Filter Logic
    const filterEvents = () => {
        const searchText = searchInput.value.toLowerCase();
        const categoryText = categoryFilter.value;

        const filtered = allEvents.filter(event => {
            const matchSearch = event.title.toLowerCase().includes(searchText);
            const matchCategory = categoryText === '' || event.category === categoryText;
            return matchSearch && matchCategory;
        });

        renderEvents(filtered);
    };

    if (searchBtn) searchBtn.addEventListener('click', filterEvents);
    if (categoryFilter) categoryFilter.addEventListener('change', filterEvents);
    if (searchInput) searchInput.addEventListener('keyup', (e) => {
        if(e.key === 'Enter') filterEvents();
    });

    // Toast logic
    const showToast = (message, type = 'success') => {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `<p>${message}</p>`;
        
        toastContainer.appendChild(toast);
        
        // Show the toast
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Hide and remove after delay
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    };

    // Booking Modal Logic
    const openBookingModal = (eventId) => {
        const { user } = checkAuthStatus();
        if (!user) {
            showToast("You must be logged in to book a ticket.", "error");
            setTimeout(() => window.location.href = 'login.html', 1500);
            return;
        }

        selectedEventForBooking = allEvents.find(e => e._id === eventId);
        if(!selectedEventForBooking) return;

        document.getElementById('modal-event-title').textContent = selectedEventForBooking.title;
        document.getElementById('modal-event-price').textContent = selectedEventForBooking.price;
        
        // Reset inputs
        seatCount.value = 1;
        seatCount.max = selectedEventForBooking.availableSeats;
        
        updateModalTotal(selectedEventForBooking);
    };

    const updateModalTotal = (event) => {
        // Interactive Seat Grid Simulator
        const seatGrid = document.getElementById('seat-map-grid');
        seatGrid.innerHTML = ''; // Clear previous
        seatCount.value = 0;
        document.getElementById('modal-total-price').textContent = '0';
        
        let selectedSeatsArr = [];
        
        // Simulating a 40-seat max block for UI clarity
        const renderCount = Math.min(event.totalSeats, 40);
        const bookedRatio = 1 - (event.availableSeats / event.totalSeats);
        const bookedSimulatorCount = Math.floor(renderCount * bookedRatio);

        for (let i = 0; i < renderCount; i++) {
            const seat = document.createElement('div');
            seat.className = 'seat-cube';
            
            // Randomly scatter booked seats identically
            if (i < bookedSimulatorCount && Math.random() > 0.3) {
                seat.classList.add('booked');
            } else if (bookedSimulatorCount > 0 && Math.random() > 0.8) {
                seat.classList.add('booked');
            }

            seat.addEventListener('click', () => {
                if (seat.classList.contains('booked')) return;
                
                if (seat.classList.contains('selected')) {
                    seat.classList.remove('selected');
                    selectedSeatsArr = selectedSeatsArr.filter(s => s !== i);
                } else {
                    if (selectedSeatsArr.length >= 5) {
                        showToast("Maximum of 5 seats per booking allowed", "error");
                        return;
                    }
                    seat.classList.add('selected');
                    selectedSeatsArr.push(i);
                }

                // Update counts
                seatCount.value = selectedSeatsArr.length;
                document.getElementById('modal-total-price').textContent = selectedSeatsArr.length * event.price;
            });
            seatGrid.appendChild(seat);
        }

        bookingModal.style.display = 'flex';
    };

    // Calculate dynamic totals from form (removed legacy input listener)
    
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            bookingModal.style.display = 'none';
        });
    }

    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            const count = parseInt(seatCount.value);
            if (!count || count <= 0) {
                showToast("Please select at least one available seat to proceed.", "error");
                return;
            }

            const total = count * selectedEventForBooking.price;
            
            // Format payment UI and Shift to Payment System
            bookingModal.style.display = 'none';
            paymentTotalAmount.textContent = total;
            paymentForm.reset();
            paymentModal.style.display = 'flex';
        });
    }

    if (closePaymentModal) {
        closePaymentModal.addEventListener('click', () => {
            paymentModal.style.display = 'none';
        });
    }

    if (paymentForm) {
        paymentForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Prevent standard form reload
            const count = parseInt(seatCount.value) || 1;
            
            processPaymentBtn.disabled = true;
            processPaymentBtn.innerHTML = 'Connecting to Bank <div class="spinner" style="display:inline-block; border-width: 2px; width: 14px; height: 14px; margin:0 0 -2px 5px; border-left-color:#fff;"></div>';

            try {
                // Mock heavy payment gateway delay
                await new Promise(resolve => setTimeout(resolve, 2000));

                const res = await bookingAPI.bookEvent(selectedEventForBooking._id, count);
                const data = await res.json();
                
                if (res.ok) {
                    showToast('Payment Successful! Ticket booked!', 'success');
                    paymentModal.style.display = 'none';
                    loadEvents(); // refresh availability
                } else {
                    showToast(data.message || 'Booking failed. Payment reversed.', 'error');
                }
            } catch (err) {
                showToast('Payment Gateway Timeout. Please try again.', 'error');
            } finally {
                processPaymentBtn.disabled = false;
                processPaymentBtn.innerHTML = 'Pay Securely';
            }
        });
    }

    // Initialize Page
    if(eventsContainer) {
        loadEvents();
    }
});
