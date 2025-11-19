document.addEventListener("DOMContentLoaded", () => {
  const addPlacementBtn = document.getElementById("openAddPlacementModal");
  const modal = document.getElementById("addPlacementModal");
  const closeModal = document.getElementById("closeModal");
  const cancelModal = document.getElementById("cancelModal");
  const searchInput = document.getElementById("placementSearch");
  const statusFilter = document.getElementById("statusFilter");
  const placementsTableBody = document.getElementById("placementsTableBody");
  const modalTitle = document.getElementById("modalTitle");
  const placementForm = document.getElementById("placementForm");
  const userId = document.getElementById("userId");
  const alumniName = document.getElementById("alumniName");
  const parentSpouseName = document.getElementById("parentSpouseName");
  const trainingName = document.getElementById("trainingName");
  const completionDate = document.getElementById("completionDate");
  const isPlaced = document.getElementById("isPlaced");
  const jobPlace = document.getElementById("jobPlace");
  const earningPerMonth = document.getElementById("earningPerMonth");
  const followUpBy = document.getElementById("followUpBy");
  const errorMsg = document.getElementById("errorMsg");
  const studentDropdown = document.getElementById("studentDropdown");

  let placements = [];
  let editingPlacementId = null;
  let currentPage = 1;
  let totalPages = 1;
  const rowsPerPage = 7;

  let students = []; // Store all students for autocomplete
  let selectedStudent = null; // Store selected student data

  // Input validation functions
  function capitalizeFirstLetter(str) {
    return str.replace(/\b\w/g, l => l.toUpperCase());
  }

  function preventDigits(event) {
    const char = String.fromCharCode(event.which);
    if (/\d/.test(char)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  // Add validation to input fields
  function setupInputValidation() {
    const userIdField = document.getElementById("userId");
    const alumniNameField = document.getElementById("alumniName");
    const parentSpouseNameField = document.getElementById("parentSpouseName");
    const trainingNameField = document.getElementById("trainingName");
    const followUpByField = document.getElementById("followUpBy");

    // Auto-uppercase for User ID
    if (userIdField) {
      userIdField.addEventListener('input', function() {
        this.value = this.value.toUpperCase();
      });
      userIdField.addEventListener('paste', function(e) {
        e.preventDefault();
        const pastedText = (e.clipboardData || window.clipboardData).getData('text');
        this.value = pastedText.toUpperCase();
      });
    }

    // Prevent digits and auto-capitalize
    [alumniNameField, parentSpouseNameField, trainingNameField, followUpByField].forEach(field => {
      if (field) {
        field.addEventListener('keypress', preventDigits);
        field.addEventListener('input', function() {
          this.value = capitalizeFirstLetter(this.value);
        });
        field.addEventListener('paste', function(e) {
          e.preventDefault();
          const pastedText = (e.clipboardData || window.clipboardData).getData('text');
          const cleanedText = pastedText.replace(/\d/g, ''); // Remove digits
          this.value = capitalizeFirstLetter(cleanedText);
        });
      }
    });

    // Toggle placement-related fields based on placement status
    const isPlacedField = document.getElementById("isPlaced");
    if (isPlacedField) {
      isPlacedField.addEventListener('change', togglePlacementFields);
    }
  }

  // Function to toggle placement-related fields
  function togglePlacementFields() {
    const isPlaced = document.getElementById("isPlaced").value === "true";
    const jobPlace = document.getElementById("jobPlace");
    const earningPerMonth = document.getElementById("earningPerMonth");
    const employmentType = document.getElementById("employmentType");

    if (isPlaced) {
      jobPlace.disabled = false;
      earningPerMonth.disabled = false;
      employmentType.disabled = false;
    } else {
      jobPlace.disabled = true;
      earningPerMonth.disabled = true;
      employmentType.disabled = true;
      jobPlace.value = "";
      earningPerMonth.value = "";
      employmentType.value = "";
    }
  }

  // Fetch all students for autocomplete
  async function fetchStudents() {
    try {
      const response = await fetch('/.netlify/functions/allstudents');
      if (!response.ok) throw new Error("Failed to fetch students");
      const data = await response.json();
      students = data.students || [];
    } catch (err) {
      console.error("Error fetching students:", err);
      students = [];
    }
  }

  // Show student dropdown with filtered results
  function showStudentDropdown(query) {
    if (!query.trim()) {
      studentDropdown.style.display = 'none';
      return;
    }

    const filteredStudents = students.filter(student =>
      student.userId.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 10); // Limit to 10 results

    if (filteredStudents.length === 0) {
      studentDropdown.style.display = 'none';
      return;
    }

    studentDropdown.innerHTML = '';
    filteredStudents.forEach(student => {
      const item = document.createElement('div');
      item.className = 'student-dropdown-item';
      item.innerHTML = `
        <div class="student-name">${student.candidateName}</div>
        <div class="student-id">${student.userId}</div>
      `;
      item.addEventListener('click', () => selectStudent(student));
      studentDropdown.appendChild(item);
    });

    studentDropdown.style.display = 'block';
  }

  // Hide student dropdown
  function hideStudentDropdown() {
    setTimeout(() => {
      studentDropdown.style.display = 'none';
    }, 150); // Delay to allow click events
  }

  // Select student from dropdown
  async function selectStudent(student) {
    selectedStudent = student;
    userId.value = student.userId;
    alumniName.value = student.candidateName;
    parentSpouseName.value = student.fatherHusbandName || '';

    // Find the most recent enrollment for course name
    if (student.enrollments && student.enrollments.length > 0) {
      const latestEnrollment = student.enrollments.sort((a, b) =>
        new Date(b.enrollmentDate) - new Date(a.enrollmentDate)
      )[0];
      trainingName.value = latestEnrollment.courseName || '';
    } else {
      trainingName.value = '';
    }

    studentDropdown.style.display = 'none';
    clearErrorMessages();
    const userIdError = document.getElementById("userIdError");
    userIdError.textContent = "";
  }

  // Clear error messages
  function clearErrorMessages() {
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
  }

  // Validate user ID against database
  function validateUserId(query) {
    const userIdError = document.getElementById("userIdError");
    if (!query.trim()) {
      userIdError.textContent = "";
      return;
    }

    const matchingStudents = students.filter(student =>
      student.userId.toLowerCase().includes(query.toLowerCase())
    );

    if (matchingStudents.length === 0) {
      userIdError.textContent = "User ID not present in the database.";
    } else {
      userIdError.textContent = "";
    }
  }

  // Create and insert spinner element
  const spinner = document.createElement("div");
  spinner.id = "loadingSpinner";
  spinner.innerHTML = `
    <div class="spinner"></div>
    <p>Loading placements...</p>
  `;
  spinner.style.display = "none";
  spinner.style.textAlign = "center";
  spinner.style.padding = "20px";
  spinner.querySelector(".spinner").style.cssText = `
    border: 6px solid #f3f3f3;
    border-top: 6px solid #3498db;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin: 0 auto 10px;
  `;
  placementsTableBody.parentNode.parentNode.insertBefore(spinner, placementsTableBody.parentNode);

  // Spinner animation keyframes
  const style = document.createElement("style");
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);

  // Fetch all placements (client-side pagination)
  async function fetchPlacements() {
    spinner.style.display = "block";
    placementsTableBody.innerHTML = "";
    try {
      const response = await fetch('/.netlify/functions/getPlacements?limit=10000');
      if (!response.ok) throw new Error("Failed to fetch placements");
      const data = await response.json();
      placements = data.placements || [];
      renderPlacements();
    } catch (err) {
      console.error(err);
      placementsTableBody.innerHTML = `<tr><td colspan="5" style="color:red; text-align: center;">Error loading placements</td></tr>`;
    } finally {
      spinner.style.display = "none";
    }
  }

  // Format date helper
  function formatDate(dateString) {
    const date = new Date(dateString);
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
  }

  // Format datetime helper
  function formatDateTime(dateString) {
    const date = new Date(dateString);
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
  }

  // Format currency helper
  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }

  // Get filtered placements
  function getFilteredPlacements() {
    const searchValue = searchInput.value.toLowerCase();
    const statusValue = statusFilter.value.toLowerCase();
    return placements.filter(placement => {
      const matchesSearch = placement.alumniName.toLowerCase().includes(searchValue) ||
                            placement.userId.toLowerCase().includes(searchValue) ||
                            placement.followUpBy.toLowerCase().includes(searchValue);
      const matchesStatus = statusValue === '' || (placement.isPlaced ? 'placed' : 'not-placed') === statusValue;
      return matchesSearch && matchesStatus;
    });
  }

  // Render placements with client-side pagination
  function renderPlacements() {
    placementsTableBody.innerHTML = "";
    const filtered = getFilteredPlacements();

    totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;
    if (currentPage > totalPages) currentPage = totalPages;

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedPlacements = filtered.slice(start, end);

    if (paginatedPlacements.length === 0) {
      placementsTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 40px; color: #666;">No placements found.</td></tr>`;
      updatePaginationInfo();
      return;
    }

    paginatedPlacements.forEach(placement => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${placement.userId}</td>
        <td>${placement.alumniName}</td>
        <td><span class="status-badge ${placement.isPlaced ? 'placed' : 'not-placed'}">${placement.isPlaced ? 'Placed' : 'Not Placed'}</span></td>
        <td>${placement.followUpBy}</td>
        <td>
          <div class="table-actions">
            <button class="edit-btn" data-id="${placement._id}">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="delete-button" data-id="${placement._id}">
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
        </td>
      `;
      placementsTableBody.appendChild(row);
    });

    // Attach edit & delete handlers
    document.querySelectorAll(".edit-btn").forEach(btn =>
      btn.addEventListener("click", () => handleEdit(btn.dataset.id))
    );
    document.querySelectorAll(".delete-button").forEach(btn =>
      btn.addEventListener("click", () => openDeleteModal(btn.dataset.id))
    );

    updatePaginationInfo();
  }

  // Update pagination info
  function updatePaginationInfo() {
    const paginationInfo = document.getElementById("paginationInfo");
    const prevPage = document.getElementById("prevPage");
    const nextPage = document.getElementById("nextPage");

    paginationInfo.textContent = `Page ${currentPage} of ${totalPages}`;

    // Disable/Enable Previous button
    prevPage.disabled = currentPage === 1;

    // Disable/Enable Next button
    nextPage.disabled = currentPage === totalPages;
  }

  // Search functionality (client-side filtering with pagination reset)
  function applyFilters() {
    currentPage = 1; // Reset to first page when filters change
    renderPlacements();
  }

  searchInput.addEventListener("input", applyFilters);
  statusFilter.addEventListener("change", applyFilters);

  // Pagination event listeners
  document.getElementById("prevPage").addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderPlacements();
    }
  });

  document.getElementById("nextPage").addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderPlacements();
    }
  });

  // User ID input event listeners
  userId.addEventListener('input', (e) => {
    const query = e.target.value;
    showStudentDropdown(query);
    validateUserId(query);
  });

  userId.addEventListener('focus', (e) => {
    const query = e.target.value;
    if (query.trim()) {
      showStudentDropdown(query);
    }
  });

  userId.addEventListener('blur', () => {
    hideStudentDropdown();
    validateUserId(userId.value);
  });

  // Click outside to close dropdown
  document.addEventListener('click', (e) => {
    if (!userId.contains(e.target) && !studentDropdown.contains(e.target)) {
      studentDropdown.style.display = 'none';
    }
  });

  // Open Add Placement Modal
  addPlacementBtn.addEventListener("click", () => {
    editingPlacementId = null;
    selectedStudent = null;
    modalTitle.innerHTML = '<i class="fas fa-plus"></i> Add Placement';
    placementForm.reset();
    errorMsg.textContent = "";
    studentDropdown.style.display = 'none';
    modal.classList.add("show");
    userId.focus();
  });

  // Close Modal
  closeModal.addEventListener("click", () => {
    modal.classList.remove("show");
    editingPlacementId = null;
    selectedStudent = null;
    studentDropdown.style.display = 'none';
  });

  cancelModal.addEventListener("click", () => {
    modal.classList.remove("show");
    editingPlacementId = null;
    selectedStudent = null;
    studentDropdown.style.display = 'none';
  });

  window.addEventListener("click", e => {
    if (e.target === modal) {
      modal.classList.remove("show");
      editingPlacementId = null;
      selectedStudent = null;
      studentDropdown.style.display = 'none';
    }
  });

  // Handle Edit
  async function handleEdit(placementId) {
    const placement = placements.find(p => p._id === placementId);
    if (!placement) return alert("Placement not found!");

    editingPlacementId = placementId;
    modalTitle.innerHTML = '<i class="fas fa-edit"></i> Edit Placement';

    // Find the student data for this placement
    const student = students.find(s => s.userId === placement.userId);
    if (student) {
      selectedStudent = student;
      alumniName.value = placement.alumniName;
      userId.value = placement.userId;
      parentSpouseName.value = placement.parentSpouseName;
      trainingName.value = placement.trainingName;
    } else {
      // Fallback if student not found
      alumniName.value = placement.alumniName;
      userId.value = placement.userId;
      parentSpouseName.value = placement.parentSpouseName;
      trainingName.value = placement.trainingName;
    }

    // Format date for input field (YYYY-MM-DD)
    const date = new Date(placement.completionDate);
    completionDate.value = date.toISOString().split('T')[0];

    isPlaced.value = placement.isPlaced ? "Yes" : "No";
    jobPlace.value = placement.jobPlace;
    earningPerMonth.value = placement.earningPerMonth === "nil" ? "" : placement.earningPerMonth;
    employmentType.value = placement.employmentType === "nil" ? "" : placement.employmentType || '';
    followUpBy.value = placement.followUpBy;
    errorMsg.textContent = "";
    studentDropdown.style.display = 'none';
    modal.classList.add("show");
    userId.focus();
  }

  // Form Submit Handler
  placementForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorMsg.textContent = "";

    const isPlacedValue = isPlaced.value === "Yes";
    const formData = {
      userId: userId.value.trim(),
      alumniName: alumniName.value.trim(),
      parentSpouseName: parentSpouseName.value.trim(),
      trainingName: trainingName.value.trim(),
      completionDate: completionDate.value,
      isPlaced: isPlacedValue,
      jobPlace: isPlacedValue ? jobPlace.value.trim() : "nil",
      earningPerMonth: isPlacedValue ? earningPerMonth.value : null,
      employmentType: isPlacedValue ? employmentType.value : "nil",
      followUpBy: followUpBy.value.trim(),
    };

    // Validation
    if (!selectedStudent && !editingPlacementId) {
      errorMsg.textContent = "Please select a student from the dropdown.";
      return;
    }

    // Additional validation: Check if student exists in database
    if (!editingPlacementId) {
      const matchingStudents = students.filter(student =>
        student.userId.toLowerCase() === userId.value.toLowerCase().trim()
      );
      if (matchingStudents.length === 0) {
        const userIdError = document.getElementById("userIdError");
        userIdError.textContent = "User ID not present in the database.";
        return;
      }
    }

    if (!formData.userId) {
      errorMsg.textContent = "Please select a student to auto-populate User ID.";
      return;
    }

    if (!formData.alumniName) {
      errorMsg.textContent = "Please enter alumni name.";
      return;
    }

    if (!formData.parentSpouseName) {
      errorMsg.textContent = "Please select a student to auto-populate Parent/Spouse Name.";
      return;
    }

    if (!formData.trainingName) {
      errorMsg.textContent = "Please select a student to auto-populate Training Name.";
      return;
    }

    if (!formData.completionDate) {
      errorMsg.textContent = "Please select completion date.";
      return;
    }

    if (formData.isPlaced === undefined) {
      errorMsg.textContent = "Please select placement status.";
      return;
    }

    if (!formData.jobPlace) {
      errorMsg.textContent = "Please enter job place.";
      return;
    }

    if (isPlacedValue && !formData.earningPerMonth) {
      errorMsg.textContent = "Please select an earning range.";
      return;
    }

    if (isPlacedValue && !formData.employmentType) {
      errorMsg.textContent = "Please select employment type.";
      return;
    }

    if (!formData.followUpBy) {
      errorMsg.textContent = "Please enter follow up person.";
      return;
    }

    try {
      let response;
      if (editingPlacementId) {
        // Update existing placement
        response = await fetch("/.netlify/functions/updatePlacement", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingPlacementId, ...formData })
        });
      } else {
        // Add new placement
        const userIdSession = sessionStorage.getItem("userId");
        if (!userIdSession) {
          errorMsg.textContent = "User session not found. Please login again.";
          return;
        }
        response = await fetch("/.netlify/functions/addPlacement", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, addedBy: userIdSession })
        });
      }

      if (!response.ok) throw new Error(await response.text());

      alert(editingPlacementId ? "✅ Placement updated successfully!" : "✅ Placement added successfully!");
      modal.classList.remove("show");
      editingPlacementId = null;
      selectedStudent = null;
      studentDropdown.style.display = 'none';
      fetchPlacements();
    } catch (err) {
      console.error(err);
      errorMsg.textContent = "Error saving placement: " + err.message;
    }
  });

  // Delete Modal Setup
  const deleteModal = document.createElement("div");
  deleteModal.id = "deletePlacementModal";
  deleteModal.className = "modal";
  deleteModal.innerHTML = `
    <div class="modal-content" style="max-width:400px;">
      <h3>Delete Placement</h3>
      <hr>
      <div id="deletePlacementInfo"></div>
      <hr>
      <div style="margin-top:20px; text-align:center;">
        <button id="cancelDelete">Cancel</button>
        <button id="confirmDelete">Delete</button>
      </div>
    </div>
  `;
  document.body.appendChild(deleteModal);

  const deleteInfo = deleteModal.querySelector("#deletePlacementInfo");
  const cancelDelete = deleteModal.querySelector("#cancelDelete");
  const confirmDelete = deleteModal.querySelector("#confirmDelete");
  let placementToDelete = null;

  function openDeleteModal(placementId) {
    const placement = placements.find(p => p._id === placementId);
    if (!placement) return alert("Placement not found!");

    placementToDelete = placementId;

    deleteInfo.innerHTML = `
      <p style="margin-bottom: 15px;">Are you sure you want to delete this placement record?</p>
      <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: left;">
        <p style="margin: 0 0 8px 0; font-weight: 600; color: #333;">${placement.alumniName}</p>
        <p style="margin: 0; color: #666; font-size: 0.9em;">Training: ${placement.trainingName}</p>
      </div>
      <p style="margin-top: 15px; color: #dc3545; font-size: 0.9em;">This action cannot be undone.</p>
    `;
    deleteModal.classList.add("show");
  }

  cancelDelete.addEventListener("click", () => {
    deleteModal.classList.remove("show");
    placementToDelete = null;
  });

  window.addEventListener("click", e => {
    if (e.target === deleteModal) {
      deleteModal.classList.remove("show");
      placementToDelete = null;
    }
  });

  confirmDelete.addEventListener("click", async () => {
    if (!placementToDelete) return;

    try {
      const response = await fetch("/.netlify/functions/deletePlacement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: placementToDelete })
      });

      if (!response.ok) throw new Error(await response.text());

      alert("✅ Placement deleted successfully!");
      deleteModal.classList.remove("show");
      placementToDelete = null;
      fetchPlacements();
    } catch (err) {
      console.error(err);
      alert("Error deleting placement: " + err.message);
    }
  });

  // Initial load
  setupInputValidation();
  fetchStudents(); // Load students for autocomplete
  fetchPlacements();
  updatePaginationInfo();
});
