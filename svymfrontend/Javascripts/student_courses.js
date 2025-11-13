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

      courseData = await coursesRes.json();
      courses = courseData.courses;
      enrollments = await enrollmentsRes.json();

      renderCourses();
    } catch (err) {
      console.error(err);
      coursesContainer.innerHTML = `<p style="color:red;">Error loading courses</p>`;
    }
  }

  function renderCourses(filter = "") {
    coursesContainer.innerHTML = "";

    if (enrollments.length > 0) {
      // Show enrolled course card
      const enrollment = enrollments[0]; // Only one enrollment per student
      const course = courses.find(c => c.courseId === enrollment.courseId);
      if (course) {
        const card = document.createElement("div");
        card.className = "course-card enrolled-course-card";
        card.innerHTML = `
          <div class="card-header">
            <h3>${course.courseId} - ${course.courseName}</h3>
            <div class="course-price">INR ${course.price.toLocaleString('en-IN')}</div>
          </div>
          <div class="card-body">
            <div class="course-status status-${course.courseStatus.toLowerCase()}">${course.courseStatus}</div>
            <p>${course.description}</p>
            <div class="course-details-grid">
              <p><strong>Start Date:</strong> ${formatDate(course.startDate)}</p>
              <p><strong>End Date:</strong> ${formatDate(course.endDate)}</p>
              <p><strong>Duration:</strong> ${course.durationMonths} months</p>
              <p class="full-width"><strong>Center:</strong> ${course.location}</p>
              <p><strong>Funded Amount:</strong> INR ${enrollment.fundedAmount ? enrollment.fundedAmount.toLocaleString('en-IN') : 0}</p>
              <p><strong>Amount to be Paid by Student:</strong> INR ${enrollment.totalPrice ? enrollment.totalPrice.toLocaleString('en-IN') : 0}</p>
            </div>
          </div>
          <div class="card-footer">
            <div class="footer-actions">
              <span class="enrolled-label">Enrolled in this Course</span>
            </div>
          </div>
        `;
        coursesContainer.appendChild(card);
      }
    } else {
      // No enrollment, show message
      coursesContainer.innerHTML = `
        <div class="no-enrollment-message">
          <p>No course assigned yet. Please contact your field mobiliser or admin.</p>
        </div>
      `;
    }
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
