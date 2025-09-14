document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const userIdInput = document.getElementById('userId');
    const passwordInput = document.getElementById('password');
    const newPasswordGroup = document.getElementById('newPasswordGroup');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmNewPasswordGroup = document.getElementById('confirmNewPasswordGroup');
    const confirmNewPasswordInput = document.getElementById('confirmNewPassword');
    const messageDiv = document.getElementById('message');

    let isFirstLoginFlow = false;

    // Redirect if already logged in
    if (sessionStorage.getItem('role') === 'admin') {
        window.location.href = 'admin_dashboard.html';
    } else if (sessionStorage.getItem('role') === 'user') {
        window.location.href = 'candidate_dashboard.html';
    }

    // Initial setup
    passwordInput.setAttribute('required', 'required');
    newPasswordInput.removeAttribute('required');
    confirmNewPasswordInput.removeAttribute('required');

    // Login submit
    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const userId = userIdInput.value.trim().toUpperCase();
        const password = passwordInput.value.trim();
        const newPassword = newPasswordInput.value.trim();
        const confirmNewPassword = confirmNewPasswordInput.value.trim();

        // Validate User ID format
        if (!userId.startsWith('SVYM') || !/^\d{5}$/.test(userId.substring(4))) {
            showMessage('error', 'Invalid User ID format. It should be SVYM followed by 5 digits.');
            return;
        }

        try {
            let endpoint = 'login';
            let body = { userId, password };

            // If in first-login PIN flow, switch to update-pin
            if (isFirstLoginFlow) {
                if (!newPassword || !confirmNewPassword) {
                    showMessage('error', 'Please enter and confirm your new 5-digit PIN.');
                    return;
                }
                if (!/^\d{5}$/.test(newPassword)) {
                    showMessage('error', 'New PIN must be a 5-digit number.');
                    return;
                }
                if (newPassword !== confirmNewPassword) {
                    showMessage('error', 'New PIN and confirmation do not match.');
                    return;
                }

                endpoint = 'update-pin';
                body = { userId, oldPin: password, newPin: newPassword };
            }

            const response = await fetch(`/.netlify/functions/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (response.ok) {
                if (!isFirstLoginFlow && data.isFirstLoginPrompt) {
                    // Trigger first-login flow
                    isFirstLoginFlow = true;
                    passwordInput.style.display = 'none';
                    newPasswordGroup.style.display = 'block';
                    confirmNewPasswordGroup.style.display = 'block';
                    newPasswordInput.setAttribute('required', 'required');
                    confirmNewPasswordInput.setAttribute('required', 'required');
                    showMessage('info', 'This is your first login. Please set a new 5-digit PIN.');
                } else {
                    // Save session info
                    sessionStorage.setItem('userId', data.user.userId);
                    sessionStorage.setItem('role', data.user.role);

                    // Redirect based on role
                    if (data.user.role === 'admin') {
                        showMessage('success', data.message || 'Admin login successful!');
                        window.location.href = 'admin_dashboard.html';
                    } else {
                        showMessage('success', data.message || 'Login successful!');
                        window.location.href = 'candidate_dashboard.html';
                    }
                }
            } else {
                showMessage('error', data.message || 'An error occurred.');
            }

        } catch (err) {
            console.error('Fetch error:', err);
            showMessage('error', `Network error: ${err.message}`);
        }
    });

    function showMessage(type, text) {
        messageDiv.textContent = text;
        messageDiv.className = '';
        messageDiv.classList.add('message', type);
        messageDiv.style.display = 'block';
    }
});
