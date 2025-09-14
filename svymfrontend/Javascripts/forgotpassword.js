document.addEventListener('DOMContentLoaded', () => {
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const securityQuestionsSection = document.getElementById('securityQuestionsSection');
    const securityAnswerForm = document.getElementById('securityAnswerForm');
    const resetPasswordSection = document.getElementById('resetPasswordSection');
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    const q1Label = document.getElementById('q1Label');
    const q2Label = document.getElementById('q2Label');

    // Retrieve dummy user data from localStorage for demonstration
    // IMPORTANT: This is for DEMONSTRATION ONLY. Real applications use a secure backend.
    const dummyUsers = JSON.parse(localStorage.getItem('tech4hopeUsers')) || {};

    let currentUserForRecovery = null; // To store the user whose password is being recovered

    // --- Forgot Password (Email Input) Form Submission ---
    forgotPasswordForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const recoveryEmail = document.getElementById('recoveryEmail').value;

        if (dummyUsers[recoveryEmail]) {
            currentUserForRecovery = dummyUsers[recoveryEmail];
            const userQuestions = currentUserForRecovery.securityQuestions;
            const questionTexts = currentUserForRecovery.questionText;

            // Get the keys of the security questions to dynamically set labels
            const q1Key = Object.keys(userQuestions)[0];
            const q2Key = Object.keys(userQuestions)[1];

            q1Label.textContent = questionTexts[q1Key];
            q2Label.textContent = questionTexts[q2Key];

            forgotPasswordForm.style.display = 'none'; // Hide email input form
            securityQuestionsSection.style.display = 'block'; // Show security questions section
        } else {
            alert('Email ID not found. Please check your email or sign up with Tech4Hope.');
        }
    });

    // --- Security Answer Form Submission ---
    securityAnswerForm.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!currentUserForRecovery) {
            alert('An error occurred. Please restart the password recovery process.');
            return;
        }

        const answer1 = document.getElementById('recoveryAnswer1').value;
        const answer2 = document.getElementById('recoveryAnswer2').value;

        const userQuestions = currentUserForRecovery.securityQuestions;
        const q1Key = Object.keys(userQuestions)[0];
        const q2Key = Object.keys(userQuestions)[1];

        // Dummy client-side verification of answers (real app needs backend)
        if (userQuestions[q1Key] === answer1 && userQuestions[q2Key] === answer2) {
            alert('Security questions answered correctly! You can now reset your password.');
            securityQuestionsSection.style.display = 'none'; // Hide security question form
            resetPasswordSection.style.display = 'block'; // Show reset password section
        } else {
            alert('Incorrect answers to security questions. Please try again.');
            document.getElementById('recoveryAnswer1').value = ''; // Clear answers
            document.getElementById('recoveryAnswer2').value = '';
        }
    });


    // --- Reset Password Form Submission ---
    resetPasswordForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPassword = document.getElementById('confirmNewPassword').value;
        const recoveryEmail = document.getElementById('recoveryEmail').value; // Get the email used for recovery

        if (newPassword !== confirmNewPassword) {
            alert('New password and confirm password do not match.');
            return;
        }

        if (newPassword.length < 6) {
            alert('Password must be at least 6 characters long.');
            return;
        }

        // Dummy client-side password update for demonstration:
        if (dummyUsers[recoveryEmail]) {
            dummyUsers[recoveryEmail].password = newPassword; // Update dummy password
            localStorage.setItem('tech4hopeUsers', JSON.stringify(dummyUsers));
            alert('Password reset successful! (Dummy update for Tech4Hope). Please log in with your new password.');
            window.location.href = 'login.html'; // Redirect to login page
        } else {
            alert('Error: User not found for password reset.');
        }
    });
});