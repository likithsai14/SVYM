document.addEventListener("DOMContentLoaded", async () => {
  // Get trainer ID from sessionStorage
  const sessionUserId = sessionStorage.getItem('userId');
  if (!sessionUserId) {
    console.warn('No session userId found in sessionStorage');
    return;
  }

  // Helper to set text into spans
  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value ?? '—';
  };

  // Fetch trainer profile from backend
  async function loadProfile() {
    try {
      const res = await fetch(`/.netlify/functions/allTrainers?trainerId=${encodeURIComponent(sessionUserId)}`);
      if (!res.ok) {
        console.error('Failed to fetch trainer profile', await res.text());
        return;
      }
      const payload = await res.json();
      const trainers = payload.trainers || [];
      const trainer = trainers.find(t => t.trainerId === sessionUserId);

      if (!trainer) {
        console.error('Trainer not found');
        return;
      }

      console.log('Loaded trainer profile:', trainer);

      // Populate profile details
      setText('trainerId', trainer.trainerId);
      setText('trainerName', trainer.name);
      setText('trainerEmail', trainer.email || 'Not provided');
      setText('trainerPhone', trainer.mobile || 'Not provided');
      setText('trainerExpertise', trainer.expertise);
      setText('trainerJoined', trainer.createdAt ? new Date(trainer.createdAt).toLocaleDateString() : '—');
      setText('trainerStatus', trainer.status);

      // Store for edit modal
      window.__currentTrainerProfile = trainer;
    } catch (err) {
      console.error('Error loading trainer profile:', err);
    }
  }

  // Modal event listeners
  const editModal = document.getElementById('editProfileModal');
  const editCloseBtn = document.getElementById('closeEditModal');
  editCloseBtn.addEventListener('click', () => editModal.style.display = 'none');
  window.addEventListener('click', e => { if (e.target === editModal) editModal.style.display = 'none'; });

  const changeModal = document.getElementById('changePasswordModal');
  const changeCloseBtn = document.getElementById('closeChangeModal');
  changeCloseBtn.addEventListener('click', () => changeModal.style.display = 'none');
  window.addEventListener('click', e => { if (e.target === changeModal) changeModal.style.display = 'none'; });

  // Open edit profile modal
  document.getElementById('editProfileBtn').addEventListener('click', () => {
    const trainer = window.__currentTrainerProfile || {};
    document.getElementById('edit_trainerName').value = trainer.name || '';
    document.getElementById('edit_expertise').value = trainer.expertise || '';
    document.getElementById('edit_email').value = trainer.email || '';
    document.getElementById('edit_mobile').value = trainer.mobile || '';
    editModal.style.display = 'flex';
  });

  // Function to convert to title case
  function toTitleCase(str) {
    return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  }

  // Error message spans
  const errorSpans = {
    edit_trainerName: document.getElementById('edit_trainerNameError'),
    edit_expertise: document.getElementById('edit_expertiseError'),
    edit_email: document.getElementById('edit_emailError'),
    edit_mobile: document.getElementById('edit_mobileError')
  };

  function showError(inputElement, message) {
    const errorSpan = errorSpans[inputElement.id];
    if (errorSpan) {
      errorSpan.textContent = message;
      inputElement.classList.add('input-error');
    }
  }

  function clearError(inputElement) {
    const errorSpan = errorSpans[inputElement.id];
    if (errorSpan) {
      errorSpan.textContent = '';
      inputElement.classList.remove('input-error');
    }
  }

  // Title case for name
  document.getElementById('edit_trainerName').addEventListener('input', function() {
    this.value = toTitleCase(this.value);
  });

  // Live validation
  const editForm = document.getElementById('editProfileForm');
  editForm.querySelectorAll('input').forEach(input => {
    if (input.hasAttribute('required')) {
      input.addEventListener('input', () => { if (input.value.trim() !== '') clearError(input); });
      input.addEventListener('blur', () => { if (input.value.trim() === '') showError(input, 'This field is required.'); else clearError(input); });
    }
    if (input.hasAttribute('pattern') || input.type === 'email') {
      input.addEventListener('input', () => { if (!input.validity.valid) showError(input, input.title || 'Invalid format.'); else clearError(input); });
      input.addEventListener('blur', () => { if (!input.validity.valid && input.value.trim() !== '') showError(input, input.title || 'Invalid format.'); else clearError(input); });
    }
    // Specific validation for name field (only alphabets and spaces)
    if (input.id === 'edit_trainerName') {
      input.addEventListener('input', () => { if (input.value.trim() !== '' && /[^a-zA-Z\s]/.test(input.value)) showError(input, 'Only alphabets and spaces allowed.'); else clearError(input); });
      input.addEventListener('blur', () => { if (input.value.trim() !== '' && /[^a-zA-Z\s]/.test(input.value)) showError(input, 'Only alphabets and spaces allowed.'); else clearError(input); });
    }
    // Specific validation for mobile (only digits, 10 digits)
    if (input.id === 'edit_mobile') {
      input.addEventListener('input', () => { if (input.value.trim() !== '' && !/^\d{10}$/.test(input.value)) showError(input, 'Mobile number must be exactly 10 digits.'); else clearError(input); });
      input.addEventListener('blur', () => { if (input.value.trim() !== '' && !/^\d{10}$/.test(input.value)) showError(input, 'Mobile number must be exactly 10 digits.'); else clearError(input); });
    }
  });

  // Edit profile form submit
  editForm.addEventListener('submit', async (ev) => {
    ev.preventDefault();

    // Clear previous errors
    Object.values(errorSpans).forEach(span => { if (span) span.textContent = ''; });
    editForm.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));

    let isValid = true;

    // Revalidate required fields
    editForm.querySelectorAll('input[required]').forEach(input => {
      if (input.value.trim() === '') {
        showError(input, 'This field is required.');
        isValid = false;
      } else {
        clearError(input);
      }
    });

    // Validate patterns
    editForm.querySelectorAll('input[pattern], input[type="email"]').forEach(input => {
      if (input.value.trim() !== '' && !input.validity.valid) {
        showError(input, input.title || 'Invalid format.');
        isValid = false;
      }
    });

    // Special validations
    const name = document.getElementById('edit_trainerName').value.trim();
    const email = document.getElementById('edit_email').value.trim();
    const mobile = document.getElementById('edit_mobile').value.trim();

    if (!email && !mobile) {
      showError(document.getElementById('edit_email'), 'Please provide at least one contact method (email or mobile).');
      isValid = false;
    }

    if (!isValid) {
      const msgDiv = document.getElementById('editProfileMessage');
      msgDiv.style.display = 'block';
      msgDiv.className = 'message error';
      msgDiv.textContent = 'Please correct the errors in the form.';
      return;
    }

    const trainerId = sessionUserId;
    if (!trainerId) return alert('Trainer ID missing');

    const payload = {
      trainerId: trainerId,
      name: name,
      expertise: document.getElementById('edit_expertise').value.trim(),
      email: email,
      mobile: mobile
    };

    try {
      const res = await fetch('/.netlify/functions/editTrainer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const j = await res.json();
      const msgDiv = document.getElementById('editProfileMessage');
      msgDiv.style.display = 'block';
      msgDiv.className = res.ok ? 'message success' : 'message error';
      msgDiv.textContent = j.message || (res.ok ? 'Profile updated successfully!' : 'Failed to update profile');
      if (res.ok) {
        alert('Profile updated successfully!');
        editModal.style.display = 'none';
        await loadProfile();
      }
    } catch (err) {
      console.error('Error updating profile', err);
      alert('Failed to update profile');
    }
  });

  // Open change password modal
  document.getElementById('changePasswordBtn').addEventListener('click', () => {
    changeModal.style.display = 'flex';
  });

  // Change password form submit
  document.getElementById('changePasswordForm').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirm = document.getElementById('confirmNewPassword').value;

    if (newPassword !== confirm) {
      const msgDiv = document.getElementById('changePasswordMessage');
      msgDiv.style.display = 'block';
      msgDiv.className = 'message error';
      msgDiv.textContent = 'New passwords do not match';
      return;
    }

    if (!/^[0-9]{5}$/.test(newPassword)) {
      const msgDiv = document.getElementById('changePasswordMessage');
      msgDiv.style.display = 'block';
      msgDiv.className = 'message error';
      msgDiv.textContent = 'New password must be exactly 5 digits';
      return;
    }

    const trainerId = sessionUserId;
    if (!trainerId) return alert('Trainer ID missing');

    try {
      const res = await fetch('/.netlify/functions/changeTrainerPassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: trainerId, currentPassword, newPassword })
      });
      const j = await res.json();
      const msgDiv = document.getElementById('changePasswordMessage');
      msgDiv.style.display = 'block';
      msgDiv.className = res.ok ? 'message success' : 'message error';
      msgDiv.textContent = j.message || (res.ok ? 'Password changed successfully!' : 'Failed to change password');
      if (res.ok) {
        alert('Password changed successfully!');
        changeModal.style.display = 'none';
      }
    } catch (err) {
      console.error('Error changing password', err);
      alert('Failed to change password');
    }
  });

  // Load profile on page load
  await loadProfile();
});
