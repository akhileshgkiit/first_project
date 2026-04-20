document.addEventListener('DOMContentLoaded', () => {
    const { user, token } = checkAuthStatus();
    if (!user || !token) {
        window.location.href = 'login.html';
        return;
    }

    // Header and Navigation Config
    document.getElementById('welcome-text').textContent = `Welcome, ${user.name}!`;
    document.getElementById('role-badge').textContent = user.isAdmin ? 'Administrator' : 'Standard User';

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'index.html';
        });
    }

    // Section Toggle based on Admin status
    if (user.isAdmin) {
        document.getElementById('admin-view').style.display = 'block';
        loadAdminEvents();
    } else {
        document.getElementById('user-view').style.display = 'block';
        loadUserBookings();
    }

    // --- USER BOOKINGS LOAD ---
    async function loadUserBookings() {
        const tbody = document.getElementById('bookings-table-body');
        try {
            const bookings = await bookingAPI.getMyBookings();
            
            if (bookings.length === 0) {
                document.getElementById('no-bookings-msg').style.display = 'block';
                return;
            }

            bookings.forEach((booking, index) => {
                const row = document.createElement('tr');
                
                // If the event was deleted (e.g., from DB re-seeding), skip or show "Event Deleted"
                const eventTitle = booking.event ? booking.event.title : "Event Time Elapsed / Deleted";
                const eventDate = booking.event ? new Date(booking.event.date).toLocaleDateString('en-US') : "N/A";

                row.innerHTML = `
                    <td>...${booking._id.substring(18)}</td>
                    <td><strong>${eventTitle}</strong></td>
                    <td>${eventDate}</td>
                    <td>${booking.seatsBooked}</td>
                    <td>₹${booking.totalPrice}</td>
                    <td><button class="btn-primary view-ticket-btn" style="padding:5px 15px; font-size:0.85em;" data-idx="${index}">View Ticket</button></td>
                `;
                tbody.appendChild(row);
            });

            // Bind View Ticket Actions
            document.querySelectorAll('.view-ticket-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const idx = e.target.getAttribute('data-idx');
                    openTicketModal(bookings[idx]);
                });
            });

        } catch (err) {
            console.error("Dashboard Load Error:", err);
            tbody.innerHTML = '<tr><td colspan="6" class="error">Failed to load bookings. Try booking a new ticket!</td></tr>';
        }
    }

    let categoryChartInstance = null;
    let revenueChartInstance = null;

    // --- ADMIN PANEL FUNCTIONS ---
    async function loadAdminEvents() {
        const tbody = document.getElementById('admin-events-table-body');
        try {
            tbody.innerHTML = '<tr><td colspan="6">Loading events...</td></tr>';
            const events = await eventAPI.getAll();

            tbody.innerHTML = '';
            if (events.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6">No events currently listed.</td></tr>';
                return;
            }

            let categoryCount = {};
            let topRevenues = [];

            events.forEach(event => {
                // Compile metrics
                if (!categoryCount[event.category]) categoryCount[event.category] = 0;
                categoryCount[event.category]++;

                const sales = (event.totalSeats - event.availableSeats) * event.price;
                topRevenues.push({ title: event.title.substring(0, 15)+'...', revenue: sales });

                const row = document.createElement('tr');
                const eventDate = new Date(event.date).toLocaleDateString('en-US');

                row.innerHTML = `
                    <td>${event.title}</td>
                    <td>${event.category}</td>
                    <td>${eventDate}</td>
                    <td>${event.availableSeats} / ${event.totalSeats}</td>
                    <td>₹${event.price}</td>
                    <td>
                        <button class="btn-primary edit-event-btn" data-id="${event._id}" style="padding:5px 10px; font-size:0.8rem; margin-right:5px">Edit</button>
                        <button class="btn-primary del-event-btn" data-id="${event._id}" style="padding:5px 10px; font-size:0.8rem; background:#ef4444">Delete</button>
                    </td>
                `;
                tbody.appendChild(row);
            });

            // Initialize Charts
            renderCharts(categoryCount, topRevenues);

            // Bind admin actions
            document.querySelectorAll('.del-event-btn').forEach(btn => {
                btn.addEventListener('click', deleteEvent);
            });
            document.querySelectorAll('.edit-event-btn').forEach(btn => {
                btn.addEventListener('click', openEditModal);
            });
            
        } catch (err) {
            tbody.innerHTML = '<tr><td colspan="6" class="error">Failed to load events.</td></tr>';
        }
    }

    function renderCharts(categories, revenues) {
        if (categoryChartInstance) categoryChartInstance.destroy();
        if (revenueChartInstance) revenueChartInstance.destroy();
        
        // Sort revenues and take top 5
        revenues.sort((a,b) => b.revenue - a.revenue);
        const top5 = revenues.slice(0, 5);

        // Chart defaults
        Chart.defaults.color = getComputedStyle(document.body).getPropertyValue('--text-primary');

        const ctx1 = document.getElementById('categoryChart').getContext('2d');
        categoryChartInstance = new Chart(ctx1, {
            type: 'doughnut',
            data: {
                labels: Object.keys(categories),
                datasets: [{
                    data: Object.values(categories),
                    backgroundColor: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'],
                    borderWidth: 0
                }]
            },
            options: { plugins: { title: { display: true, text: 'Event Dist. by Category' } } }
        });

        const ctx2 = document.getElementById('revenueChart').getContext('2d');
        revenueChartInstance = new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: top5.map(v => v.title),
                datasets: [{
                    label: 'Revenue (₹)',
                    data: top5.map(v => v.revenue),
                    backgroundColor: '#10b981',
                    borderRadius: 4
                }]
            },
            options: { plugins: { title: { display: true, text: 'Top 5 Highest Revenue Events' } } }
        });
    }

    // Modal elements
    const eventModal = document.getElementById('event-modal');
    const closeEventModal = document.getElementById('close-event-modal');
    const eventForm = document.getElementById('event-form');
    let isEditMode = false;

    if(closeEventModal) {
        closeEventModal.addEventListener('click', () => {
            eventModal.style.display = 'none';
        });
    }

    document.getElementById('add-event-btn')?.addEventListener('click', () => {
        isEditMode = false;
        document.getElementById('event-modal-title').textContent = 'Add New Event';
        eventForm.reset();
        document.getElementById('event-id').value = '';
        eventModal.style.display = 'flex';
    });

    // Form Submission for Event Creation/Edit
    eventForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const eventId = document.getElementById('event-id').value;
        const newEvent = {
            title: document.getElementById('event-title').value,
            description: document.getElementById('event-desc').value,
            date: document.getElementById('event-date').value,
            category: document.getElementById('event-category').value,
            price: document.getElementById('event-price').value,
            totalSeats: document.getElementById('event-seats').value
        };

        try {
            let res;
            if (isEditMode) {
                res = await eventAPI.update(eventId, newEvent);
            } else {
                res = await eventAPI.create(newEvent);
            }

            if (res.ok) {
                alert(`Event successfully ${isEditMode ? 'updated' : 'added'}!`);
                eventModal.style.display = 'none';
                loadAdminEvents(); // Refresh tabel
            } else {
                const err = await res.json();
                alert(err.message || 'Action failed!');
            }
        } catch (err) {
            alert('Server error.');
        }
    });

    async function deleteEvent(e) {
        if(!confirm("Are you sure you want to delete this event?")) return;
        
        const eventId = e.target.getAttribute('data-id');
        try {
            const res = await eventAPI.delete(eventId);
            if(res.ok) {
                loadAdminEvents();
            } else {
                alert("Failed to delete event.");
            }
        } catch (err) {
            alert("Error deleting event.");
        }
    }

    async function openEditModal(e) {
        const eventId = e.target.getAttribute('data-id');
        isEditMode = true;
        document.getElementById('event-modal-title').textContent = 'Edit Event';
        
        // Fetch event specifics to populate form
        try {
            const events = await eventAPI.getAll(); // we can reuse loaded but this works
            const event = events.find(ev => ev._id === eventId);
            if(!event) return;

            document.getElementById('event-id').value = event._id;
            document.getElementById('event-title').value = event.title;
            document.getElementById('event-desc').value = event.description;
            
            // Setting datetime-local requires special formatting yyyy-MM-ddThh:mm
            const dateObj = new Date(event.date);
            const tzOffset = dateObj.getTimezoneOffset() * 60000; 
            const localISOTime = (new Date(dateObj - tzOffset)).toISOString().slice(0,16);

            document.getElementById('event-date').value = localISOTime;
            document.getElementById('event-category').value = event.category;
            document.getElementById('event-price').value = event.price;
            document.getElementById('event-seats').value = event.totalSeats;

            eventModal.style.display = 'flex';
        } catch (err) {
            alert("Cannot fetch event details");
        }
    }

    // --- TICKET MODAL LOGIC ---
    const ticketModal = document.getElementById('ticket-modal');
    const closeTicketModal = document.getElementById('close-ticket-modal');
    const downloadTicketBtn = document.getElementById('download-ticket-btn');

    function openTicketModal(bookingData) {
        if (!bookingData.event) {
            alert("This event has been removed from our database, ticket is no longer valid for viewing.");
            return;
        }

        document.getElementById('tckt-event-title').textContent = bookingData.event.title;
        document.getElementById('tckt-date').textContent = new Date(bookingData.event.date).toLocaleDateString('en-US');
        document.getElementById('tckt-owner').textContent = user.name;
        document.getElementById('tckt-seats').textContent = bookingData.seatsBooked;
        document.getElementById('tckt-price').textContent = "₹" + bookingData.totalPrice;

        // Custom QR text mapping to full textual ticket details instead of just ID
        const qrContent = `⭐ EVENTIFY VIP TICKET ⭐
------------------------
Event: ${bookingData.event.title}
Date: ${new Date(bookingData.event.date).toLocaleDateString('en-US')}
Name: ${user.name}
Seats: ${bookingData.seatsBooked}
Amount Paid: ₹${bookingData.totalPrice}
------------------------
Valid for Entry`;
        
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrContent)}`;
        document.querySelector('#ticket-modal img').src = qrUrl;

        ticketModal.style.display = 'flex';
    }

    if(closeTicketModal) {
        closeTicketModal.addEventListener('click', () => {
            ticketModal.style.display = 'none';
        });
    }

    if(downloadTicketBtn) {
        downloadTicketBtn.addEventListener('click', () => {
            const element = document.getElementById('print-ticket-area');
            const originalBg = element.style.background;
            
            // Set standard background temporarily for clean PDF print ignoring dark theme
            element.style.background = '#ffffff';

            html2pdf().set({
                margin: 0,
                filename: 'Eventify_VIP_Ticket.pdf',
                image: { type: 'jpeg', quality: 1.0 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
            }).from(element).save().then(() => {
                element.style.background = originalBg;
            });
        });
    }

});
