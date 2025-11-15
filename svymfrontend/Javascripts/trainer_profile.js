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
      setText('trainerJoined', trainer.createdAt ? formatDate(trainer.createdAt) : '—');
      setText('trainerStatus', trainer.status);

      // Store for edit modal
      window.__currentTrainerProfile = trainer;
    } catch (err) {
      console.error('Error loading trainer profile:', err);
    }
  }

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
