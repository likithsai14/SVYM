document.addEventListener("DOMContentLoaded", async () => {
  // -----------------------------------
  // STEP 1: Fetch or define user data
  // (You can replace this with an API call)
  // -----------------------------------
  const userData = {
    userId: "SVYM99999",
    candidateName: "Some user",
    fatherHusbandName: "Some user gaurdian",
    villageName: "Vijayawada",
    talukName: "Vijayawada Rural",
    districtName: "Krishna",
    dob: "2001-07-15",
    age: 24,
    familyMembers: 4,
    qualification: "B.Tech (CSE)",
    caste: "OC",
    referralSource: "Through Staff",
    staffName: "Mr. Ramesh",
    gender: "Male",
    tribal: "No",
    pwd: "No",
    aadharNumber: "1234 5678 9012",
    candidatePhone: "9876543210",
    parentPhone: "8765432109",
    supportedProject: "Tech4Hope",
    email: "someuser@example.com",
    fieldMobiliserId: "FM-102",
    fieldMobiliserName: "Suresh Kumar",
    accountStatus: "active"
  };

  // -----------------------------------
  // STEP 2: Helper function to set text
  // -----------------------------------
  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value || "—";
  };

  // -----------------------------------
  // STEP 3: Fill header (student name)
  // -----------------------------------
  const nameEl = document.getElementById("candidateName");
  if (nameEl) nameEl.textContent = userData.candidateName || "Candidate";

  // -----------------------------------
  // STEP 4: Assign all field values
  // (make sure HTML spans have matching ids)
  // -----------------------------------
  setText("userId", userData.userId);
  setText("fatherHusbandName", userData.fatherHusbandName);
  setText("villageName", userData.villageName);
  setText("talukName", userData.talukName);
  setText("districtName", userData.districtName);
  setText("dob", userData.dob);
  setText("age", userData.age);
  setText("familyMembers", userData.familyMembers);
  setText("qualification", userData.qualification);
  setText("caste", userData.caste);
  setText("referralSource", userData.referralSource);
  setText("staffName", userData.staffName);
  setText("gender", userData.gender);
  setText("tribal", userData.tribal);
  setText("pwd", userData.pwd);
  setText("aadharNumber", userData.aadharNumber);
  setText("candidatePhone", userData.candidatePhone);
  setText("parentPhone", userData.parentPhone);
  setText("supportedProject", userData.supportedProject);
  setText("email", userData.email);
  setText("fieldMobiliserId", userData.fieldMobiliserId);
  setText("fieldMobiliserName", userData.fieldMobiliserName);
  setText("accountStatus", userData.accountStatus);

  // -----------------------------------
  // STEP 5: Button Actions
  // -----------------------------------
  const editProfileBtn = document.getElementById("editProfile");
  const changePasswordBtn = document.getElementById("changePassword");

  if (editProfileBtn) {
    editProfileBtn.addEventListener("click", () => {
      alert(`Edit Profile for: ${userData.candidateName}`);
      // window.location.href = "edit_profile.html";
    });
  }

  if (changePasswordBtn) {
    changePasswordBtn.addEventListener("click", () => {
      alert(`Change Password for: ${userData.candidateName}`);
      // window.location.href = "change_password.html";
    });
  }
});
