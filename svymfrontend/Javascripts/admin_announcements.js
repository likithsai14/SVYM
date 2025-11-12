document.addEventListener("DOMContentLoaded", () => {
  const addAnnouncementBtn = document.getElementById("addAnnouncementBtn");
  const addAnnouncementForm = document.getElementById("addAnnouncementForm");
  const announcementText = document.getElementById("announcementText");
  const saveAnnouncementBtn = document.getElementById("saveAnnouncementBtn");
  const cancelAnnouncementBtn = document.getElementById("cancelAnnouncementBtn");
  const announcementsList = document.getElementById("announcementsList");

  let announcements = [];
  let editingId = null;

  // Fetch announcements on load
  fetchAnnouncements();

  // Toggle add form
  addAnnouncementBtn.addEventListener("click", () => {
    addAnnouncementForm.style.display = "block";
    announcementText.focus();
    editingId = null;
    announcementText.value = "";
  });

  // Cancel add/edit
  cancelAnnouncementBtn.addEventListener("click", () => {
    addAnnouncementForm.style.display = "none";
    announcementText.value = "";
    editingId = null;
  });

  // Save announcement
  saveAnnouncementBtn.addEventListener("click", async () => {
    const text = announcementText.value.trim();
    if (!text) {
      alert("Please enter announcement text.");
      return;
    }

    try {
      let response;
      if (editingId) {
        // Update
        response = await fetch("/.netlify/functions/updateAnnouncement", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, text }),
        });
      } else {
        // Add new
        const user = JSON.parse(localStorage.getItem("user"));
        response = await fetch("/.netlify/functions/addAnnouncement", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, addedBy: user.userId }),
        });
      }

      if (!response.ok) throw new Error(await response.text());

      alert(editingId ? "Announcement updated successfully!" : "Announcement added successfully!");
      addAnnouncementForm.style.display = "none";
      announcementText.value = "";
      editingId = null;
      fetchAnnouncements();
    } catch (error) {
      alert("Error saving announcement: " + error.message);
    }
  });

  // Fetch announcements
  async function fetchAnnouncements() {
    try {
      const response = await fetch("/.netlify/functions/getAnnouncements");
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      announcements = data.announcements;
      renderAnnouncements();
    } catch (error) {
      console.error("Error fetching announcements:", error);
      announcementsList.innerHTML = "<p>Error loading announcements.</p>";
    }
  }

  // Render announcements
  function renderAnnouncements() {
    announcementsList.innerHTML = "";
    if (announcements.length === 0) {
      announcementsList.innerHTML = "<p>No announcements yet.</p>";
      return;
    }

    announcements.forEach((announcement) => {
      const div = document.createElement("div");
      div.className = "announcement-item";
      div.style.cssText = `
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 15px;
        background-color: #f9f9f9;
      `;

      const textDiv = document.createElement("div");
      textDiv.className = "announcement-text";
      textDiv.textContent = announcement.text;
      textDiv.style.cssText = `
        margin-bottom: 10px;
        white-space: pre-wrap;
      `;

      const editBtn = document.createElement("button");
      editBtn.className = "btn-secondary";
      editBtn.textContent = "Edit";
      editBtn.style.cssText = `
        padding: 5px 10px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      `;
      editBtn.addEventListener("click", () => editAnnouncement(announcement._id, announcement.text));

      div.appendChild(textDiv);
      div.appendChild(editBtn);
      announcementsList.appendChild(div);
    });
  }

  // Edit announcement
  function editAnnouncement(id, text) {
    editingId = id;
    announcementText.value = text;
    addAnnouncementForm.style.display = "block";
    announcementText.focus();
  }
});
