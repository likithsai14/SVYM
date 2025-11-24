document.addEventListener("DOMContentLoaded", () => {
  const addAnnouncementBtn = document.getElementById("openAddAnnouncementModal");
  const modal = document.getElementById("addAnnouncementModal");
  const closeModal = document.getElementById("closeModal");
  const cancelModal = document.getElementById("cancelModal");
  const searchInput = document.getElementById("announcementSearch");
  const announcementsContainer = document.getElementById("announcementsContainer");
  const modalTitle = document.getElementById("modalTitle");
  const announcementForm = document.getElementById("announcementForm");
  const announcementTitle = document.getElementById("announcementTitle");
  
  // Function to convert to title case (capitalize first letter of every word)
  function toTitleCase(str) {
    return str.split(' ').map(word => {
      if(word.length === 0) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
  }

  // Auto capitalize first letter of each word in announcement title input
  if (announcementTitle) {
    announcementTitle.addEventListener('input', function() {
      this.value = toTitleCase(this.value);
    });
  }
  const eventDate = document.getElementById("eventDate");
  const announcementDescription = document.getElementById("announcementDescription");
  const errorMsg = document.getElementById("errorMsg");

  let announcements = [];
  let editingAnnouncementId = null;

  // Create and insert spinner element
  const spinner = document.createElement("div");
  spinner.id = "loadingSpinner";
  spinner.innerHTML = `
    <div class="spinner"></div>
    <p>Loading announcements...</p>
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
  announcementsContainer.parentNode.insertBefore(spinner, announcementsContainer);

  // Spinner animation keyframes
  const style = document.createElement("style");
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);

  // Fetch all announcements
  async function fetchAnnouncements() {
    spinner.style.display = "block";
    announcementsContainer.innerHTML = "";
    try {
      const response = await fetch("/.netlify/functions/getAnnouncements");
      if (!response.ok) throw new Error("Failed to fetch announcements");
      const data = await response.json();
      announcements = data.announcements || [];
      renderAnnouncements();
    } catch (err) {
      console.error(err);
      announcementsContainer.innerHTML = `<p style="color:red;">Error loading announcements</p>`;
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

  // Render announcements
  function renderAnnouncements(filter = "") {
    announcementsContainer.innerHTML = "";
    const filtered = announcements.filter(a =>
      a.title.toLowerCase().includes(filter.toLowerCase()) ||
      a.description.toLowerCase().includes(filter.toLowerCase())
    );

    if (filtered.length === 0) {
      announcementsContainer.innerHTML = "<p>No announcements found.</p>";
      return;
    }

    filtered.forEach(announcement => {
      const card = document.createElement("div");
      card.className = "course-card announcement-card";
      card.innerHTML = `
        <div class="card-header">
          <h3><i class="fas fa-bullhorn"></i> ${announcement.title}</h3>
        </div>
        <div class="card-body">
          <div style="margin-bottom: 15px; padding: 10px; background: #f0f8ff; border-left: 4px solid #2e4f8f; border-radius: 4px;">
            <div style="display: flex; align-items: center; gap: 8px; color: #2e4f8f; font-weight: 600;">
              <i class="fas fa-calendar-day"></i>
              <span>Event Date: ${formatDate(announcement.eventDate)}</span>
            </div>
          </div>
          <div class="announcement-text">${announcement.description}</div>
          <div class="announcement-meta">
            <div class="announcement-date">
              <i class="fas fa-clock"></i>
              <span>Posted: ${formatDateTime(announcement.createdAt)}</span>
            </div>
            ${announcement.createdAt !== announcement.updatedAt ? 
              `<div class="announcement-date">
                <i class="fas fa-edit"></i>
                <span>Updated: ${formatDateTime(announcement.updatedAt)}</span>
              </div>` : ''}
          </div>
        </div>
        <div class="card-footer">
          <div class="footer-actions">
            <button class="edit-btn" data-id="${announcement._id}">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="delete-button" data-id="${announcement._id}">
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
        </div>
      `;
      announcementsContainer.appendChild(card);
    });

    // Attach edit & delete handlers
    document.querySelectorAll(".edit-btn").forEach(btn =>
      btn.addEventListener("click", () => handleEdit(btn.dataset.id))
    );
    document.querySelectorAll(".delete-button").forEach(btn =>
      btn.addEventListener("click", () => openDeleteModal(btn.dataset.id))
    );
  }

  // Search functionality
  searchInput.addEventListener("input", e => renderAnnouncements(e.target.value));

  // Open Add Announcement Modal
  addAnnouncementBtn.addEventListener("click", () => {
    editingAnnouncementId = null;
    modalTitle.innerHTML = '<i class="fas fa-plus"></i> Add Announcement';
    announcementForm.reset();
    errorMsg.textContent = "";
    eventDate.min = new Date().toISOString().split('T')[0]; // Prevent past dates
    modal.classList.add("show");
    announcementTitle.focus();
  });

  // Close Modal
  closeModal.addEventListener("click", () => {
    modal.classList.remove("show");
    editingAnnouncementId = null;
  });

  cancelModal.addEventListener("click", () => {
    modal.classList.remove("show");
    editingAnnouncementId = null;
  });

  window.addEventListener("click", e => {
    if (e.target === modal) {
      modal.classList.remove("show");
      editingAnnouncementId = null;
    }
  });

  // Handle Edit
  async function handleEdit(announcementId) {
    const announcement = announcements.find(a => a._id === announcementId);
    if (!announcement) return alert("Announcement not found!");

    editingAnnouncementId = announcementId;
    modalTitle.innerHTML = '<i class="fas fa-edit"></i> Edit Announcement';
    announcementTitle.value = announcement.title;
    
    // Format date for input field (YYYY-MM-DD)
    const date = new Date(announcement.eventDate);
    eventDate.value = date.toISOString().split('T')[0];
    
    announcementDescription.value = announcement.description;
    errorMsg.textContent = "";
    modal.classList.add("show");
    announcementTitle.focus();
  }

  // Form Submit Handler
  announcementForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorMsg.textContent = "";

    const title = announcementTitle.value.trim();
    const date = eventDate.value;
    const description = announcementDescription.value.trim();

    // Validation
    if (!title) {
      errorMsg.textContent = "Please enter announcement title.";
      return;
    }

    if (title.length < 3) {
      errorMsg.textContent = "Title must be at least 3 characters.";
      return;
    }

    if (!date) {
      errorMsg.textContent = "Please select event date.";
      return;
    }

    // Validate event date is not in the past
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of today

    if (selectedDate < today) {
      errorMsg.textContent = "Event date cannot be in the past.";
      return;
    }

    if (!description) {
      errorMsg.textContent = "Please enter announcement description.";
      return;
    }

    if (description.length < 10) {
      errorMsg.textContent = "Description must be at least 10 characters.";
      return;
    }

    try {
      let response;
      if (editingAnnouncementId) {
        // Update existing announcement
        response = await fetch("/.netlify/functions/updateAnnouncement", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            id: editingAnnouncementId, 
            title,
            eventDate: date,
            description
          })
        });
      } else {
        // Add new announcement
        const userId = sessionStorage.getItem("userId");
        if (!userId) {
          errorMsg.textContent = "User session not found. Please login again.";
          return;
        }
        response = await fetch("/.netlify/functions/addAnnouncement", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            title,
            eventDate: date,
            description,
            addedBy: userId 
          })
        });
      }

      if (!response.ok) throw new Error(await response.text());

      alert(editingAnnouncementId ? "✅ Announcement updated successfully!" : "✅ Announcement added successfully!");
      modal.classList.remove("show");
      editingAnnouncementId = null;
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
      errorMsg.textContent = "Error saving announcement: " + err.message;
    }
  });

  // Delete Modal Setup
  const deleteModal = document.createElement("div");
  deleteModal.id = "deleteAnnouncementModal";
  deleteModal.className = "modal";
  deleteModal.innerHTML = `
    <div class="modal-content" style="max-width:400px;">
      <h3>Delete Announcement</h3>
      <hr>
      <div id="deleteAnnouncementInfo"></div>
      <hr>
      <div style="margin-top:20px; text-align:center;">
        <button id="cancelDelete">Cancel</button>
        <button id="confirmDelete">Delete</button>
      </div>
    </div>
  `;
  document.body.appendChild(deleteModal);

  const deleteInfo = deleteModal.querySelector("#deleteAnnouncementInfo");
  const cancelDelete = deleteModal.querySelector("#cancelDelete");
  const confirmDelete = deleteModal.querySelector("#confirmDelete");
  let announcementToDelete = null;

  function openDeleteModal(announcementId) {
    const announcement = announcements.find(a => a._id === announcementId);
    if (!announcement) return alert("Announcement not found!");

    announcementToDelete = announcementId;
    
    deleteInfo.innerHTML = `
      <p style="margin-bottom: 15px;">Are you sure you want to delete this announcement?</p>
      <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: left;">
        <p style="margin: 0 0 8px 0; font-weight: 600; color: #333;">${announcement.title}</p>
        <p style="margin: 0; color: #666; font-size: 0.9em;">Event Date: ${formatDate(announcement.eventDate)}</p>
      </div>
      <p style="margin-top: 15px; color: #dc3545; font-size: 0.9em;">This action cannot be undone.</p>
    `;
    deleteModal.classList.add("show");
  }

  cancelDelete.addEventListener("click", () => {
    deleteModal.classList.remove("show");
    announcementToDelete = null;
  });

  window.addEventListener("click", e => {
    if (e.target === deleteModal) {
      deleteModal.classList.remove("show");
      announcementToDelete = null;
    }
  });

  confirmDelete.addEventListener("click", async () => {
    if (!announcementToDelete) return;
    
    try {
      const response = await fetch("/.netlify/functions/deleteAnnouncement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: announcementToDelete })
      });

      if (!response.ok) throw new Error(await response.text());

      alert("✅ Announcement deleted successfully!");
      deleteModal.classList.remove("show");
      announcementToDelete = null;
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
      alert("Error deleting announcement: " + err.message);
    }
  });

  // Initial load
  fetchAnnouncements();
});
