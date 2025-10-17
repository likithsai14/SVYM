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
      setText('qualification', user.qualification);
      setText('caste', user.caste);
      setText('referralSource', user.referralSource);
      setText('staffName', user.staffName);
      setText('gender', user.gender);
      setText('tribal', user.tribal);
      setText('pwd', user.pwd);
      setText('aadhaarNumber', user.aadharNumber);
      setText('candidatePhone', user.candidatePhone);
      setText('parentPhone', user.parentPhone);
      setText('supportedProject', user.supportedProject);
      setText('email', user.email);
      setText('fieldMobiliserId', user.fieldMobiliserId);
      setText('fieldMobiliserName', user.fieldMobiliserName);
      setText('accountStatus', user.accountStatus);

      // Keep a copy for edit modal prefilling
      window.__currentUserProfile = user;
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  }

  // ------------------ Modals ------------------
  // Populate districts and taluks for edit modal
  const editDistrictSelect = document.getElementById('edit_districtName');
  const editTalukSelect = document.getElementById('edit_talukName');
  const editMobiliserSelect = document.getElementById('edit_mobiliserName');
  const editReferralSource = document.getElementById('edit_referralSource');
  const editStaffNameDiv = document.getElementById('edit_staffNameDiv');
  const editStaffNameInput = document.getElementById('edit_staffName');
  const editDobInput = document.getElementById('edit_dob');
  const editAgeInput = document.getElementById('edit_age');

  // Populate districts
  const districts = [
    "Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban",
    "Bidar", "Chamarajanagar", "Chikkaballapur", "Chikkamagaluru", "Chitradurga",
    "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Hassan",
    "Haveri", "Kalaburagi (Gulbarga)", "Kodagu", "Kolar", "Koppal",
    "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga (Shimoga)",
    "Tumakuru", "Udupi", "Uttara Kannada (Karwar)", "Vijayapura (Bijapur)", "Yadgir"
  ].sort();
  districts.forEach(district => {
    const option = document.createElement('option');
    option.value = district;
    option.textContent = district;
    editDistrictSelect.appendChild(option);
  });

  // District -> Taluk
  const districtTaluks = {
    "Bagalkot": ["Badami", "Bagalkot", "Bilgi", "Hungund", "Jamkhandi", "Mudhol", "Rabkavi Banhatti"],
    "Ballari": ["Ballari", "Hospet (Vijayanagara)", "Kudligi", "Sandur", "Siruguppa", "Kampli", "Hagaribommanahalli", "Kotturu", "Kurugodu", "Hoovina Hadagali"],
    "Belagavi": ["Athani", "Bailhongal", "Belagavi", "Chikodi", "Gokak", "Hukkeri", "Khanapur", "Raibag", "Ramdurg", "Saundatti", "Kagwad", "Mudalagi", "Nippani"],
    "Bengaluru Rural": ["Devanahalli", "Doddaballapur", "Hosakote", "Nelamangala", "Vijayapura"],
    "Bengaluru Urban": ["Bengaluru North", "Bengaluru South", "Bengaluru East", "Anekal", "Yelahanka", "Kengeri"],
    "Bidar": ["Aurad", "Basavakalyan", "Bhalki", "Bidar", "Humnabad", "Kamalanagar", "Chitguppa"],
    "Chamarajanagar": ["Chamarajanagar", "Gundlupet", "Kollegal", "Yelandur", "Hanur"],
    "Chikkaballapur": ["Bagepalli", "Chikkaballapur", "Gauribidanur", "Gudibanda", "Sidlaghatta", "Chintamani"],
    "Chikkamagaluru": ["Chikkamagaluru", "Kadur", "Koppa", "Mudigere", "Narasimharajapura", "Sringeri", "Tarikere"],
    "Chitradurga": ["Chitradurga", "Challakere", "Hiriyur", "Holalkere", "Hosadurga", "Molakalmuru"],
    "Dakshina Kannada": ["Bantwal", "Belthangady", "Mangaluru", "Puttur", "Sullia", "Kadaba", "Mulki", "Moodabidri"],
    "Davanagere": ["Channagiri", "Davanagere", "Harihar", "Honnali", "Jagalur", "Nyamathi"],
    "Dharwad": ["Annigeri", "Dharwad", "Hubballi", "Kalghatgi", "Kundgol", "Navalgund", "Alnavar"],
    "Gadag": ["Gadag", "Gajendragad", "Laxmeshwar", "Mundargi", "Nargund", "Ron", "Shirhatti"],
    "Hassan": ["Alur", "Arkalgud", "Arsikere", "Belur", "Channarayapattana", "Hassan", "Holenarasipur", "Sakleshpur"],
    "Haveri": ["Byadgi", "Hanagal", "Haveri", "Hirekerur", "Ranebennur", "Savnur", "Shiggaon"],
    "Kalaburagi (Gulbarga)": ["Afzalpur", "Aland", "Chincholi", "Chittapur", "Kalaburagi", "Jevargi", "Sedam", "Kamalapur", "Shahabad", "Yadrami"],
    "Kodagu": ["Madikeri", "Somvarpet", "Virajpet"],
    "Kolar": ["Bangarapet", "Kolar", "Malur", "Mulbagal", "Srinivaspur"],
    "Koppal": ["Gangavati", "Koppal", "Kushtagi", "Yelburga", "Kanakagiri", "Karatagi"],
    "Mandya": ["Krishnarajapet", "Maddur", "Malavalli", "Mandya", "Nagamangala", "Pandavapura", "Srirangapatna", "Maddur"],
    "Mysuru": ["Mysuru", "Hunsur", "Nanjangud", "T. Narasipur", "Krishnarajanagara", "Piriyapatna", "Saragur"],
    "Raichur": ["Devadurga", "Lingsugur", "Manvi", "Raichur", "Sindhanur", "Maski", "Sirwar"],
    "Ramanagara": ["Channapattana", "Kanakapura", "Magadi", "Ramanagara"],
    "Shivamogga (Shimoga)": ["Bhadravati", "Hosanagara", "Sagar", "Shikaripur", "Shivamogga", "Sorab", "Thirthahalli"],
    "Tumakuru": ["Chiknayakanahalli", "Gubbi", "Koratagere", "Kunigal", "Madhugiri", "Pavagada", "Sira", "Tiptur", "Tumakuru", "Turuvekere"],
    "Udupi": ["Brahmavar", "Byndoor", "Karkala", "Kaup", "Kundapura", "Udupi", "Hebri"],
    "Uttara Kannada (Karwar)": ["Ankola", "Bhatkal", "Haliyal", "Honnavar", "Joida", "Karwar", "Kumta", "Mundgod", "Siddapur", "Sirsi", "Yellapur"],
    "Vijayapura (Bijapur)": ["Basavana Bagewadi", "Bijapur (Vijayapura)", "Indi", "Muddebihal", "Sindagi", "Kolhar", "Tikota"],
    "Yadgir": ["Gurumitkal", "Shahapur", "Shorapur", "Vadagera", "Yadgir", "Gurumitkal"]
  };

  editDistrictSelect.addEventListener('change', function() {
    const selectedDistrict = this.value;
    editTalukSelect.innerHTML = '<option value="">Select Taluk</option>';
    editTalukSelect.disabled = true;
    if (selectedDistrict && districtTaluks[selectedDistrict]) {
      const taluksForDistrict = districtTaluks[selectedDistrict].sort();
      taluksForDistrict.forEach(taluk => {
        const option = document.createElement('option');
        option.value = taluk;
        option.textContent = taluk;
        editTalukSelect.appendChild(option);
      });
      editTalukSelect.disabled = false;
    }
  });

  // Load Mobilisers
  async function loadFieldMobilisers() {
    try {
      const response = await fetch('/.netlify/functions/getFieldMobileData');
      const result = await response.json();
      if (response.ok && Array.isArray(result.fieldMobilisers)) {
        editMobiliserSelect.innerHTML = '<option value="">Select Mobiliser</option>';
        result.fieldMobilisers.forEach(m => {
          const option = document.createElement('option');
          option.value = m.userId;
          option.textContent = m.FieldMobiliserName;
          editMobiliserSelect.appendChild(option);
        });
      } else {
        editMobiliserSelect.innerHTML = '<option value="">No mobilisers available</option>';
        console.error('Failed to load mobilisers:', result);
      }
    } catch (error) {
      console.error('Error fetching mobilisers:', error);
      editMobiliserSelect.innerHTML = '<option value="">Error loading mobilisers</option>';
    }
  }

  editReferralSource.addEventListener('change', function() {
    if (this.value === 'SVYM Staff') {
      editStaffNameDiv.style.display = 'block';
      editStaffNameInput.setAttribute('required', 'required');
    } else {
      editStaffNameDiv.style.display = 'none';
      editStaffNameInput.removeAttribute('required');
      editStaffNameInput.value = '';
    }
  });

  editDobInput.addEventListener('change', function() {
    const dob = new Date(this.value);
    if (isNaN(dob)) {
      editAgeInput.value = '';
      return;
    }
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    editAgeInput.value = age;
  });

  // Modal event listeners
  const editModal = document.getElementById('editProfileModal');
  const editCloseBtn = document.getElementById('closeEditModal');
  editCloseBtn.addEventListener('click', () => editModal.style.display = 'none');
  window.addEventListener('click', e => { if (e.target === editModal) editModal.style.display = 'none'; });

  const changeModal = document.getElementById('changePasswordModal');
  const changeCloseBtn = document.getElementById('closeChangeModal');
  changeCloseBtn.addEventListener('click', () => changeModal.style.display = 'none');
  window.addEventListener('click', e => { if (e.target === changeModal) changeModal.style.display = 'none'; });

  // Prefill edit modal
  document.getElementById('editProfile').addEventListener('click', () => {
    const user = window.__currentUserProfile || {};
    document.getElementById('edit_candidateName').value = user.candidateName || '';
    document.getElementById('edit_fatherHusbandName').value = user.fatherHusbandName || '';
    document.getElementById('edit_districtName').value = user.districtName || '';
    // Trigger taluk load
    editDistrictSelect.dispatchEvent(new Event('change'));
    setTimeout(() => { editTalukSelect.value = user.talukName || ''; }, 100);
    document.getElementById('edit_villageName').value = user.villageName || '';
    document.getElementById('edit_dob').value = user.dob ? user.dob.slice(0,10) : '';
    editAgeInput.value = user.age || '';
    document.getElementById('edit_familyMembers').value = user.familyMembers || '';
    document.getElementById('edit_qualification').value = user.qualification || '';
    document.getElementById('edit_email').value = user.email || '';
    document.getElementById('edit_aadharNumber').value = user.aadharNumber || '';
    document.getElementById('edit_candidatePhone').value = user.candidatePhone || '';
    document.getElementById('edit_parentPhone').value = user.parentPhone || '';
    document.getElementById('edit_gender').value = user.gender || '';
    editMobiliserSelect.value = user.fieldMobiliserId || '';
    document.getElementById('edit_caste').value = user.caste || '';
    document.getElementById('edit_tribal').value = user.tribal || '';
    document.getElementById('edit_pwd').value = user.pwd || '';
    document.getElementById('edit_supportedProject').value = user.supportedProject || '';
    document.getElementById('edit_referralSource').value = user.referralSource || '';
    editReferralSource.dispatchEvent(new Event('change'));
    document.getElementById('edit_staffName').value = user.staffName || '';
    editModal.style.display = 'flex';
  });

  // Edit form submit
  document.getElementById('editProfileForm').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const userId = sessionUserId || (window.__currentUserProfile && window.__currentUserProfile.userId);
    if (!userId) return alert('User ID missing');
    const payload = {
      userId,
      candidateName: document.getElementById('edit_candidateName').value.trim(),
      fatherHusbandName: document.getElementById('edit_fatherHusbandName').value.trim(),
      districtName: document.getElementById('edit_districtName').value.trim(),
      talukName: document.getElementById('edit_talukName').value.trim(),
      villageName: document.getElementById('edit_villageName').value.trim(),
      dob: document.getElementById('edit_dob').value,
      age: Number(editAgeInput.value) || undefined,
      familyMembers: Number(document.getElementById('edit_familyMembers').value) || undefined,
      qualification: document.getElementById('edit_qualification').value.trim(),
      email: document.getElementById('edit_email').value.trim(),
      aadharNumber: document.getElementById('edit_aadharNumber').value.trim(),
      candidatePhone: document.getElementById('edit_candidatePhone').value.trim(),
      parentPhone: document.getElementById('edit_parentPhone').value.trim(),
      gender: document.getElementById('edit_gender').value.trim(),
      fieldMobiliserId: document.getElementById('edit_mobiliserName').value.trim(),
      caste: document.getElementById('edit_caste').value.trim(),
      tribal: document.getElementById('edit_tribal').value.trim(),
      pwd: document.getElementById('edit_pwd').value.trim(),
      supportedProject: document.getElementById('edit_supportedProject').value.trim(),
      referralSource: document.getElementById('edit_referralSource').value.trim(),
      staffName: document.getElementById('edit_staffName').value.trim()
    };

    try {
      const res = await fetch('/.netlify/functions/updateStudentProfile', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      const j = await res.json();
      const msgDiv = document.getElementById('editProfileMessage');
      msgDiv.style.display = 'block';
      msgDiv.style.color = res.ok ? 'green' : 'red';
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

  // Load profile and mobilisers
  await loadProfile();
  await loadFieldMobilisers();

});
