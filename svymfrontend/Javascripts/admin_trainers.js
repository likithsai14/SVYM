document.addEventListener("DOMContentLoaded", function () {
  // =========================================================
  // --- Trainer Management Logic (CRUD Operations) ---
  // =========================================================

  const trainerModal = document.getElementById("addTrainerModal");
  const trainerModalTitle = document.getElementById("trainerModalTitle");
  const trainerForm = document.getElementById("addTrainerForm");

  const formTrainerId = document.getElementById("formTrainerId");
  const formTrainerName = document.getElementById("formTrainerName");
  const formTrainerExpertise = document.getElementById("formTrainerExpertise");
  const formTrainerContact = document.getElementById("formTrainerMobile");
  const formTrainerEmail = document.getElementById("formTrainerEmail");
  const formTrainerSecurityQuestion = document.getElementById("formTrainerSecurityQuestion");
  const formTrainerSecurityAnswer = document.getElementById("formTrainerSecurityAnswer");
  const formTrainerMessage = document.getElementById("trainerFormMessage");
  const generatedUserId = document.getElementById("generatedUserId");

  const addTrainerBtn = document.getElementById("openAddTrainerModal");
  const closeBtn = document.getElementById("closeAddTrainerModal");

  const trainersTableBody = document.getElementById("fieldmobiliserTableBody");
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");

  let allTrainers = [];
  let currentPage = 1;
  const rowsPerPage = 7; // pagination limit

  // ------------------ Spinner ------------------
  const spinner = document.createElement("div");
  spinner.id = "trainerSpinner";
  spinner.style.display = "none";
  spinner.innerHTML = '<div style="text-align:center; padding:20px;"><i class="fas fa-spinner fa-spin fa-2x"></i> Loading...</div>';
  trainersTableBody.parentElement.insertBefore(spinner, trainersTableBody);

  // ------------------ Show Add Trainer Modal ------------------
  addTrainerBtn.addEventListener("click", function () {
    openAddEditTrainerModal();
    trainerModal.classList.add("show");
    trainerModal.classList.remove("hide");
  });

  // ------------------ Close Modal ------------------
  closeBtn.addEventListener("click", () => {
    trainerModal.classList.remove("show");
    trainerModal.classList.add("hide");
  });

  window.addEventListener("click", (event) => {
    if (event.target === trainerModal) {
      trainerModal.classList.remove("show");
      trainerModal.classList.add("hide");
    }
  });

  // ------------------ Open Add/Edit Modal ------------------
  function openAddEditTrainerModal(userId = null) {
    if (!trainerModal) return;

    showFormMessage(formTrainerMessage, "", "");
    trainerForm.reset();
    generatedUserId.textContent = "";
    generatedUserId.style.display = "none";

    if (userId) {
      // Edit mode
      trainerModalTitle.textContent = `Edit Trainer: ${userId}`;
      formTrainerId.value = userId;

      const trainerToEdit = allTrainers.find((u) => u.trainerId === userId);

      if (trainerToEdit) {
        formTrainerName.value = trainerToEdit.name || "";
        formTrainerExpertise.value = trainerToEdit.expertise || "";
        formTrainerContact.value = trainerToEdit.mobile || "";
        formTrainerEmail.value = trainerToEdit.email || "";
        formTrainerSecurityQuestion.value = trainerToEdit.securityQuestion || "";
        formTrainerSecurityAnswer.value = trainerToEdit.securityAnswer || "";
        formTrainerId.setAttribute("disabled", "disabled");
        trainerModal.classList.add("show");
        trainerModal.classList.remove("hide");
      } else {
        showFormMessage(formTrainerMessage, "error", "Trainer not found for editing.");
        console.warn("Trainer not found for editing, userId:", userId);
      }
    } else {
      // Add mode
      trainerModalTitle.textContent = "Add Trainer Data";
      formTrainerId.value = "";
      formTrainerId.setAttribute("disabled", "disabled");
    }
  }

  // ------------------ View Trainer Modal ------------------
  function openViewTrainerModal(trainer) {
    const existingModal = document.getElementById("viewTrainerModal");
    if (existingModal) existingModal.remove();

    const modal = document.createElement("div");
    modal.id = "viewTrainerModal";
    modal.className = "modal show";
    modal.style.display = "block";
    modal.innerHTML = `
      <div class="modal-content">
        <button class="close-btn">&times;</button>
        <h2 style="text-align:center; margin-bottom:15px;">Trainer Details</h2>
        <table style="width:100%; border-collapse:collapse;">
          <tbody>
            <tr><td><b>Trainer ID</b></td><td>${trainer.trainerId}</td></tr>
            <tr><td><b>Name</b></td><td>${trainer.name}</td></tr>
            <tr><td><b>Email</b></td><td>${trainer.email}</td></tr>
            <tr><td><b>Expertise</b></td><td>${trainer.expertise}</td></tr>
            <tr><td><b>Phone</b></td><td>${trainer.mobile}</td></tr>
            <tr><td><b>Security Question</b></td><td>${trainer.securityQuestion}</td></tr>
            <tr><td><b>Security Answer</b></td><td>${trainer.securityAnswer}</td></tr>
            <tr><td><b>Status</b></td><td>${trainer.status}</td></tr>
          </tbody>
        </table>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector(".close-btn").addEventListener("click", () => modal.remove());
    window.addEventListener("click", (e) => { if (e.target === modal) modal.remove(); });
  }

  // ------------------ Trainer Form Submit ------------------
  if (trainerForm) {
    trainerForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      const isEditMode = formTrainerId && formTrainerId.value;

      if (!formTrainerContact.value && !formTrainerEmail.value) {
        showFormMessage(formTrainerMessage, "error", "Please provide at least one contact detail: Email or Phone.");
        return;
      }

      if (!formTrainerSecurityQuestion.value || !formTrainerSecurityAnswer.value) {
        showFormMessage(formTrainerMessage, "error", "Please provide security question and answer.");
        return;
      }

      if (formTrainerContact.value) {
        const mobileRegex = /^\d{10}$/; // exactly 10 digits
        if (!mobileRegex.test(formTrainerContact.value)) {
          showFormMessage(formTrainerMessage, "error", "Mobile number must be exactly 10 digits.");
          return;
        }
      }

      const newTrainerData = {
        name: formTrainerName.value,
        expertise: formTrainerExpertise.value,
        mobile: formTrainerContact.value,
        email: formTrainerEmail.value,
        securityQuestion: formTrainerSecurityQuestion.value,
        securityAnswer: formTrainerSecurityAnswer.value,
      };

      if (!isEditMode) {
        // Add trainer
        const newTrainer = {
          role: "trainer",
          ...newTrainerData,
          isFirstLogin: true,
          status: "Active",
        };

        try {
          const response = await fetch("/.netlify/functions/createTrainer", {
            body: JSON.stringify(newTrainer),
            method: "POST",
          });

          const trainer = await response.json();

          if (response.ok) {
            showFormMessage(formTrainerMessage, "success", "Trainer created successfully!");
            generatedUserId.style.display = "block";
            generatedUserId.textContent = `Generated User ID: ${trainer.trainerId}. Please share this with the trainer.`;
            trainerForm.reset();
            fetchTrainers();
          } else {
            showFormMessage(formTrainerMessage, "error", `Failed to create the trainer. ${trainer.message || ""}`);
          }
        } catch (error) {
          console.error("Error creating trainer:", error);
          showFormMessage(formTrainerMessage, "error", "Failed to create trainer. Please try again.");
        }
      } else {
        // Edit trainer
        const userIdToEdit = formTrainerId.value;

        try {
          const response = await fetch("/.netlify/functions/editTrainer", {
            body: JSON.stringify({ userId: userIdToEdit, ...newTrainerData }),
            method: "POST",
          });

          const trainer = await response.json();

          if (response.ok) {
            showFormMessage(formTrainerMessage, "success", `Trainer ${trainer.id} updated successfully!`);
            fetchTrainers();
          } else {
            showFormMessage(formTrainerMessage, "error", "Error: Trainer not found for update.");
            console.error("Trainer not found for update, userId:", userIdToEdit);
          }
        } catch (error) {
          console.error("Error updating trainer:", error);
          showFormMessage(formTrainerMessage, "error", "Failed to update trainer. Please try again.");
        }
      }
    });
  }

  // ------------------ Helper Functions ------------------
  function showFormMessage(element, type, message) {
    if (!element) return;
    element.textContent = message || "";
    element.className = type ? `form-message ${type}` : "form-message";
  }

  function updatePaginationInfo() {
    const searchValue = searchInput.value.toLowerCase();
    const filtered = allTrainers.filter((t) =>
      t.name.toLowerCase().includes(searchValue)
    );
    const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;
    document.getElementById("page-info").textContent = `Page ${currentPage} of ${totalPages}`;
    document.getElementById("prevBtn").disabled = currentPage === 1;
    document.getElementById("nextBtn").disabled = currentPage === totalPages;
  }

  // ------------------ Fetch Trainers ------------------
  async function fetchTrainers() {
    spinner.style.display = "block";
    try {
      const response = await fetch("/.netlify/functions/allTrainers");
      if (!response.ok) throw new Error("Failed to fetch trainers");
      const data = await response.json();
      allTrainers = data.trainers || [];
      renderTrainersTable();
    } catch (error) {
      console.error("Error fetching trainers:", error);
      trainersTableBody.innerHTML = '<tr><td colspan="6">Error loading trainers.</td></tr>';
    } finally {
      spinner.style.display = "none";
    }
  }

  // ------------------ Render Trainers ------------------
 function renderTrainersTable() {
  if (!trainersTableBody) return;
  trainersTableBody.innerHTML = "";

  const searchValue = searchInput.value.toLowerCase();
  const filtered = allTrainers.filter(trainer =>
    trainer.name.toLowerCase().includes(searchValue)
  );

  const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;
  if (currentPage > totalPages) currentPage = totalPages;

  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const paginatedTrainers = filtered.slice(start, end);

  if (paginatedTrainers.length === 0) {
    trainersTableBody.innerHTML = '<tr><td colspan="6">No trainers found.</td></tr>';
    updatePaginationInfo();
    return;
  }

  paginatedTrainers.forEach((trainer) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${trainer.trainerId}</td>
      <td>${trainer.name || "-"}</td>
      <td>${trainer.expertise || "-"}</td>
      <td><span class="status ${trainer.status.toLowerCase()}">${trainer.status}</span></td>
      <td class="actions">
        <button class="action-btn view-btn view-trainer-btn">
          <i class="fas fa-eye"></i> View
        </button>
        <button class="action-btn edit-btn edit-trainer-btn" data-trainer-id="${trainer.trainerId}">
          <i class="fas fa-pen"></i> Edit
        </button>
        ${
          trainer.status === "Active"
            ? `<button class="action-btn delete-btn deactivate-trainer-btn" data-trainer-id="${trainer.trainerId}">
                <i class="fas fa-toggle-off"></i> Deactivate
              </button>`
            : `<button class="action-btn activate-btn activate-trainer-btn" data-trainer-id="${trainer.trainerId}">
                <i class="fas fa-toggle-on"></i> Activate
              </button>`
        }
      </td>
    `;
    trainersTableBody.appendChild(tr);

    // Attach event listeners directly for this row
    tr.querySelector(".view-trainer-btn").addEventListener("click", () => openViewTrainerModal(trainer));
    tr.querySelector(".edit-trainer-btn").addEventListener("click", () => openAddEditTrainerModal(trainer.trainerId));

    if (trainer.status === "Active") {
      tr.querySelector(".deactivate-trainer-btn").addEventListener("click", () => updateTrainerStatus(trainer.trainerId, "Inactive"));
    } else {
      tr.querySelector(".activate-trainer-btn").addEventListener("click", () => updateTrainerStatus(trainer.trainerId, "Active"));
    }
  });

  updatePaginationInfo();
}


  //

  async function updateTrainerStatus(trainerId, newStatus) {
  const actionText = newStatus === "Active" ? "activate" : "deactivate";
  console.log("new data : ", trainerId, newStatus);
  if (!confirm(`Are you sure you want to ${actionText} trainer ${trainerId}?`)) return;

  try {
    const response = await fetch("/.netlify/functions/updateTrainerStatus", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trainerId, status: newStatus }),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to update");

    // Update local array
    const trainer = allTrainers.find((t) => t.trainerId === trainerId);
    if (trainer) trainer.status = newStatus;

    renderTrainersTable();
    showMainMessage("success", `Trainer ${userId} ${actionText}d successfully.`);
  } catch (error) {
    console.error(`Error trying to ${actionText} trainer:`, error);
    showMainMessage("error", `Error trying to ${actionText} trainer.`);
  }
}

  // ------------------ Pagination Controls ------------------
  document.getElementById("prevBtn").addEventListener("click", () => {
    if (currentPage > 1) currentPage--;
    renderTrainersTable();
  });
  document.getElementById("nextBtn").addEventListener("click", () => {
    currentPage++;
    renderTrainersTable();
  });

  // ------------------ Search Functionality ------------------
  searchBtn.addEventListener("click", () => {
    currentPage = 1;
    renderTrainersTable();
  });

  searchInput.addEventListener("input", () => {
  currentPage = 1; // reset to first page
  renderTrainersTable();
});


  // ------------------ Initial Fetch ------------------
  fetchTrainers();
});
