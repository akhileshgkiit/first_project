document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const errorMsg = document.getElementById('error-message');

    // Handle Login
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorMsg.textContent = '';
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const data = await authAPI.login(email, password);
                
                if (data.token) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    window.location.href = 'dashboard.html';
                } else {
                    errorMsg.textContent = data.message || 'Login failed';
                }
            } catch (err) {
                errorMsg.textContent = 'Looks like the server is down. Ensure you are running it locally.';
            }
        });
    }

    // Handle Registration
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorMsg.textContent = '';
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const data = await authAPI.register(name, email, password);
                
                if (data.token) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    window.location.href = 'dashboard.html';
                } else {
                    errorMsg.textContent = data.message || 'Registration failed';
                }
            } catch (err) {
                errorMsg.textContent = 'An error occurred during registration.';
            }
        });
    }
    // Handle Admin Registration
    const adminRegisterForm = document.getElementById('admin-register-form');
    if (adminRegisterForm) {
        adminRegisterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorMsg.textContent = '';
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const password = document.getElementById('password').value;

            try {
                // We send isAdmin: true explicitly for the admin portal
                const res = await fetch('http://localhost:5000/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, phone, password, isAdmin: true })
                });
                const data = await res.json();
                
                if (data.token) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    window.location.href = 'dashboard.html';
                } else {
                    errorMsg.textContent = data.message || 'Registration failed';
                }
            } catch (err) {
                errorMsg.textContent = 'An error occurred during admin registration.';
            }
        });
    }
});
