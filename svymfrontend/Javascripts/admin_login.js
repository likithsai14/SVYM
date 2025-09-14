document.addEventListener('DOMContentLoaded', function() {
    const adminLoginForm = document.getElementById('adminLoginForm');
    const adminUsernameInput = document.getElementById('adminUsername');
    const adminPasswordInput = document.getElementById('adminPassword');
    const messageDiv = document.getElementById('message');

    adminLoginForm.addEventListener('submit', async function(event) {
        event.preventDefault(); // Prevent default form submission

        const username = adminUsernameInput.value.trim();
        const password = adminPasswordInput.value.trim();

        // Clear previous messages
        messageDiv.style.display = 'none';
        messageDiv.className = '';

        if (!username || !password) {
            showMessage('error', 'Please enter both username and password.');
            return;
        }

        try {
            // CALLING NETLIFY FUNCTION DIRECTLY: Change from '/api/...'
            const response = await fetch('/.netlify/functions/admin-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const result = await response.json();

            if (response.ok) {
                showMessage('success', result.message || 'Admin login successful!');
                // Store admin session information (e.g., in sessionStorage)
                sessionStorage.setItem('isAdminLoggedIn', 'true');
                sessionStorage.setItem('adminUsername', username);
                // Redirect to admin dashboard
                window.location.href = 'admin_dashboard.html';
            } else {
                // Handle errors from the Netlify function
                showMessage('error', result.message || 'Login failed. Invalid credentials.');
            }
        } catch (error) {
            console.error('Error during admin login:', error);
            showMessage('error', 'An unexpected network error occurred. Please try again later.');
        }
    });

    function showMessage(type, text) {
        messageDiv.textContent = text;
        messageDiv.className = ''; // Clear existing classes
        messageDiv.classList.add('message', type);
        messageDiv.style.display = 'block';
    }
});