document.addEventListener("DOMContentLoaded", async () => {
  // -------------------------
  // Elements
  // -------------------------
  const spinner = document.getElementById("loadingSpinner");
  const tableBody = document.getElementById("fieldmobiliserTableBody");
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const pageInfo = document.getElementById("page-info");

  const addfieldmobiliserBtn = document.getElementById("addfieldmobiliser");
  const modal = document.getElementById("fieldMobilizerFormModal");
  const closeModalBtn = modal.querySelector(".close-btn");

  const signupForm = document.getElementById("fieldMobilizerForm");
  const messageDiv = document.getElementById("message");
  const generatedUserIdDiv = document.getElementById("generatedUserId");
  const adminApprovalMessageDiv = document.getElementById("adminapprovalMessage");

  const errorSpans = {
    FieldMobiliserName: document.getElementById("FieldMobiliserNameError"),
    FieldMobiliserEmailID: document.getElementById("FieldMobiliserEmailIDError"),
    FieldMobiliserMobileNo: document.getElementById("FieldMobiliserMobileNoError"),
    FieldMobiliserRegion: document.getElementById("FieldMobiliserRegionError"),
    FieldMobiliserSupportedProject: document.getElementById("FieldMobiliserSupportedProjectError")
  };

  const hamburger = document.getElementById("hamburger");
  const sideMenu = document.getElementById("sideMenu");
  const overlay = document.getElementById("overlay");

  // -------------------------
  // Field Mobiliser View Modal Elements
  // -------------------------
  const viewFieldModal = document.getElementById("viewFieldModal");
  const closeFieldBtn = viewFieldModal.querySelector(".close-btn");
  const fieldMobiliserDetailsTable = document.getElementById("fieldMobiliserDetailsTable");

  // -------------------------
  // Pagination / Table Data
  // -------------------------
  let fieldmobilisersData = [];
  let filteredData = [];
  let currentPage = 1;
  const rowsPerPage = 8;

  async function fetchData() {
    try {
      spinner.style.display = "flex";
      const response = await fetch("/.netlify/functions/allfieldmobilisers");
      const fetchedData = await response.json();

      fieldmobilisersData = fetchedData.fieldmobilisers.map(f => ({
        id: f.userId,
        name: f.FieldMobiliserName,
        email: f.FieldMobiliserEmailID,
        mobile: f.FieldMobiliserMobileNo,
        region: f.FieldMobiliserRegion,
        supportedProject: f.FieldMobiliserSupportedProject,
        addedBy: f.addedBy,
        status: f.accountStatus,
        createdAt: f.createdAt
      }));

      filteredData = [...fieldmobilisersData];
      renderTable();
      renderPagination();
    } catch (error) {
      console.error("Error fetching data:", error);
      tableBody.innerHTML = `<tr><td colspan="6" style="color:red;">Failed to load data.</td></tr>`;
    } finally {
      spinner.style.display = "none";
    }
  }

  function renderTable() {
    tableBody.innerHTML = "";
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedData = filteredData.slice(start, end);

    if (!paginatedData.length) {
      tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No records found.</td></tr>`;
      return;
    }

    paginatedData.forEach(data => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${data.id}</td>
        <td>${data.name}</td>
        <td>${data.email}</td>
        <td>${data.supportedProject}</td>
        <td><span class="status ${data.status.toLowerCase()}">${data.status}</span></td>
        <td>
          <button class="view-btn action-btn" data-id="${data.id}">
            <i class="fas fa-eye"></i> View
          </button>
        </td>
      `;
      tableBody.appendChild(row);
    });

    // Attach click events to view buttons
    document.querySelectorAll(".view-btn").forEach(btn => {
      btn.addEventListener("click", e => {
        const id = e.currentTarget.dataset.id;
        const selected = fieldmobilisersData.find(d => d.id === id);
        if (selected) {
          populateFieldMobiliserModal(selected);
          viewFieldModal.style.display = "flex";
        }
      });
    });
  }

  function populateFieldMobiliserModal(data) {
    fieldMobiliserDetailsTable.innerHTML = `
      <tr><td><strong>User ID</strong></td><td>${data.id}</td></tr>
      <tr><td><strong>Name</strong></td><td>${data.name}</td></tr>
      <tr><td><strong>Email</strong></td><td>${data.email}</td></tr>
      <tr><td><strong>Mobile</strong></td><td>${data.mobile}</td></tr>
      <tr><td><strong>Region</strong></td><td>${data.region}</td></tr>
      <tr><td><strong>Supported Project</strong></td><td>${data.supportedProject}</td></tr>
      <tr><td><strong>Added By</strong></td><td>${data.addedBy}</td></tr>
      <tr><td><strong>Status</strong></td><td>${data.status}</td></tr>
      <tr><td><strong>Created At</strong></td><td>${new Date(data.createdAt).toLocaleString()}</td></tr>
    `;
  }

  closeFieldBtn.addEventListener("click", () => viewFieldModal.style.display = "none");
  window.addEventListener("click", e => { if (e.target === viewFieldModal) viewFieldModal.style.display = "none"; });

  function renderPagination() {
    const totalPages = Math.ceil(filteredData.length / rowsPerPage) || 1;
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
  }

  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) { currentPage--; renderTable(); renderPagination(); }
  });

  nextBtn.addEventListener("click", () => {
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    if (currentPage < totalPages) { currentPage++; renderTable(); renderPagination(); }
  });

  function handleSearch() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    filteredData = searchTerm
      ? fieldmobilisersData.filter(f => f.name.toLowerCase().includes(searchTerm))
      : [...fieldmobilisersData];
    currentPage = 1;
    renderTable();
    renderPagination();
  }

  searchBtn.addEventListener("click", handleSearch);
  searchInput.addEventListener("keyup", e => { if (e.key === "Enter") handleSearch(); });

  // -------------------------
  // Modal Controls
  // -------------------------
  addfieldmobiliserBtn.addEventListener("click", () => {
    // Clear previous messages
    messageDiv.style.display = "none";
    generatedUserIdDiv.style.display = "none";
    adminApprovalMessageDiv.style.display = "none";

    // Clear previous input errors
    signupForm.querySelectorAll("input, select").forEach(input => {
      input.classList.remove("input-error");
      const errorSpan = errorSpans[input.id];
      if (errorSpan) errorSpan.textContent = "";
    });

    modal.classList.add("show");
  });
  closeModalBtn.addEventListener("click", () => modal.classList.remove("show"));
  overlay.addEventListener("click", () => {
    sideMenu.classList.remove("active");
    overlay.classList.remove("active");
    modal.classList.remove("show");
  });

  // -------------------------
  // Hamburger Menu
  // -------------------------
  if (hamburger && sideMenu && overlay) {
    hamburger.addEventListener("click", () => {
      sideMenu.classList.toggle("active");
      overlay.classList.toggle("active");
    });
  }

  // -------------------------
  // Add Field Mobiliser Form
  // -------------------------
  function showError(inputElement, message) {
    const errorSpan = errorSpans[inputElement.id];
    if (errorSpan) { errorSpan.textContent = message; inputElement.classList.add("input-error"); }
  }

  function clearError(inputElement) {
    const errorSpan = errorSpans[inputElement.id];
    if (errorSpan) { errorSpan.textContent = ""; inputElement.classList.remove("input-error"); }
  }

  signupForm.querySelectorAll("input, select").forEach(input => {
    input.addEventListener("input", () => { if (input.value.trim() !== "") clearError(input); });
    input.addEventListener("blur", () => {
      if (input.hasAttribute("required") && input.value.trim() === "") showError(input, "This field is required.");
      if (input.hasAttribute("pattern") && !input.validity.valid) showError(input, input.title || "Invalid format.");
    });
  });

  signupForm.addEventListener("submit", async e => {
    e.preventDefault();
    messageDiv.style.display = "none";
    generatedUserIdDiv.style.display = "none";
    adminApprovalMessageDiv.style.display = "none";

    let isValid = true;
    const formData = new FormData(signupForm);
    const data = {};
    for (let [key, value] of formData.entries()) data[key] = value.trim();

    const adminUserId = sessionStorage.getItem("userId");
    if (!adminUserId) { showMessage("error", "Admin session expired."); return; }
    data.addedBy = adminUserId;

    signupForm.querySelectorAll("input, select").forEach(input => {
      if (input.hasAttribute("required") && input.value.trim() === "") { showError(input, "This field is required."); isValid=false; }
      if (input.hasAttribute("pattern") && !input.validity.valid) { showError(input, input.title || "Invalid format."); isValid=false; }
    });

    if (!isValid) { showMessage("error", "Please correct the errors in the form."); return; }

    try {
      const response = await fetch("/.netlify/functions/fieldmobilisersignup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok) {
        showMessage("success", result.message || "Sign up successful!");
        generatedUserIdDiv.innerHTML = `Your User ID: <strong>${result.userId}</strong><br>Please remember this ID for login.`;
        generatedUserIdDiv.style.display = "block";
        signupForm.reset();
        adminApprovalMessageDiv.style.display = "block";
        fetchData(); // refresh table
      } else {
        showMessage("error", result.message || "Failed to sign up.");
      }
    } catch (error) {
      console.error(error);
      showMessage("error", "An error occurred while submitting.");
    }
  });

  function showMessage(type, text) {
    messageDiv.textContent = text;
    messageDiv.style.display = "block";
    messageDiv.style.color = type === "success" ? "green" : "red";
  }

  // -------------------------
  // Initial fetch
  // -------------------------
  fetchData();
});
