document.addEventListener("DOMContentLoaded", () => {
  const addCourseBtn = document.getElementById("openAddCourseModal");
  const modal = document.getElementById("addCourseModal");
  const closeModal = document.getElementById("closeModal");
  const cancelModal = document.getElementById("cancelModal");
  const searchInput = document.getElementById("courseSearch");
  const coursesContainer = document.getElementById("coursesContainer");

  // Assign Trainer modal
  const assignModal = document.getElementById("assignTrainerModal");
  const closeAssignModal = document.getElementById("closeAssignModal");
  const cancelAssignModal = document.getElementById("cancelAssignModal");
  const trainerSelect = document.getElementById("trainerSelect");
  const assignTrainerForm = document.getElementById("assignTrainerForm");

  let courses = [];
  let selectedCourseId = null;

  // Fetch courses from DB
  async function fetchCourses() {
    try {
      const response = await fetch("/.netlify/functions/allCourses");
      if (!response.ok) throw new Error("Failed to fetch courses");
      courses = await response.json();
      renderCourses();
    } catch (err) {
      console.error(err);
      coursesContainer.innerHTML = `<p style="color:red;">Error loading courses</p>`;
    }
  }

  // Render courses
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
          ${
            !course.trainerId
              ? `<div class="assign-trainer">
                   <button class="assign-button" data-id="${course.courseId}">
                     <i class="fas fa-user-plus"></i> Assign Trainer
                   </button>
                 </div>`
              : ""
          }
        </div>
      `;
      coursesContainer.appendChild(card);
    });

    // Assign Trainer button click
    document.querySelectorAll(".assign-button").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        selectedCourseId = e.target.dataset.id;
        trainerSelect.innerHTML = `<option value="">Loading trainers...</option>`;
        assignModal.classList.add("show");

        try {
          const res = await fetch("/.netlify/functions/allTrainers");
          const data = await res.json();
          const trainers = data.trainers.filter(t => t.status === "Active");
          console.log(trainers);
          trainerSelect.innerHTML = trainers.map(t => `<option value="${t.userId}">${t.name}</option>`).join("");
        } catch (err) {
          console.error(err);
          trainerSelect.innerHTML = `<option value="">Error loading trainers</option>`;
        }
      });
    });
  }

  // Search filter
  searchInput.addEventListener("input", (e) => renderCourses(e.target.value));

  // Open/Close Add Course Modal
  addCourseBtn.addEventListener("click", () => modal.classList.add("show"));
  closeModal.addEventListener("click", () => modal.classList.remove("show"));
  cancelModal.addEventListener("click", () => modal.classList.remove("show"));
  window.addEventListener("click", e => { if (e.target === modal) modal.classList.remove("show"); });

  // Close Assign Trainer Modal
  closeAssignModal.addEventListener("click", () => assignModal.classList.remove("show"));
  cancelAssignModal.addEventListener("click", () => assignModal.classList.remove("show"));
  window.addEventListener("click", e => { if (e.target === assignModal) assignModal.classList.remove("show"); });

  // Assign Trainer form submit
  assignTrainerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const trainerId = trainerSelect.value;
    if (!trainerId) return alert("Select a trainer");

    try {
      const res = await fetch("/.netlify/functions/assignTrainer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: selectedCourseId, trainerId })
      });
      if (!res.ok) throw new Error("Failed to assign trainer");
      alert("Trainer assigned successfully!");
      assignModal.classList.remove("show");
      fetchCourses(); // Refresh courses
    } catch (err) {
      console.error(err);
      alert("Error assigning trainer");
    }
  });

  // Initial load
  fetchCourses();
});
