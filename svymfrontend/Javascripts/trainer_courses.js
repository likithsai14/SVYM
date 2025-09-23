document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("courseSearch");
  const coursesContainer = document.getElementById("coursesContainer");

  // ------------------ Update Course Modal Elements ------------------
  const updateModal = document.getElementById("updateCourseModal");
  const closeUpdateModal = document.getElementById("closeUpdateModal");
  const cancelUpdateModal = document.getElementById("cancelUpdateModal");
  const updateCourseForm = document.getElementById("updateCourseForm");

  const updateCourseId = document.getElementById("updateCourseId");
  const updateCourseName = document.getElementById("updateCourseName");
  const updatePrice = document.getElementById("updatePrice");
  const updateStartDate = document.getElementById("updateStartDate");
  const updateEndDate = document.getElementById("updateEndDate");
  const updateDuration = document.getElementById("updateDuration");
  const updateModulesWrapper = document.getElementById("updateModulesWrapper");
  const addMoreUpdateModuleBtn = document.getElementById("addMoreUpdateModuleBtn");
  const updateLocation = document.getElementById("updateLocation");
  const updateDescription = document.getElementById("updateDescription");

  let courses = [];

  // ------------------ Fetch Trainer Courses ------------------
  async function fetchTrainerCourses() {
    try {
      const trainerId = sessionStorage.getItem("userId");
      if (!trainerId) {
        coursesContainer.innerHTML = `<p style="color:red;">Trainer ID not found</p>`;
        return;
      }

      const response = await fetch("/.netlify/functions/fetchTrainerCourses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trainerId }),
      });

      if (!response.ok) throw new Error("Failed to fetch trainer courses");
      courses = await response.json();
      renderCourses();
    } catch (err) {
      console.error(err);
      coursesContainer.innerHTML = `<p style="color:red;">Error loading courses</p>`;
    }
  }

  // ------------------ Render Courses ------------------
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
          <div class="course-price">INR ${course.price.toLocaleString("en-IN")}</div>
        </div>
        <div class="card-body">
          <p>${course.description}</p>
          <div class="course-details-grid">
            <p><strong>Start Date:</strong> ${new Date(course.startDate).toLocaleDateString()}</p>
            <p><strong>End Date:</strong> ${new Date(course.endDate).toLocaleDateString()}</p>
            <p><strong>Duration:</strong> ${course.durationMonths || ""} months</p>
            <p class="full-width"><strong>Center:</strong> ${course.location}</p>
          </div>
        </div>
        <div class="card-footer">
          <div class="footer-actions">
            <button class="edit-btn" data-id="${course.courseId}">
              <i class="fas fa-edit"></i> Update Course
            </button>
          </div>
        </div>
      `;
      coursesContainer.appendChild(card);
    });

    // Attach update buttons
    document.querySelectorAll(".edit-btn").forEach(btn => {
      btn.addEventListener("click", e => {
        const courseId = e.currentTarget.dataset.id;
        const course = courses.find(c => c.courseId === courseId);
        if (course) openUpdateModal(course);
      });
    });
  }

  // ------------------ Search Filter ------------------
  searchInput.addEventListener("input", e => renderCourses(e.target.value));

  // ------------------ Update Course Modal Logic ------------------
  function openUpdateModal(course) {
    updateCourseId.value = course.courseId;
    updateCourseName.value = course.courseName;
    updatePrice.value = course.price;
    updateStartDate.value = new Date(course.startDate).toISOString().split("T")[0];
    updateEndDate.value = new Date(course.endDate).toISOString().split("T")[0];
    updateDuration.value = course.durationMonths || "";
    updateLocation.innerHTML = `<option>${course.location}</option>`;
    updateDescription.value = course.description || "";

    populateUpdateModules(course.moduleNames); // Populate previously saved modules
    updateModal.classList.add("show");
  }

  closeUpdateModal.addEventListener("click", () => updateModal.classList.remove("show"));
  cancelUpdateModal.addEventListener("click", () => updateModal.classList.remove("show"));
  window.addEventListener("click", e => { if (e.target === updateModal) updateModal.classList.remove("show"); });

  // ------------------ Modules Logic ------------------
  function populateUpdateModules(modules = []) {
    updateModulesWrapper.innerHTML = "";
    if (!modules || modules.length === 0) {
      addModuleInput("", true);
    } else {
      modules.forEach((mod, idx) => addModuleInput(mod, idx === 0));
    }
  }

  function addModuleInput(value = "", first = false) {
    const div = document.createElement("div");
    div.className = "module-input";
    div.style.display = "flex";
    div.style.flexWrap = "wrap";
    div.style.marginRight = "5px";
    div.style.marginBottom = "5px";

    div.innerHTML = `
      <input type="text" name="updateModuleNames" class="moduleName" placeholder="Enter module name" value="${value}" required style="flex:1; padding:5px; margin-right:5px;">
      ${first ? "" : `<button type="button" class="icon-btn removeBtn"> X </button>`}
    `;

    if (!first) {
      div.querySelector(".removeBtn").addEventListener("click", () => div.remove());
    }

    updateModulesWrapper.appendChild(div);
  }

  addMoreUpdateModuleBtn.addEventListener("click", () => addModuleInput());

  // ------------------ Duration Calculation ------------------
  function calculateUpdateDuration() {
    const start = new Date(updateStartDate.value);
    const end = new Date(updateEndDate.value);
    if (start && end && end >= start) {
      const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
      updateDuration.value = months > 0 ? months : 0;
    } else {
      updateDuration.value = "";
    }
  }

  updateStartDate.addEventListener("change", calculateUpdateDuration);
  updateEndDate.addEventListener("change", calculateUpdateDuration);

  // ------------------ Update Course Form Submit ------------------
  updateCourseForm.addEventListener("submit", async e => {
    e.preventDefault();

    const courseId = updateCourseId.value;
    const startDate = updateStartDate.value;
    const endDate = updateEndDate.value;
    const description = updateDescription.value.trim();

    const today = new Date();
    today.setHours(0,0,0,0);
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (!startDate || !endDate) return alert("Start and End dates are required.");
    if (start < today) return alert("Start date cannot be in the past.");
    if (end < start) return alert("End date must be after Start date.");
    if (!description) return alert("Description is required.");

    const moduleNames = Array.from(document.querySelectorAll(".moduleName"))
      .map(input => input.value.trim())
      .filter(name => name.length > 0);

    if (moduleNames.length === 0) return alert("At least one module is required.");

    const payload = { courseId, startDate, endDate, description, moduleNames };

    try {
      const res = await fetch("/.netlify/functions/updateTrainerCourse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update course");

      alert("Course updated successfully!");
      updateModal.classList.remove("show");
      fetchTrainerCourses();
    } catch (err) {
      console.error(err);
      alert("Error updating course");
    }
  });

  // ------------------ Initial Load ------------------
  fetchTrainerCourses();
});
