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
      const res = await fetch(`/.netlify/functions/getStudentProfile?userId=${encodeURIComponent(userId)}`);
      if (!res.ok) {
        console.error('Failed to fetch profile', await res.text());
        return;
      }
      const payload = await res.json();
      const user = payload.user;
      if (!user) return;

      console.log('Loaded user profile:', user);

      // Header
      const nameEl = document.getElementById('candidateName'); if (nameEl) nameEl.textContent = user.candidateName || 'Candidate';

      // Fill fields
      setText('userId', user.userId);
      setText('fatherHusbandName', user.fatherHusbandName);
      setText('villageName', user.villageName);
      setText('talukName', user.talukName);
      setText('districtName', user.districtName);
      setText('dob', user.dob);
      setText('age', user.age);
      setText('familyMembers', user.familyMembers);
      // Display qualification: if "Other", show otherQualification
      setText('qualification', user.qualification === "Other" ? (user.otherQualification || "Other") : user.qualification);
      // Display caste: if "Others", show otherCaste
      setText('caste', user.caste === "Others" ? (user.otherCaste || "Others") : user.caste);
      setText('referralSource', user.referralSource);
      setText('staffName', user.staffName);
      setText('gender', user.gender);
      // Display tribal: show if specified and not "None", else "No"
      setText('tribal', user.tribal && user.tribal !== "None" ? user.tribal : "No");
      setText('pwd', user.pwd);
      setText('aadhaarNumber', user.aadharNumber);
      setText('candidatePhone', user.candidatePhone);
      setText('parentPhone', user.parentPhone);
      setText('supportedProject', user.supportedProject);
      setText('email', user.email);
      setText('fieldMobiliserId', user.fieldMobiliserId);
      setText('fieldMobiliserName', user.fieldMobiliserName);
      setText('accountStatus', user.accountStatus);


    } catch (err) {
      console.error('Error loading profile:', err);
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
      const res = await fetch('/.netlify/functions/changeStudentPassword', {
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
