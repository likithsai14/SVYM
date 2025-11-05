document.addEventListener("DOMContentLoaded", async () => {
  // Get field mobiliser ID from sessionStorage
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

  // Fetch field mobiliser profile from backend
  async function loadProfile() {
    try {
      const res = await fetch(`/.netlify/functions/allfieldmobilisers?userId=${encodeURIComponent(sessionUserId)}`);
      if (!res.ok) {
        console.error('Failed to fetch field mobiliser profile', await res.text());
        return;
      }
      const payload = await res.json();
      const fm = payload.fieldMobiliser;

      if (!fm) {
        console.error('Field Mobiliser not found');
        return;
      }

      console.log('Loaded field mobiliser profile:', fm);

      // Populate profile details
      setText('fieldMobiliserId', fm.userId);
      setText('fieldMobiliserName', fm.FieldMobiliserName);
      setText('fieldMobiliserEmail', fm.FieldMobiliserEmailID || 'Not provided');
      setText('fieldMobiliserMobile', fm.FieldMobiliserMobileNo || 'Not provided');
      setText('fieldMobiliserRegion', fm.FieldMobiliserRegion);
      setText('fieldMobiliserProject', fm.FieldMobiliserSupportedProject);
      setText('fieldMobiliserJoined', fm.createdAt ? new Date(fm.createdAt).toLocaleDateString() : '—');
      setText('fieldMobiliserStatus', fm.accountStatus);

      // Store for edit modal
      window.__currentFieldMobiliserProfile = fm;
    } catch (err) {
      console.error('Error loading field mobiliser profile:', err);
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
    const fm = window.__currentFieldMobiliserProfile || {};
    document.getElementById('edit_fieldMobiliserName').value = fm.FieldMobiliserName || '';
    document.getElementById('edit_fieldMobiliserEmail').value = fm.FieldMobiliserEmailID || '';
    document.getElementById('edit_fieldMobiliserMobile').value = fm.FieldMobiliserMobileNo || '';
    document.getElementById('edit_fieldMobiliserRegion').value = fm.FieldMobiliserRegion || '';
    document.getElementById('edit_fieldMobiliserProject').value = fm.FieldMobiliserSupportedProject || '';
    editModal.style.display = 'flex';
  });

  // Function to convert to title case
  function toTitleCase(str) {
    return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  }

  // Error message spans
  const errorSpans = {
    edit_fieldMobiliserName: document.getElementById('edit_fieldMobiliserNameError'),
    edit_fieldMobiliserEmail: document.getElementById('edit_fieldMobiliserEmailError'),
    edit_fieldMobiliserMobile: document.getElementById('edit_fieldMobiliserMobileError'),
    edit_fieldMobiliserRegion: document.getElementById('edit_fieldMobiliserRegionError'),
    edit_fieldMobiliserProject: document.getElementById('edit_fieldMobiliserProjectError')
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

  // Title case and input restriction for name
  document.getElementById('edit_fieldMobiliserName').addEventListener('input', function() {
    this.value = this.value.replace(/[^a-zA-Z\s]/g, ''); // restrict to alphabets and spaces
    this.value = toTitleCase(this.value);
  });

  // Title case and input restriction for region (only alphabets and spaces)
  document.getElementById('edit_fieldMobiliserRegion').addEventListener('input', function() {
    this.value = this.value.replace(/[^a-zA-Z\s]/g, ''); // restrict to alphabets and spaces
    this.value = toTitleCase(this.value);
  });

  // Title case and input restriction for supported project (only alphabets and spaces)
  document.getElementById('edit_fieldMobiliserProject').addEventListener('input', function() {
    this.value = this.value.replace(/[^a-zA-Z\s]/g, ''); // restrict to alphabets and spaces
    this.value = toTitleCase(this.value);
  });

  // Restrict mobile input to digits only, max 10
  const editMobileInput = document.getElementById('edit_fieldMobiliserMobile');
  if (editMobileInput) {
    editMobileInput.addEventListener('input', function() {
      this.value = this.value.replace(/\D/g, '').substring(0, 10);
    });
  }

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
    if (input.id === 'edit_fieldMobiliserName') {
      input.addEventListener('input', () => { if (input.value.trim() !== '' && /[^a-zA-Z\s]/.test(input.value)) showError(input, 'Only alphabets and spaces allowed.'); else clearError(input); });
      input.addEventListener('blur', () => { if (input.value.trim() !== '' && /[^a-zA-Z\s]/.test(input.value)) showError(input, 'Only alphabets and spaces allowed.'); else clearError(input); });
    }
    // Specific validation for email (stricter regex)
    if (input.id === 'edit_fieldMobiliserEmail') {
      input.addEventListener('input', () => { if (input.value.trim() !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) showError(input, 'Please enter a valid email address.'); else clearError(input); });
      input.addEventListener('blur', () => { if (input.value.trim() !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) showError(input, 'Please enter a valid email address.'); else clearError(input); });
    }
    // Specific validation for region (only alphabets and spaces)
    if (input.id === 'edit_fieldMobiliserRegion') {
      input.addEventListener('input', () => { if (input.value.trim() !== '' && /[^a-zA-Z\s]/.test(input.value)) showError(input, 'Only alphabets and spaces allowed.'); else clearError(input); });
      input.addEventListener('blur', () => { if (input.value.trim() !== '' && /[^a-zA-Z\s]/.test(input.value)) showError(input, 'Only alphabets and spaces allowed.'); else clearError(input); });
    }
    // Specific validation for supported project (only alphabets and spaces)
    if (input.id === 'edit_fieldMobiliserProject') {
      input.addEventListener('input', () => { if (input.value.trim() !== '' && /[^a-zA-Z\s]/.test(input.value)) showError(input, 'Only alphabets and spaces allowed.'); else clearError(input); });
      input.addEventListener('blur', () => { if (input.value.trim() !== '' && /[^a-zA-Z\s]/.test(input.value)) showError(input, 'Only alphabets and spaces allowed.'); else clearError(input); });
    }
    // Specific validation for mobile (only digits, 10 digits)
    if (input.id === 'edit_fieldMobiliserMobile') {
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

    // Additional custom validations
    const emailInput = document.getElementById('edit_fieldMobiliserEmail');
    if (emailInput.value.trim() !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
      showError(emailInput, 'Please enter a valid email address.');
      isValid = false;
    }

    const regionInput = document.getElementById('edit_fieldMobiliserRegion');
    if (regionInput.value.trim() !== '' && /[^a-zA-Z\s]/.test(regionInput.value)) {
      showError(regionInput, 'Only alphabets and spaces allowed.');
      isValid = false;
    }

    const projectInput = document.getElementById('edit_fieldMobiliserProject');
    if (projectInput.value.trim() !== '' && /[^a-zA-Z\s]/.test(projectInput.value)) {
      showError(projectInput, 'Only alphabets and spaces allowed.');
      isValid = false;
    }

    if (!isValid) {
      const msgDiv = document.getElementById('editProfileMessage');
      msgDiv.style.display = 'block';
      msgDiv.className = 'message error';
      msgDiv.textContent = 'Please correct the errors in the form.';
      return;
    }

    const userId = sessionUserId;
    if (!userId) return alert('User ID missing');

    const payload = {
      userId: userId,
      FieldMobiliserName: document.getElementById('edit_fieldMobiliserName').value.trim(),
      FieldMobiliserEmailID: document.getElementById('edit_fieldMobiliserEmail').value.trim(),
      FieldMobiliserMobileNo: document.getElementById('edit_fieldMobiliserMobile').value.trim(),
      FieldMobiliserRegion: document.getElementById('edit_fieldMobiliserRegion').value.trim(),
      FieldMobiliserSupportedProject: document.getElementById('edit_fieldMobiliserProject').value.trim()
    };

    try {
      const res = await fetch('/.netlify/functions/editFieldMobiliserProfile', {
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

    const userId = sessionUserId;
    if (!userId) return alert('User ID missing');

    try {
      const res = await fetch('/.netlify/functions/changeFieldMobiliserPassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId, currentPassword, newPassword })
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
