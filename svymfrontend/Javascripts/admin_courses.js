document.addEventListener("DOMContentLoaded", () => {
  const addCourseBtn = document.getElementById("openAddCourseModal");
  const modal = document.getElementById("addCourseModal");
  const closeModal = document.getElementById("closeModal");
  const cancelModal = document.getElementById("cancelModal");
  const searchInput = document.getElementById("courseSearch");
  const coursesContainer = document.getElementById("coursesContainer");

  let courses = [];
  let currentTrainers = [];
  let editingCourseId = null; // ✅ track if editing mode is active

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

  // Spinner animation keyframes
  const style = document.createElement("style");
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);

  // Fetch all courses
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

    // Attach edit & delete handlers
    document.querySelectorAll(".edit-btn").forEach(btn =>
      btn.addEventListener("click", () => handleEdit(btn.dataset.id))
    );
    document.querySelectorAll(".delete-button").forEach(btn =>
      btn.addEventListener("click", () => openDeleteModal(btn.dataset.id))
    );
  }

  searchInput.addEventListener("input", e => renderCourses(e.target.value));

  // Open Add Course Modal
  addCourseBtn.addEventListener("click", async () => {
    editingCourseId = null; // reset editing mode
    modal.classList.add("show");

    // Enable all fields for new course
    document.getElementById("trainingName").disabled = false;
    document.getElementById("price").disabled = false;
    document.getElementById("location").disabled = false;

    const form = document.getElementById("courseForm");
    form.reset();

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

  // Close Add Course Modal
  closeModal.addEventListener("click", () => modal.classList.remove("show"));
  cancelModal.addEventListener("click", () => modal.classList.remove("show"));
  window.addEventListener("click", e => { if (e.target === modal) modal.classList.remove("show"); });

  // ✅ EDIT COURSE HANDLER
  async function handleEdit(courseId) {
    const course = courses.find(c => c.courseId === courseId);
    if (!course) return alert("Course not found!");

    editingCourseId = courseId;

    // Open modal and populate
    modal.classList.add("show");

    document.getElementById("trainingName").value = course.courseName;
    document.getElementById("price").value = course.price;
    document.getElementById("startDate").value = course.startDate.split("T")[0];
    document.getElementById("endDate").value = course.endDate.split("T")[0];
    document.getElementById("duration").value = course.durationMonths;
    document.getElementById("description").value = course.description;
    document.getElementById("location").value = course.location;

    // Disable non-editable fields
    document.getElementById("trainingName").disabled = true;
    document.getElementById("price").disabled = true;
    document.getElementById("location").disabled = true;

    // Trainer
    const trainerSelect = document.getElementById("trainerSelect");
    try {
      const res = await fetch("/.netlify/functions/allTrainers");
      const data = await res.json();
      currentTrainers = data.trainers.filter(t => t.status === "Active");
      trainerSelect.innerHTML = `<option value="">Select Trainer</option>
        <option value="addNewTrainer">+ Add New Trainer</option>
        ${currentTrainers.map(t => `<option value="${t.trainerId}">${t.name}</option>`).join("")}`;
      const trainer = currentTrainers.find(t => t.name === course.trainerName);
      if (trainer) trainerSelect.value = trainer.trainerId;
    } catch (err) {
      console.error(err);
    }

    // Modules
    const modulesWrapper = document.getElementById("modulesWrapper");
    modulesWrapper.innerHTML = "";
    const moduleRow = document.createElement("div");
    moduleRow.className = "module-row";
    moduleRow.style.display = "flex";
    moduleRow.style.flexWrap = "wrap";
    course.moduleNames.forEach(m => {
      const div = document.createElement("div");
      div.className = "module-input";
      div.style.display = "flex";
      div.style.alignItems = "center";
      div.innerHTML = `
        <input type="text" name="moduleNames" class="moduleName" value="${m}" required style="flex:1; padding:5px; margin-right:5px;">
        <button type="button" class="icon-btn removeBtn">X</button>
      `;
      div.querySelector(".removeBtn").addEventListener("click", () => div.remove());
      moduleRow.appendChild(div);
    });
    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "icon-btn";
    addBtn.textContent = "+";
    addBtn.style.marginLeft = "5px";
    addBtn.addEventListener("click", () => moduleRow.insertBefore(createModuleInput(), addBtn));
    moduleRow.appendChild(addBtn);
    modulesWrapper.appendChild(moduleRow);
  }

  // ✅ DELETE MODAL CREATION
  const deleteModal = document.createElement("div");
  deleteModal.id = "deleteCourseModal";
  deleteModal.className = "modal";
  deleteModal.innerHTML = `
    <div class="modal-content" style="max-width:400px;">
      <h3>Delete Course</h3>
      <p id="deleteCourseInfo"></p>
      <div style="margin-top:20px; text-align:right;">
        <button id="cancelDelete" class="icon-btn" style="background:#ccc; width: auto; padding: 5px 10px;">Cancel</button>
        <button id="confirmDelete" class="icon-btn" style="background:#e74c3c; color:white;width: auto; padding: 5px 10px;">Delete</button>
      </div>
    </div>
  `;
  document.body.appendChild(deleteModal);

  const deleteInfo = deleteModal.querySelector("#deleteCourseInfo");
  const cancelDelete = deleteModal.querySelector("#cancelDelete");
  const confirmDelete = deleteModal.querySelector("#confirmDelete");
  let courseToDelete = null;

  function openDeleteModal(courseId) {
    const course = courses.find(c => c.courseId === courseId);
    if (!course) return alert("Course not found!");

    courseToDelete = courseId;
    deleteInfo.innerHTML = `
      <strong>Course ID:</strong> ${course.courseId}<br>
      <strong>Name:</strong> ${course.courseName}<br>
      <strong>Trainer:</strong> ${course.trainerName || "N/A"}
    `;
    deleteModal.classList.add("show");
  }

  cancelDelete.addEventListener("click", () => deleteModal.classList.remove("show"));
  window.addEventListener("click", e => { if (e.target === deleteModal) deleteModal.classList.remove("show"); });

  confirmDelete.addEventListener("click", async () => {
    if (!courseToDelete) return;
    try {
      const res = await fetch("/.netlify/functions/deleteCourse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: courseToDelete })
      });
      if (!res.ok) throw new Error(await res.text());
      alert("Course deleted successfully!");
      deleteModal.classList.remove("show");
      fetchCourses();
    } catch (err) {
      alert("Error deleting course: " + err.message);
    }
  });

  // ✅ Utility for module creation (same as add_course.js)
  function createModuleInput() {
    const div = document.createElement("div");
    div.className = "module-input";
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.innerHTML = `
      <input type="text" name="moduleNames" class="moduleName" placeholder="Module name" required style="flex:1; padding:5px; margin-right:5px;">
      <button type="button" class="icon-btn removeBtn">X</button>
    `;
    div.querySelector(".removeBtn").addEventListener("click", () => div.remove());
    return div;
  }

  // ✅ Intercept course form submit for update
  const form = document.getElementById("courseForm");
  form.addEventListener("submit", async e => {
    if (!editingCourseId) {
      // ✅ Normal Add handled in add_course.js
      return;
    }
    e.preventDefault();
    e.stopImmediatePropagation();

    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;
    const duration = document.getElementById("duration").value;
    const description = document.getElementById("description").value.trim();
    const moduleInputs = document.querySelectorAll(".moduleName");
    const moduleNames = Array.from(moduleInputs).map(i => i.value.trim()).filter(n => n);
    const trainerSelect = document.getElementById("trainerSelect");
    const trainerId = trainerSelect.value;
    const trainerName = trainerSelect.options[trainerSelect.selectedIndex]?.textContent || "";

    let trainerPayload = {};
    if (trainerId === "addNewTrainer") {
      // Collect new trainer details from form inputs
      const name = document.getElementById("formTrainerName").value.trim();
      const email = document.getElementById("formTrainerEmail").value.trim();
      const mobile = document.getElementById("formTrainerMobile").value.trim();
      const expertise = document.getElementById("formTrainerExpertise").value.trim();
      const securityQuestion = document.getElementById("formTrainerSecurityQuestion").value.trim();
      const securityAnswer = document.getElementById("formTrainerSecurityAnswer").value.trim();

      trainerPayload = {
        isNewTrainer: true,
        name,
        email,
        mobile,
        expertise,
        securityQuestion,
        securityAnswer
      };
    } else {
      trainerPayload = { trainerId, trainerName };
    }

    const payload = {
      courseId: editingCourseId,
      startDate,
      endDate,
      durationMonths: duration,
      description,
      moduleNames,
      trainer: trainerPayload  // <-- send nested object like addCourseWithTrainer
    };

    try {
      const res = await fetch("/.netlify/functions/updateCourse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(await res.text());
      alert("✅ Course updated successfully!");
      modal.classList.remove("show");
      editingCourseId = null;
      fetchCourses();
    } catch (err) {
      alert("Error updating course: " + err.message);
    }
  });

  // Initial load
  fetchCourses();
});
