document.addEventListener("DOMContentLoaded", async () => {
  // We'll fetch the current logged-in user's id from sessionStorage (convention used elsewhere)
  const sessionUserId = sessionStorage.getItem('userId');
  if (!sessionUserId) {
    console.warn('No session userId found in sessionStorage');
  }

  // Helper to set text into spans
  const setText = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value ?? '—'; };

  // Fetch profile from backend and populate UI
  async function loadProfile() {
    const userId = sessionUserId || 'SVYM99999'; // fallback for dev
    try {
      const res = await fetch(`/.netlify/functions/getTrainerProfile?userId=${encodeURIComponent(userId)}`);
      if (!res.ok) {
        console.error('Failed to fetch profile', await res.text());
        return;
      }
      const payload = await res.json();
      const trainer = payload.trainer;
      if (!trainer) return;

      console.log('Loaded trainer profile:', trainer);

      // Populate profile details
      setText('trainerId', trainer.trainerId);
      setText('trainerName', trainer.name);
      setText('trainerEmail', trainer.email || 'Not provided');
      setText('trainerPhone', trainer.mobile || 'Not provided');
      setText('trainerExpertise', trainer.expertise);
      setText('trainerJoined', trainer.joiningDate ? formatDate(trainer.joiningDate) : '—');
      setText('trainerStatus', trainer.status);

      // Bank details
      setText('trainerAccNumber', trainer.bankDetails?.accNumber || '—');
      setText('trainerBankName', trainer.bankDetails?.bankName || '—');
      setText('trainerIfscCode', trainer.bankDetails?.ifscCode || '—');
      setText('trainerFullName', trainer.bankDetails?.fullName || '—');
      setText('trainerBranch', trainer.bankDetails?.branch || '—');

      // Other info
      setText('trainerDateOfBirth', trainer.dateOfBirth ? formatDate(trainer.dateOfBirth) : '—');
      setText('trainerQualification', trainer.qualification || '—');
      setText('trainerAddress', trainer.address || '—');
      setText('trainerAadhaarNumber', trainer.aadhaarNumber || '—');
      setText('trainerJoiningDate', trainer.joiningDate ? formatDate(trainer.joiningDate) : '—');

    } catch (err) {
      console.error('Error loading trainer profile:', err);
    }
  }

  // Modal event listeners
  const changeModal = document.getElementById('changePasswordModal');
  const changeCloseBtn = document.getElementById('closeChangeModal');
  changeCloseBtn.addEventListener('click', () => changeModal.style.display = 'none');
  window.addEventListener('click', e => { if (e.target === changeModal) changeModal.style.display = 'none'; });

  // Change password
  document.getElementById('changePassword').addEventListener('click', () => { changeModal.style.display = 'flex'; });

  document.getElementById('changePasswordForm').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirm = document.getElementById('confirmNewPassword').value;
    if (newPassword !== confirm) return alert('New passwords do not match');
    if (!/^[0-9]{5}$/.test(newPassword)) return alert('New password must be exactly 5 digits');
    const userId = sessionUserId || (window.__currentUserProfile && window.__currentUserProfile.userId);
    if (!userId) return alert('User ID missing');

    try {
      const res = await fetch('/.netlify/functions/changeTrainerPassword', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, currentPassword, newPassword })
      });
      const j = await res.json();
      const msgDiv = document.getElementById('changePasswordMessage');
      msgDiv.style.display = 'block';
      msgDiv.style.color = res.ok ? 'green' : 'red';
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

  // Load profile
  await loadProfile();
});

// Standard date formatting function: DD/MM/YYYY
function formatDate(date) {
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}
