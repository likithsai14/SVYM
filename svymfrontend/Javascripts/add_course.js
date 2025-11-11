 document.addEventListener("DOMContentLoaded", () => {
  const addCourseBtn = document.getElementById("openAddCourseModal");
  const modal = document.getElementById("addCourseModal");
  const closeModal = document.getElementById("closeModal");
  const cancelModal = document.getElementById("cancelModal");
  const errorMsg = document.getElementById("errorMsg");

  const trainerSelect = document.getElementById("trainerSelect");
  const newTrainerFields = document.getElementById("newTrainerFields");

  // Add Trainer Modal elements
  const openAddTrainerModalFromCourse = document.getElementById("openAddTrainerModalFromCourse");
  const addTrainerModalFromCourse = document.getElementById("addTrainerModalFromCourse");
  const closeAddTrainerModalFromCourse = document.getElementById("closeAddTrainerModalFromCourse");
  const addTrainerFormFromCourse = document.getElementById("addTrainerFormFromCourse");

  // Trainer form elements from course modal
  const formTrainerIdFromCourse = document.getElementById("formTrainerIdFromCourse");
  const formTrainerNameFromCourse = document.getElementById("formTrainerNameFromCourse");
  const formDateOfBirthFromCourse = document.getElementById("formDateOfBirthFromCourse");
  const formAgeFromCourse = document.getElementById("formAgeFromCourse");
  const formQualificationFromCourse = document.getElementById("formQualificationFromCourse");
  const formTrainerExpertiseFromCourse = document.getElementById("formTrainerExpertiseFromCourse");
  const formTrainerMobileFromCourse = document.getElementById("formTrainerMobileFromCourse");
  const formTrainerEmailFromCourse = document.getElementById("formTrainerEmailFromCourse");
  const formAadhaarNumberFromCourse = document.getElementById("formAadhaarNumberFromCourse");
  const formJoiningDateFromCourse = document.getElementById("formJoiningDateFromCourse");
  const formAddressFromCourse = document.getElementById("formAddressFromCourse");
  const formAccNumberFromCourse = document.getElementById("formAccNumberFromCourse");
  const formIfscCodeFromCourse = document.getElementById("formIfscCodeFromCourse");
  const formBankNameFromCourse = document.getElementById("formBankNameFromCourse");
  const formBankFullNameFromCourse = document.getElementById("formBankFullNameFromCourse");
  const formBankBranchFromCourse = document.getElementById("formBankBranchFromCourse");
  const trainerFormMessageFromCourse = document.getElementById("trainerFormMessageFromCourse");
  const generatedUserIdFromCourse = document.getElementById("generatedUserIdFromCourse");

  const formTrainerName = document.getElementById("formTrainerNameFromCourse");
  const formTrainerExpertise = document.getElementById("formTrainerExpertiseFromCourse");
  const formTrainerMobile = document.getElementById("formTrainerMobileFromCourse");
  const formTrainerEmail = document.getElementById("formTrainerEmailFromCourse");
  const formDateOfBirth = document.getElementById("formDateOfBirthFromCourse");
  const formAge = document.getElementById("formAgeFromCourse");
  const formQualification = document.getElementById("formQualificationFromCourse");
  const formAddress = document.getElementById("formAddressFromCourse");
  const formAadhaarNumber = document.getElementById("formAadhaarNumberFromCourse");
  const formJoiningDate = document.getElementById("formJoiningDateFromCourse");
  const formAccNumber = document.getElementById("formAccNumberFromCourse");
  const formIfscCode = document.getElementById("formIfscCodeFromCourse");
  const formBankName = document.getElementById("formBankNameFromCourse");
  const formBankFullName = document.getElementById("formBankFullNameFromCourse");
  const formBankBranch = document.getElementById("formBankBranchFromCourse");
  const trainerFormMessage = document.getElementById("trainerFormMessageFromCourse");
  const generatedUserId = document.getElementById("generatedUserIdFromCourse");

  const startDateInput = document.getElementById("startDate");
  const endDateInput = document.getElementById("endDate");
  const durationInput = document.getElementById("duration");
  const locationSelect = document.getElementById("location");
  const modulesWrapper = document.getElementById("modulesWrapper");
  const donorFundAmountInput = document.getElementById("donorFundAmount");
  const priceInput = document.getElementById("price");

  // Input restriction for trainer name in add/edit modal
  if (formTrainerName) {
    formTrainerName.addEventListener('input', function() {
      this.value = this.value.replace(/[^a-zA-Z\s]/g, ''); // restrict to alphabets and spaces
    });
    formTrainerName.addEventListener('blur', function() {
      this.value = toTitleCase(this.value);
    });
  }

  // Input restriction for expertise (alphabets and spaces, title case)
  if (formTrainerExpertise) {
    formTrainerExpertise.addEventListener('input', function() {
      this.value = this.value.replace(/[^a-zA-Z\s]/g, ''); // restrict to alphabets and spaces
      this.value = toTitleCase(this.value);
    });
  }

  // Restrict mobile input to digits only, max 10
  if (formTrainerMobile) {
    formTrainerMobile.addEventListener('input', function() {
      this.value = this.value.replace(/\D/g, '').substring(0, 10);
    });
  }

  // Make age field readonly
  if (formAge) {
    formAge.setAttribute('readonly', true);
  }

  // Calculate age from DOB and validate >=18
  if (formDateOfBirth) {
    formDateOfBirth.addEventListener('change', function() {
      const dob = new Date(this.value);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      formAge.value = age;
      if (age < 18) {
        showError(formDateOfBirth, 'Date of birth must be such that age is at least 18.');
      } else {
        clearError(formDateOfBirth);
      }
    });
  }

  // Restrict Aadhaar to 12 digits only
  if (formAadhaarNumber) {
    formAadhaarNumber.addEventListener('input', function() {
      this.value = this.value.replace(/\D/g, '').substring(0, 12);
    });
  }

  // Restrict account number to digits only
  if (formAccNumber) {
    formAccNumber.addEventListener('input', function() {
      this.value = this.value.replace(/\D/g, '');
    });
  }

  // Convert account holder name to upper case
  if (formBankFullName) {
    formBankFullName.addEventListener('input', function() {
      this.value = this.value.toUpperCase();
    });
  }

  // Restrict branch to alphabets and spaces only
  if (formBankBranch) {
    formBankBranch.addEventListener('input', function() {
      this.value = this.value.replace(/[^a-zA-Z\s]/g, '');
    });
  }

  // Function to convert to title case
  function toTitleCase(str) {
    return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  }

  const errorSpans = {};
  addTrainerFormFromCourse.querySelectorAll('input, select').forEach(input => {
    const spanId = input.id + 'Error';
    errorSpans[input.id] = document.getElementById(spanId);
  });

  // Live validation
  addTrainerFormFromCourse.querySelectorAll('input, select').forEach(input => {
    if (input.hasAttribute('required')) {
      input.addEventListener('input', () => { if (input.value.trim() !== '') clearError(input); });
      input.addEventListener('blur', () => { if (input.value.trim() === '') showError(input, 'This field is required.'); else clearError(input); });
    }
    if (input.hasAttribute('pattern') || input.type === 'date' || input.type === 'email') {
      input.addEventListener('input', () => { if (!input.validity.valid) showError(input, input.title || 'Invalid format.'); else clearError(input); });
      input.addEventListener('blur', () => { if (!input.validity.valid && input.value.trim() !== '') showError(input, input.title || 'Invalid format.'); else clearError(input); });
    }
    // Specific validation for name fields (only alphabets and spaces)
    if (input.id === 'formTrainerNameFromCourse') {
      input.addEventListener('input', () => { if (input.value.trim() !== '' && /[^a-zA-Z\s]/.test(input.value)) showError(input, 'Only alphabets and spaces allowed.'); else clearError(input); });
      input.addEventListener('blur', () => { if (input.value.trim() !== '' && /[^a-zA-Z\s]/.test(input.value)) showError(input, 'Only alphabets and spaces allowed.'); else clearError(input); });
    }
    // Specific validation for mobile (only digits, 10 digits)
    if (input.id === 'formTrainerMobileFromCourse') {
      input.addEventListener('input', () => { if (input.value.trim() !== '' && !/^\d{10}$/.test(input.value)) showError(input, 'Mobile number must be exactly 10 digits.'); else clearError(input); });
      input.addEventListener('blur', () => { if (input.value.trim() !== '' && !/^\d{10}$/.test(input.value)) showError(input, 'Mobile number must be exactly 10 digits.'); else clearError(input); });
    }
    // Specific validation for Aadhaar (12 digits)
    if (input.id === 'formAadhaarNumberFromCourse') {
      input.addEventListener('input', () => { if (input.value.trim() !== '' && !/^\d{12}$/.test(input.value)) showError(input, 'Aadhaar number must be exactly 12 digits.'); else clearError(input); });
      input.addEventListener('blur', () => { if (input.value.trim() !== '' && !/^\d{12}$/.test(input.value)) showError(input, 'Aadhaar number must be exactly 12 digits.'); else clearError(input); });
    }
    // Specific validation for account number (digits only)
    if (input.id === 'formAccNumberFromCourse') {
      input.addEventListener('input', () => { if (input.value.trim() !== '' && /\D/.test(input.value)) showError(input, 'Account number must contain only digits.'); else clearError(input); });
      input.addEventListener('blur', () => { if (input.value.trim() !== '' && /\D/.test(input.value)) showError(input, 'Account number must contain only digits.'); else clearError(input); });
    }
    // Specific validation for bank branch (alphabets and spaces)
    if (input.id === 'formBankBranchFromCourse') {
      input.addEventListener('input', () => { if (input.value.trim() !== '' && /[^a-zA-Z\s]/.test(input.value)) showError(input, 'Branch must contain only alphabets and spaces.'); else clearError(input); });
      input.addEventListener('blur', () => { if (input.value.trim() !== '' && /[^a-zA-Z\s]/.test(input.value)) showError(input, 'Branch must contain only alphabets and spaces.'); else clearError(input); });
    }
  });

  function showError(input, message) {
    const span = errorSpans[input.id];
    if (span) {
      span.textContent = message;
      input.classList.add('input-error');
    }
  }

  function clearError(input) {
    const span = errorSpans[input.id];
    if (span) {
      span.textContent = '';
      input.classList.remove('input-error');
    }
  }

  // Dummy locations
  const locations = ["Bangalore", "Mysore", "Hyderabad", "Chennai"];
  locations.forEach(loc => {
    const option = document.createElement("option");
    option.value = loc;
    option.textContent = loc;
    locationSelect.appendChild(option);
  });

  // Module inputs
  function createModuleInput() {
    const div = document.createElement("div");
    div.className = "module-input";
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.innerHTML = `
      <input type="text" name="moduleNames" class="moduleName" placeholder="Module name" required style="flex:1; padding:5px; margin-right:5px;">
      <button type="button" class="icon-btn removeBtn">X</button>
    `;
    const input = div.querySelector(".moduleName");
    input.addEventListener('input', function() {
      this.value = this.value.replace(/^\d/, ''); // Remove leading digit
      this.value = this.value.charAt(0).toUpperCase() + this.value.slice(1); // Capitalize first letter
    });
    div.querySelector(".removeBtn").addEventListener("click", () => div.remove());
    return div;
  }

  modulesWrapper.innerHTML = "";
  const moduleRow = document.createElement("div");
  moduleRow.className = "module-row";
  moduleRow.style.display = "flex";
  moduleRow.style.flexWrap = "wrap";
  moduleRow.appendChild(createModuleInput());
  const addBtn = document.createElement("button");
  addBtn.type = "button";
  addBtn.className = "icon-btn";
  addBtn.textContent = "+";
  addBtn.style.marginLeft = "5px";
  addBtn.addEventListener("click", () => moduleRow.insertBefore(createModuleInput(), addBtn));
  moduleRow.appendChild(addBtn);
  modulesWrapper.appendChild(moduleRow);

  // Auto-calc duration
  function calculateDuration() {
    const start = new Date(startDateInput.value);
    const end = new Date(endDateInput.value);
    if (start && end && end >= start) {
      const timeDiff = end.getTime() - start.getTime();
      const days = Math.floor(timeDiff / (1000 * 3600 * 24)) + 1;
      durationInput.value = days > 0 ? days : 0;
    } else {
      durationInput.value = "";
    }
  }
  startDateInput.addEventListener("change", calculateDuration);
  endDateInput.addEventListener("change", calculateDuration);

  // Disable/enable Add Trainer button based on trainer selection
  trainerSelect.addEventListener("change", () => {
    if (openAddTrainerModalFromCourse) {
      openAddTrainerModalFromCourse.disabled = trainerSelect.value !== "";
    }
    if (newTrainerFields) {
      newTrainerFields.style.display = trainerSelect.value === "addNewTrainer" ? "block" : "none";
    }
  });

  // Open Add Trainer Modal from Course Form
  if (openAddTrainerModalFromCourse) {
    openAddTrainerModalFromCourse.addEventListener("click", () => {
      addTrainerModalFromCourse.classList.remove("hide");
      addTrainerModalFromCourse.style.display = "flex";
    });
  }

  // Close Add Trainer Modal from Course Form
  if (closeAddTrainerModalFromCourse) {
    closeAddTrainerModalFromCourse.addEventListener("click", () => {
      addTrainerModalFromCourse.classList.add("hide");
      addTrainerModalFromCourse.style.display = "none";
    });
  }

  // Handle Add Trainer Form Submission from Course Form
  if (addTrainerFormFromCourse) {
    addTrainerFormFromCourse.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Clear previous messages
      if (trainerFormMessageFromCourse) trainerFormMessageFromCourse.textContent = "";
      if (generatedUserIdFromCourse) generatedUserIdFromCourse.textContent = "";

      // Get form data
      const newTrainerData = {
        name: formTrainerNameFromCourse ? formTrainerNameFromCourse.value : "",
        expertise: formTrainerExpertiseFromCourse ? formTrainerExpertiseFromCourse.value : "",
        mobile: formTrainerMobileFromCourse ? formTrainerMobileFromCourse.value : "",
        email: formTrainerEmailFromCourse ? formTrainerEmailFromCourse.value : "",
        dateOfBirth: formDateOfBirthFromCourse ? formDateOfBirthFromCourse.value : "",
        age: formAgeFromCourse ? parseInt(formAgeFromCourse.value) : 0,
        qualification: formQualificationFromCourse ? formQualificationFromCourse.value : "",
        address: formAddressFromCourse ? formAddressFromCourse.value : "",
        aadhaarNumber: formAadhaarNumberFromCourse ? formAadhaarNumberFromCourse.value : "",
        joiningDate: formJoiningDateFromCourse ? formJoiningDateFromCourse.value : "",
        bankDetails: {
          accNumber: formAccNumberFromCourse ? formAccNumberFromCourse.value : "",
          ifscCode: formIfscCodeFromCourse ? formIfscCodeFromCourse.value : "",
          bankName: formBankNameFromCourse ? formBankNameFromCourse.value : "",
          fullName: formBankFullNameFromCourse ? formBankFullNameFromCourse.value : "",
          branch: formBankBranchFromCourse ? formBankBranchFromCourse.value : ""
        }
      };

      // Basic validation
      if (!newTrainerData.name || !newTrainerData.expertise || !newTrainerData.mobile || !newTrainerData.email) {
        if (trainerFormMessageFromCourse) trainerFormMessageFromCourse.textContent = "Required field not specified";
        return;
      }

      // Mobile validation
      if (newTrainerData.mobile && !/^\d{10}$/.test(newTrainerData.mobile)) {
        if (trainerFormMessageFromCourse) trainerFormMessageFromCourse.textContent = "Mobile number must be exactly 10 digits.";
        return;
      }

      // Email validation
      if (newTrainerData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newTrainerData.email)) {
        if (trainerFormMessageFromCourse) trainerFormMessageFromCourse.textContent = "Invalid email format.";
        return;
      }

      // Age validation
      if (newTrainerData.dateOfBirth) {
        const dob = new Date(newTrainerData.dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
          age--;
        }
        if (age < 18) {
          if (trainerFormMessageFromCourse) trainerFormMessageFromCourse.textContent = "Date of birth must be such that age is at least 18.";
          return;
        }
      }

      // Aadhaar validation
      if (newTrainerData.aadhaarNumber && !/^\d{12}$/.test(newTrainerData.aadhaarNumber)) {
        if (trainerFormMessageFromCourse) trainerFormMessageFromCourse.textContent = "Aadhaar number must be exactly 12 digits.";
        return;
      }

      const newTrainer = {
        role: "trainer",
        ...newTrainerData,
        isFirstLogin: true,
        status: "Active",
      };

      try {
        const response = await fetch("/.netlify/functions/createTrainer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newTrainer)
        });

        const trainer = await response.json();

        if (response.ok) {
          if (trainerFormMessageFromCourse) trainerFormMessageFromCourse.textContent = "Trainer created successfully!";
          if (generatedUserIdFromCourse) {
            generatedUserIdFromCourse.style.display = "block";
            generatedUserIdFromCourse.textContent = `Generated User ID: ${trainer.trainerId}. Please share this with the trainer.`;
          }
          addTrainerFormFromCourse.reset();

          // Refresh trainer list in course form
          const trainerRes = await fetch("/.netlify/functions/allTrainers");
          const trainerDataRes = await trainerRes.json();
          const activeTrainers = trainerDataRes.trainers.filter(t => t.status === "Active");
          trainerSelect.innerHTML = `
            <option value="">Select Trainer</option>
            <option value="addNewTrainer">+ Add New Trainer</option>
            ${activeTrainers.map(t => `<option value="${t.trainerId}">${t.name}</option>`).join("")}
          `;

          // Close modal after success
          setTimeout(() => {
            addTrainerModalFromCourse.classList.add("hide");
            addTrainerModalFromCourse.style.display = "none";
          }, 2000);
        } else {
          if (trainerFormMessageFromCourse) trainerFormMessageFromCourse.textContent = `Failed to create the trainer. ${trainer.message || ""}`;
        }
      } catch (error) {
        console.error("Error creating trainer:", error);
        if (trainerFormMessageFromCourse) trainerFormMessageFromCourse.textContent = "Failed to create trainer. Please try again.";
      }
    });
  }

  // Validation for course name: should not start with digit, may contain in between, and auto-capitalize first letter of each word
  const trainingNameInput = document.getElementById("trainingName");
  if (trainingNameInput) {
    trainingNameInput.addEventListener('input', function() {
      this.value = toTitleCase(this.value);
      const errorSpan = document.getElementById("trainingNameError");
      if (errorSpan) {
        if (/^\d/.test(this.value)) {
          errorSpan.textContent = "Course name should not start with a digit.";
          this.classList.add('input-error');
        } else {
          errorSpan.textContent = "";
          this.classList.remove('input-error');
        }
      }
    });
  }

  // Validation for donor fund amount: must be <= price
  function validateDonorFund() {
    const price = parseFloat(priceInput.value) || 0;
    const donorFund = parseFloat(donorFundAmountInput.value) || 0;
    const errorSpan = document.getElementById("donorFundError");
    if (errorSpan) {
      if (donorFund > price) {
        errorSpan.textContent = "Donor fund amount cannot exceed the course price.";
        donorFundAmountInput.classList.add('input-error');
      } else {
        errorSpan.textContent = "";
        donorFundAmountInput.classList.remove('input-error');
      }
    }
  }
  priceInput.addEventListener('input', validateDonorFund);
  donorFundAmountInput.addEventListener('input', validateDonorFund);

  // Open modal & populate trainers
  addCourseBtn.addEventListener("click", async () => {
    modal.classList.add("show");
    trainerSelect.innerHTML = `<option value="">Loading...</option>`;

    try {
      const res = await fetch("/.netlify/functions/allTrainers");
      const data = await res.json();
      const activeTrainers = data.trainers.filter(t => t.status === "Active");

      trainerSelect.innerHTML = `
        <option value="">Select Trainer</option>
        ${activeTrainers.map(t => `<option value="${t.trainerId}">${t.name}</option>`).join("")}
      `;
      // Enable Add Trainer button by default
      if (openAddTrainerModalFromCourse) openAddTrainerModalFromCourse.disabled = false;
    } catch (err) {
      console.error(err);
      trainerSelect.innerHTML = `<option value="">Error loading trainers</option>`;
    }
  });

  // Close modal
  closeModal.addEventListener("click", () => modal.classList.remove("show"));
  cancelModal.addEventListener("click", () => modal.classList.remove("show"));
  window.addEventListener("click", e => { if (e.target === modal) modal.classList.remove("show"); });

  // Form submit
  const form = document.getElementById("courseForm");
  form.addEventListener("submit", async e => {
    e.preventDefault();
    errorMsg.textContent = "";

    // Check for validation errors
    const trainingNameError = document.getElementById("trainingNameError")?.textContent || "";
    const formTrainerNameError = document.getElementById("formTrainerNameError")?.textContent || "";
    const formTrainerExpertiseError = document.getElementById("formTrainerExpertiseError")?.textContent || "";
    const formTrainerMobileError = document.getElementById("formTrainerMobileError")?.textContent || "";
    const formTrainerEmailError = document.getElementById("formTrainerEmailError")?.textContent || "";
    const donorFundError = document.getElementById("donorFundError")?.textContent || "";

    if (trainingNameError || formTrainerNameError || formTrainerExpertiseError || formTrainerMobileError || formTrainerEmailError || donorFundError) {
      errorMsg.textContent = "Please fix the validation errors before submitting.";
      return;
    }

    const courseName = document.getElementById("trainingName").value.trim();
    const price = document.getElementById("price").value;
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;
    const duration = durationInput.value;
    const location = locationSelect.value;
    const description = document.getElementById("description").value.trim();

    const moduleInputs = document.querySelectorAll(".moduleName");
    const moduleNames = Array.from(moduleInputs).map(i => i.value.trim()).filter(n => n);

    const selectedTrainer = trainerSelect.value;
    let trainerPayload = {};

    // ✅ Updated logic — pass isNewTrainer and trainerName
    if (selectedTrainer === "addNewTrainer") {
      if (!formTrainerName.value || !formTrainerExpertise.value) {
        return (errorMsg.textContent = "All new trainer fields are required.");
      }
      // Additional validations for new trainer
      if (/[^a-zA-Z\s]/.test(formTrainerName.value)) {
        return (errorMsg.textContent = "Trainer name must contain only alphabets and spaces.");
      }
      if (!/^\d{10}$/.test(formTrainerMobile.value)) {
        return (errorMsg.textContent = "Trainer mobile number must be exactly 10 digits.");
      }
      trainerPayload = {
        isNewTrainer: true,
        name: formTrainerName.value,
        trainerName: formTrainerName.value,
        expertise: formTrainerExpertise.value,
        mobile: formTrainerMobile.value,
        email: formTrainerEmail.value
      };
    } else if (selectedTrainer) {
      const selectedTrainerName = trainerSelect.options[trainerSelect.selectedIndex].textContent;
      trainerPayload = {
        isNewTrainer: false,
        trainerId: selectedTrainer,
        trainerName: selectedTrainerName
      };
    } else {
      return (errorMsg.textContent = "Please select or add a trainer.");
    }

    const donorFundAmount = document.getElementById("donorFundAmount").value;

    // ✅ Fix: wrap all course fields in `course` object (matches backend)
    const payload = {
      course: {
        courseName,
        price,
        donorFundAmount,
        startDate,
        endDate,
        duration,
        moduleNames,
        location,
        description
      },
      addedBy: sessionStorage.getItem("userId") || "unknown",
      trainer: trainerPayload
    };

    console.log("📦 Course Payload Sent to Backend:", payload);

    try {
      const res = await fetch("/.netlify/functions/addCourseWithTrainer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(await res.text());

      alert("✅ Course added successfully!");
      form.reset();
      if (newTrainerFields) {
        newTrainerFields.style.display = "none";
      }
      durationInput.value = "";
      modulesWrapper.innerHTML = "";
      modulesWrapper.appendChild(moduleRow);
      modal.classList.remove("show");
      // Refresh the page to show updated course data
      location.reload();
    } catch (err) {
      console.error(err);
      errorMsg.textContent = "Error: " + err.message;
    }
  });
});
