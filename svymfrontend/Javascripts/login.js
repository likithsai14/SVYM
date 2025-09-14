document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const userIdInput = document.getElementById('userId');
    const passwordInput = document.getElementById('password');
    const newPasswordGroup = document.getElementById('newPasswordGroup');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmNewPasswordGroup = document.getElementById('confirmNewPasswordGroup');
    const confirmNewPasswordInput = document.getElementById('confirmNewPassword');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const messageDiv = document.getElementById('message');

    let isForgotPasswordFlow = false;

    // If already logged in as admin, redirect
    if (sessionStorage.getItem('role') === 'admin') {
        window.location.href = 'admin_dashboard.html';
    }

    // Initial setup
    passwordInput.setAttribute('required', 'required');
    newPasswordInput.removeAttribute('required');
    confirmNewPasswordInput.removeAttribute('required');

    // Forgot password flow
    forgotPasswordLink.addEventListener('click', function(event) {
        event.preventDefault();
        isForgotPasswordFlow = true;
        passwordInput.style.display = 'none';
        newPasswordGroup.style.display = 'block';
        confirmNewPasswordGroup.style.display = 'block';

        newPasswordInput.setAttribute('required', 'required');
        confirmNewPasswordInput.setAttribute('required', 'required');
        passwordInput.removeAttribute('required');

        messageDiv.innerHTML = '';
        showMessage('info', 'Please enter your User ID and set your new 5-digit PIN.');
        loginForm.reset();
        userIdInput.focus();
    });

    // Login submit
    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const userId = userIdInput.value.trim().toUpperCase();
        const currentPassword = passwordInput.value.trim();
        const newPassword = newPasswordInput.value.trim();
        const confirmNewPassword = confirmNewPasswordInput.value.trim();

        // Validate userId format (SVYMXXXXX)
        if (!userId.startsWith('SVYM') || !/^\d{5}$/.test(userId.substring(4))) {
            showMessage('error', 'Invalid User ID format. It should be SVYM followed by 5 digits (e.g., SVYM12345).');
            return;
        }

        try {
            let functionName;
            let requestBody;

            if (isForgotPasswordFlow || (newPasswordGroup.style.display === 'block' && newPasswordInput.value !== '')) {
                // Forgot password or first login PIN update
                functionName = 'update-pin';
                requestBody = { userId, newPin: newPassword };

                if (!newPassword || !confirmNewPassword) {
                    showMessage('error', 'Please enter and confirm your new 5-digit PIN.');
                    return;
                }
                if (newPassword.length !== 5 || !/^\d{5}$/.test(newPassword)) {
                    showMessage('error', 'New PIN must be a 5-digit number.');
                    return;
                }
                if (newPassword !== confirmNewPassword) {
                    showMessage('error', 'New PIN and confirmation do not match.');
                    return;
                }

            } else {
                // Normal login
                functionName = 'login';
                requestBody = { userId, password: currentPassword };
            }

            const response = await fetch(`/.netlify/functions/${functionName}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();

            if (response.ok) {
                if (data.isFirstLoginPrompt) {
                    // First login, prompt for new PIN
                    passwordInput.style.display = 'none';
                    newPasswordGroup.style.display = 'block';
                    confirmNewPasswordGroup.style.display = 'block';
                    newPasswordInput.setAttribute('required', 'required');
                    confirmNewPasswordInput.setAttribute('required', 'required');
                    showMessage('info', 'This is your first login. Please set a new 5-digit PIN.');
                } else {
                    // ✅ Save session info
                    sessionStorage.setItem('userId', data.user.userId);
                    sessionStorage.setItem('role', data.user.role);

                    // ✅ Redirect based on role
                    if (data.user.role === 'admin') {
                        showMessage('success', data.message || 'Admin login successful!');
                        window.location.href = 'admin_dashboard.html';
                    } else {
                        showMessage('success', data.message || 'Login successful!');
                        window.location.href = 'candidate_dashboard.html';
                    }

                    // Reset form and UI
                    loginForm.reset();
                    passwordInput.style.display = 'block';
                    newPasswordGroup.style.display = 'none';
                    confirmNewPasswordGroup.style.display = 'none';
                    passwordInput.setAttribute('required', 'required');
                    newPasswordInput.removeAttribute('required');
                    confirmNewPasswordInput.removeAttribute('required');
                    isForgotPasswordFlow = false;
                }
            } else {
                showMessage('error', data.message || 'An error occurred.');
            }

        } catch (error) {
            console.error('Fetch error:', error);
            showMessage('error', `An unexpected network error occurred: ${error.message}. Please try again.`);
        }
    });

    function showMessage(type, text) {
        messageDiv.textContent = text;
        messageDiv.className = '';
        messageDiv.classList.add('message', type);
        messageDiv.style.display = 'block';
    }
});
