document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("courseSearch");
  const coursesContainer = document.getElementById("coursesContainer");

  console.log("In trainer courses js file")

  let courses = [];

  // Fetch trainer courses from backend
  async function fetchTrainerCourses() {
    try {
      const trainerId = sessionStorage.getItem("userId");
      if (!trainerId) {
        coursesContainer.innerHTML = `<p style="color:red;">Trainer ID not found in session</p>`;
        return;
      }

      const response = await fetch("/.netlify/functions/fetchTrainerCourses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trainerId }),
      });

      if (!response.ok) throw new Error("Failed to fetch trainer courses");
      courses = await response.json();
      console.log("trainer courses : ", courses);
      renderCourses();
    } catch (err) {
      console.error(err);
      coursesContainer.innerHTML = `<p style="color:red;">Error loading courses</p>`;
    }
  }

  // Render trainer courses
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
            <p><strong>Duration:</strong> ${course.durationMonths} months</p>
            <p class="full-width"><strong>Center:</strong> ${course.location}</p>
          </div>
        </div>
        <div class="card-footer">
            <div class="footer-actions">
                <button class="edit-btn fill-row" data-id="${course.courseId}">
                    <i class="fas fa-edit"></i> Update Course
                </button>
            </div>
        </div>
      `;
      coursesContainer.appendChild(card);
    });

    // Edit (Update Course) button click
    document.querySelectorAll(".edit-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const courseId = e.currentTarget.dataset.id;
        // 👉 Open your update modal / page here
        console.log("Update course:", courseId);
        alert(`Update functionality for ${courseId} to be implemented`);
      });
    });
  }

  // Search filter
  searchInput.addEventListener("input", (e) => renderCourses(e.target.value));

  // Initial load
  fetchTrainerCourses();
});
