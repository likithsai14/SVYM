document.addEventListener('DOMContentLoaded', async function() {

    const signupForm = document.getElementById('signupForm');
    const messageDiv = document.getElementById('message');
    const generatedUserIdDiv = document.getElementById('generatedUserId');

    const errorSpans={
        FieldMobiliserName: document.getElementById('FieldMobiliserNameError'),
        FieldMobiliserEmailID: document.getElementById('FieldMobiliserEmailIDError'),
        FieldMobiliserMobileNo: document.getElementById('FieldMobiliserMobileNoError'),
        FieldMobiliserRegion: document.getElementById('FieldMobiliserRegionError'),
        FieldMobiliserSupportedProject: document.getElementById('FieldMobiliserSupportedProjectError'),
    }
     
     // Helper to show error messages next to fields
    function showError(inputElement, message) {
        const errorSpanId = inputElement.id + 'Error';
        const errorSpan = errorSpans[inputElement.id];
        if (errorSpan) {
            errorSpan.textContent = message;
            inputElement.classList.add('input-error'); // Add a class for visual error styling
        }
    }

    // Helper to clear error messages
    function clearError(inputElement) {
        const errorSpanId = inputElement.id + 'Error';
        const errorSpan = errorSpans[inputElement.id];
        if (errorSpan) {
            errorSpan.textContent = '';
            inputElement.classList.remove('input-error');
        }
    }

    signupForm.querySelectorAll('input, select').forEach(input => {
        if (input.hasAttribute('required')) {
            input.addEventListener('input', function() {
                if (this.value.trim() !== '') {
                    clearError(this);
                }
            });
            input.addEventListener('blur', function() {
                if (this.value.trim() === '') {
                    showError(this, 'This field is required.');
                } else {
                    clearError(this);
                }
            });
        }
        // Specific pattern validation (e.g., Aadhar, Phone)
        if (input.hasAttribute('pattern')) {
            input.addEventListener('input', function() {
                if (!this.validity.valid) {
                    showError(this, this.title || 'Invalid format.');
                } else {
                    clearError(this);
                }
            });
            input.addEventListener('blur', function() {
                if (!this.validity.valid && this.value.trim() !== '') {
                    showError(this, this.title || 'Invalid format.');
                } else {
                    clearError(this);
                }
            });
        }
    });
    
    signupForm.addEventListener('submit', async function(event) {
        event.preventDefault(); // Prevent default form submission

        // Clear previous messages and errors
        messageDiv.style.display = 'none';
        generatedUserIdDiv.style.display = 'none';
        messageDiv.className = '';
        Object.values(errorSpans).forEach(span => {
            if (span) span.textContent = '';
        });
        signupForm.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));

        // Manual validation before submission
        let isValid = true;
        const formData = new FormData(signupForm);
        const data = {};
        for (let [key, value] of formData.entries()) {
            console.log(`Field: ${key}, Value: ${value}`);
            data[key] = value.trim();
        }

        // Re-validate all fields on submit
        signupForm.querySelectorAll('input, select').forEach(input => {
            if (input.hasAttribute('required') && input.value.trim() === '') {
                showError(input, 'This field is required.');
                isValid = false;
            } else if (input.hasAttribute('pattern') && input.value.trim() !== '' && !input.validity.valid) {
                showError(input, input.title || 'Invalid format.');
                isValid = false;
            } else {
                clearError(input);
            }
        });

        if (!isValid) {
            showMessage('error', 'Please correct the errors in the form.');
            return;
        }

        try {
            // CALLING NETLIFY FUNCTION DIRECTLY: Change from '/api/...'
            const response = await fetch('/.netlify/functions/fieldmobilisersignup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                showMessage('success', result.message || 'Sign up successful!');
                generatedUserIdDiv.innerHTML = `Your User ID: <strong>${result.userId}</strong><br>Please remember this ID for login.`;
                generatedUserIdDiv.style.display = 'block';
                signupForm.reset(); // Clear the form
                let v=document.getElementById('adminapprovalMessage');
                v.style.display = 'block';
                v.className = 'message success';
                v.textContent = 'Your request has been sent for admin approval. You will be notified once approved.'; 
            } else {
                showMessage('error', result.message || 'Sign up failed. Please try again.');
            }
        } catch (error) {
            console.error('Error during sign up:', error);
            showMessage('error', 'An unexpected error occurred. Please try again later.');
        }
    });





    function showMessage(type, text) {
        messageDiv.textContent = text;
        messageDiv.className = ''; // Clear existing classes
        messageDiv.classList.add('message', type);
        messageDiv.style.display = 'block';
    }


});