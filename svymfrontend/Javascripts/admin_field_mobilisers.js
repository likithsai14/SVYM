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

  // Function to convert to title case
  function toTitleCase(str) {
    return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  }

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

  // Helper: display status in Title Case without changing stored value
  function formatStatusDisplay(status) {
    if (!status && status !== 0) return '-';
    const s = String(status).toLowerCase();
    if (s === 'active') return 'Active';
    if (s === 'inactive') return 'Inactive';
    // fallback: capitalize first letter
    return s.charAt(0).toUpperCase() + s.slice(1);
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
  <td><span class="status ${String(data.status || '').toLowerCase()}">${formatStatusDisplay(data.status)}</span></td>
        <td class="actions">
          <button class="action-btn view-btn" data-id="${data.id}"><i class="fas fa-eye"></i> View</button>
          <button class="action-btn edit-btn" data-id="${data.id}"><i class="fas fa-pen"></i> Edit</button>
          ${data.status && data.status.toLowerCase() === 'active'
            ? `<button class="action-btn deactivate-btn" data-id="${data.id}"><i class="fas fa-toggle-off"></i> Deactivate</button>`
            : `<button class="action-btn activate-btn" data-id="${data.id}"><i class="fas fa-toggle-on"></i> Activate</button>`
          }
        </td>
      `;
      tableBody.appendChild(row);
    });

    // Attach click events to action buttons
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

    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        const id = e.currentTarget.dataset.id;
        const selected = fieldmobilisersData.find(d => d.id === id);
        if (!selected) return;

        console.log('[admin_field_mobilisers] Edit clicked for userId:', id);

        // Prefill add modal form for edit
        const modal = document.getElementById('fieldMobilizerFormModal');
        const form = document.getElementById('fieldMobilizerForm');
        if (form) {
          form.querySelector('#FieldMobiliserName').value = selected.name || '';
          form.querySelector('#FieldMobiliserEmailID').value = selected.email || '';
          form.querySelector('#FieldMobiliserMobileNo').value = selected.mobile || '';
          form.querySelector('#FieldMobiliserRegion').value = selected.region || '';
          form.querySelector('#FieldMobiliserSupportedProject').value = selected.supportedProject || '';
          // store userId in the hidden field and update modal UI
          const userIdInput = form.querySelector('#FieldMobiliserUserId');
          if (userIdInput) userIdInput.value = selected.id;
          console.log('[admin_field_mobilisers] Set #FieldMobiliserUserId to', selected.id);
          const generated = document.getElementById('generatedUserId');
          if (generated) { generated.style.display = 'block'; generated.textContent = `Editing User: ${selected.id}`; }
          // change modal title and submit button text
          const modalTitle = modal.querySelector('h2');
          if (modalTitle) modalTitle.textContent = 'Edit FieldMobiliser Data';
          const submitBtn = form.querySelector('button[type="submit"]');
          if (submitBtn) submitBtn.textContent = 'Submit';
        }
        if (modal) modal.classList.add('show');
      });
    });

    document.querySelectorAll('.deactivate-btn').forEach(btn => {
      btn.addEventListener('click', () => updateFieldMobiliserStatus(btn.dataset.id, 'inActive'));
    });

    document.querySelectorAll('.activate-btn').forEach(btn => {
      btn.addEventListener('click', () => updateFieldMobiliserStatus(btn.dataset.id, 'active'));
    });
  }

  function populateFieldMobiliserModal(data) {
    fieldMobiliserDetailsTable.innerHTML = `
      <tr><td><strong>Field Mobiliser ID</strong></td><td>${data.id}</td></tr>
      <tr><td><strong>Name</strong></td><td>${data.name}</td></tr>
      <tr><td><strong>Email</strong></td><td>${data.email}</td></tr>
      <tr><td><strong>Mobile</strong></td><td>${data.mobile}</td></tr>
      <tr><td><strong>Region</strong></td><td>${data.region}</td></tr>
      <tr><td><strong>Supported Project</strong></td><td>${data.supportedProject}</td></tr>
      <tr><td><strong>Added By</strong></td><td>${data.addedBy}</td></tr>
  <tr><td><strong>Status</strong></td><td>${formatStatusDisplay(data.status)}</td></tr>
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
    // Ensure Add mode UI
    const form = document.getElementById('fieldMobilizerForm');
    if (form) {
      const userIdInput = form.querySelector('#FieldMobiliserUserId');
      if (userIdInput) userIdInput.value = '';
      const modalTitle = modal.querySelector('h2');
      if (modalTitle) modalTitle.textContent = 'Add FieldMobiliser Data';
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.textContent = 'Add Field Mobiliser';
      // also clear inputs
      form.querySelectorAll('input').forEach(inp => { if (inp.type !== 'hidden') inp.value = ''; });
      if (generatedUserIdDiv) generatedUserIdDiv.style.display = 'none';
    }
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
    for (let [key, value] of formData.entries()) {
      if (key === 'FieldMobiliserName') {
        data[key] = toTitleCase(value.trim());
      } else {
        data[key] = value.trim();
      }
    }

    const adminUserId = sessionStorage.getItem("userId");
    if (!adminUserId) { showMessage("error", "Admin session expired."); return; }
    data.addedBy = adminUserId;

    signupForm.querySelectorAll("input, select").forEach(input => {
      if (input.hasAttribute("required") && input.value.trim() === "") { showError(input, "This field is required."); isValid=false; }
      if (input.hasAttribute("pattern") && !input.validity.valid) { showError(input, input.title || "Invalid format."); isValid=false; }
    });

    if (!isValid) { showMessage("error", "Please correct the errors in the form."); return; }

    try {
      const userIdInput = signupForm.querySelector('#FieldMobiliserUserId');
      let response, result;
      if (userIdInput && userIdInput.value.trim() !== '') {
        // Edit flow
        console.log('[admin_field_mobilisers] Submit handler detected edit mode. FieldMobiliserUserId=', userIdInput.value);
        data.userId = userIdInput.value.trim();
        response = await fetch('/.netlify/functions/editFieldMobiliser', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        result = await response.json();
        if (response.ok) {
          showMessage('success', result.message || 'Update successful!');
          signupForm.reset();
          // hide edit marker
          userIdInput.value = '';
          if (generatedUserIdDiv) generatedUserIdDiv.style.display = 'none';
          // refresh table
          fetchData();
        } else {
          showMessage('error', result.message || 'Update failed. Please try again.');
        }
      } else {
        // Create flow
        console.log('[admin_field_mobilisers] Submit handler in create mode (no FieldMobiliserUserId)');
        response = await fetch('/.netlify/functions/fieldmobilisersignup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        result = await response.json();
        if (response.ok) {
          showMessage('success', result.message || 'Sign up successful!');
          generatedUserIdDiv.innerHTML = `Your User ID: <strong>${result.userId}</strong><br>Please remember this ID for login.`;
          generatedUserIdDiv.style.display = 'block';
          signupForm.reset();
          adminApprovalMessageDiv.style.display = 'block';
          fetchData(); // refresh table
        } else {
          showMessage('error', result.message || 'Failed to sign up.');
        }
      }
    } catch (error) {
      console.error(error);
      showMessage('error', 'An error occurred while submitting.');
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

  // expose for other scripts to call after edits
  window.fetchFieldMobilisers = fetchData;

  // -------------------------
  // Update Field Mobiliser Status (activate / deactivate)
  // -------------------------
  async function updateFieldMobiliserStatus(userId, newStatus) {
    const actionText = newStatus.toLowerCase() === 'active' ? 'activate' : 'deactivate';
    if (!confirm(`Are you sure you want to ${actionText} field mobiliser ${userId}?`)) return;

    try {
      const response = await fetch('/.netlify/functions/updateFieldMobiliserStatus', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: newStatus })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to update status');

      // Update local dataset and re-render
      const fm = fieldmobilisersData.find(f => f.id === userId);
      if (fm) fm.status = result.status || newStatus;
      renderTable();
      renderPagination();
    } catch (error) {
      console.error('Error updating field mobiliser status:', error);
      alert('Failed to update status.');
    }
  }
});
