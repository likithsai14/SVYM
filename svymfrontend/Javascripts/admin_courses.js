document.addEventListener("DOMContentLoaded", () => {
  const addCourseBtn = document.getElementById("openAddCourseModal");
  const modal = document.getElementById("addCourseModal");
  const closeModal = document.getElementById("closeModal");
  const cancelModal = document.getElementById("cancelModal");
  const searchInput = document.getElementById("courseSearch");
  const coursesContainer = document.getElementById("coursesContainer");

  let courses = [];
  let currentTrainers = [];

  // ✅ Create and insert spinner element
  const spinner = document.createElement("div");
  spinner.id = "loadingSpinner";
  spinner.innerHTML = `
    <div class="spinner"></div>
    <p>Loading courses...</p>
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
  coursesContainer.parentNode.insertBefore(spinner, coursesContainer);

  // Spinner animation keyframes (for CSS-less support)
  const style = document.createElement("style");
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);

  // Fetch courses with spinner
  async function fetchCourses() {
    spinner.style.display = "block";
    coursesContainer.innerHTML = "";
    try {
      const response = await fetch("/.netlify/functions/allCourses");
      if (!response.ok) throw new Error("Failed to fetch courses");
      courses = await response.json();
      renderCourses();
    } catch (err) {
      console.error(err);
      coursesContainer.innerHTML = `<p style="color:red;">Error loading courses</p>`;
    } finally {
      spinner.style.display = "none";
    }
  }

  function renderCourses(filter = "") {
    coursesContainer.innerHTML = "";
    const filtered = courses.filter(c =>
      c.courseName.toLowerCase().includes(filter.toLowerCase()) ||
      c.courseId.toLowerCase().includes(filter.toLowerCase())
    );

    if (filtered.length === 0) {
      coursesContainer.innerHTML = "<p>No courses found.</p>";
      return;
    }

    filtered.forEach(course => {
      const card = document.createElement("div");
      card.className = "course-card";
      card.innerHTML = `
        <div class="card-header">
          <h3>${course.courseId} - ${course.courseName}</h3>
          <div class="course-price">INR ${course.price.toLocaleString('en-IN')}</div>
        </div>
        <div class="card-body">
          <p>${course.description}</p>
          <div class="course-details-grid">
            <p><strong>Start Date:</strong> ${new Date(course.startDate).toLocaleDateString()}</p>
            <p><strong>End Date:</strong> ${new Date(course.endDate).toLocaleDateString()}</p>
            <p><strong>Duration:</strong> ${course.durationMonths} months</p>
            <p class="full-width"><strong>Center:</strong> ${course.location}</p>
            <p class="full-width"><strong>Trainer:</strong> ${course.trainerName || "N/A"}</p>
          </div>
        </div>
        <div class="card-footer">
          <div class="footer-actions">
            <button class="edit-btn" data-id="${course.courseId}">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="delete-button" data-id="${course.courseId}">
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
        </div>
      `;
      coursesContainer.appendChild(card);
    });
  }

  searchInput.addEventListener("input", e => renderCourses(e.target.value));

  // Open/Close Add Course Modal
  addCourseBtn.addEventListener("click", async () => {
    modal.classList.add("show");

    // Populate trainer dropdown
    const trainerSelect = document.getElementById("trainerSelect");
    trainerSelect.innerHTML = `<option value="">Loading...</option>`;
    try {
      const res = await fetch("/.netlify/functions/allTrainers");
      const data = await res.json();
      currentTrainers = data.trainers.filter(t => t.status === "Active");
      trainerSelect.innerHTML = `<option value="">Select Trainer</option>
        <option value="addNewTrainer">+ Add New Trainer</option>
        ${currentTrainers.map(t => `<option value="${t.trainerId}">${t.name}</option>`).join("")}`;
    } catch (err) {
      console.error(err);
      trainerSelect.innerHTML = `<option value="">Error loading trainers</option>`;
    }
  });

  closeModal.addEventListener("click", () => modal.classList.remove("show"));
  cancelModal.addEventListener("click", () => modal.classList.remove("show"));
  window.addEventListener("click", e => { if (e.target === modal) modal.classList.remove("show"); });

  // Initial load
  fetchCourses();
});
