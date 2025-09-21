document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("courseSearch");
  const coursesContainer = document.getElementById("coursesContainer");

  // Modal elements
  const applyModal = document.getElementById("applyCourseModal");
  const closeApplyModal = document.getElementById("closeApplyModal");
  const totalCostEl = document.getElementById("totalCost");
  const amountPaidInput = document.getElementById("amountPaid");
  const paymentMethodSelect = document.getElementById("paymentMethod");
  const payApplyBtn = document.getElementById("payApplyBtn");

  let courses = [];
  let enrollments = [];
  let selectedCourse = null;
  const studentId = sessionStorage.getItem("userId");

  // Fetch all courses and student's enrollments
  async function fetchCourses() {
    try {
      const [coursesRes, enrollmentsRes] = await Promise.all([
        fetch("/.netlify/functions/allCourses"),
        fetch(`/.netlify/functions/studentEnrollments?studentId=${studentId}`)
      ]);

      if (!coursesRes.ok) throw new Error("Failed to fetch courses");
      if (!enrollmentsRes.ok) throw new Error("Failed to fetch enrollments");

      courses = await coursesRes.json();
      enrollments = await enrollmentsRes.json();

      renderCourses();
    } catch (err) {
      console.error(err);
      coursesContainer.innerHTML = `<p style="color:red;">Error loading courses</p>`;
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
      const isEnrolled = enrollments.some(e => e.courseId === course.courseId);

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
            ${
              isEnrolled
                ? `<span class="enrolled-label">Already Enrolled</span>`
                : `<button class="apply-btn" data-id="${course.courseId}">
                     <i class="fas fa-paper-plane"></i> Apply Course
                   </button>`
            }
          </div>
        </div>
      `;
      coursesContainer.appendChild(card);
    });

    // Apply Course button click
    document.querySelectorAll(".apply-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const courseId = e.currentTarget.dataset.id;
        selectedCourse = courses.find(c => c.courseId === courseId);
        if (!selectedCourse) return;

        // Show modal with total cost
        totalCostEl.textContent = `INR ${selectedCourse.price.toLocaleString("en-IN")}`;
        amountPaidInput.value = selectedCourse.price; // prefill full price, can edit for partial
        paymentMethodSelect.value = "";
        applyModal.classList.add("show");
      });
    });
  }

  // Close modal
  closeApplyModal.addEventListener("click", () => applyModal.classList.remove("show"));

  // Pay & Apply click
  payApplyBtn.addEventListener("click", async () => {
    const amountPaid = parseFloat(amountPaidInput.value);
    const paymentMethod = paymentMethodSelect.value;

    if (!amountPaid || amountPaid <= 0) return alert("Enter valid amount");
    if (amountPaid > selectedCourse.price) return alert("Amount cannot exceed total price");
    if (!paymentMethod) return alert("Select payment method");

    try {
      // Send total price along with partial payment
      console.log("selected course : ", selectedCourse);
      const res = await fetch("/.netlify/functions/applyAndPay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: selectedCourse.courseId,
          courseName: selectedCourse.courseName,
          studentId: studentId,
          totalPrice: selectedCourse.price, // send total course price
          amountPaid,
          paymentMethod
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to apply course");

      alert("Course applied and payment successful!");
      applyModal.classList.remove("show");
      fetchCourses(); // refresh courses and enrollment info
    } catch (err) {
      console.error(err);
      alert("Error applying course: " + err.message);
    }
  });

  searchInput.addEventListener("input", e => renderCourses(e.target.value));

  fetchCourses();
});
