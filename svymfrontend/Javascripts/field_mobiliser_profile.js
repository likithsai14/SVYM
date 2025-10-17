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

  // Edit profile form submit
  document.getElementById('editProfileForm').addEventListener('submit', async (ev) => {
    ev.preventDefault();
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

    // Validate required fields
    if (!payload.FieldMobiliserName || !payload.FieldMobiliserEmailID || !payload.FieldMobiliserMobileNo || !payload.FieldMobiliserRegion || !payload.FieldMobiliserSupportedProject) {
      const msgDiv = document.getElementById('editProfileMessage');
      msgDiv.style.display = 'block';
      msgDiv.className = 'message error';
      msgDiv.textContent = 'All fields are required';
      return;
    }

    // Validate mobile
    if (payload.FieldMobiliserMobileNo && !/^\d{10}$/.test(payload.FieldMobiliserMobileNo)) {
      const msgDiv = document.getElementById('editProfileMessage');
      msgDiv.style.display = 'block';
      msgDiv.className = 'message error';
      msgDiv.textContent = 'Mobile number must be exactly 10 digits';
      return;
    }

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
