document.addEventListener("DOMContentLoaded", async () => {
  const studentTableBody = document.getElementById("studentTableBody");
  const searchInput = document.getElementById("searchInput");
  const statusFilter = document.getElementById("statusFilter");
  const courseFilter = document.getElementById("courseFilter");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const pageInfo = document.getElementById("page-info");
  const viewModal = document.getElementById("viewModal");
  const closeBtn = document.querySelector(".close-btn");

  const rowsPerPage = 5;
  let currentPage = 1;
  let studentsData = [];
  let trainerCourses = [];
  let enrollments = [];

  // ✅ Fetch students & courses from backend
  async function fetchTrainerData() {
    try {
      const trainerId = sessionStorage.getItem("userId");
      if (!trainerId) throw new Error("Trainer ID not found in sessionStorage");

      const response = await fetch("/.netlify/functions/getTrainerStudentsData", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trainerId })
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const { courses, students, enrollments: enrollData } = await response.json();
      studentsData = students || [];
      trainerCourses = courses || [];
      enrollments = enrollData || [];

      populateFilters();
      applyFilters();
    } catch (error) {
      console.error("Error fetching trainer data:", error);
      studentTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:red;">Failed to load students</td></tr>`;
    }
  }

  const allStatuses = ["All", "Approved", "Pending", "Rejected", "Inactive"];

  // ✅ Populate filters dynamically
  function populateFilters() {
    statusFilter.innerHTML = allStatuses.map(s => `<option value="${s}">${s}</option>`).join("");

    courseFilter.innerHTML = [
      `<option value="All">All</option>`,
      ...trainerCourses.map(c => `<option value="${c.courseId}">${c.courseName}</option>`)
    ].join("");
  }

  // Helper: get course name by studentId
  function getStudentCourses(studentId) {
    const enrolledCourses = enrollments
      .filter(e => e.studentIds.includes(studentId))
      .map(e => {
        const course = trainerCourses.find(c => c.courseId === e.courseId);
        return course ? course.courseName : e.courseId;
      });
    return enrolledCourses.join(", ") || "N/A";
  }

  // ✅ Render table
  function renderTable(data) {
    studentTableBody.innerHTML = "";
    if (data.length === 0) {
      studentTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No students found</td></tr>`;
      return;
    }

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginated = data.slice(start, end);

    paginated.forEach(student => {
      const statusClass = (student.approvalStatus || student.accountStatus || "").toLowerCase();
      const row = document.createElement("tr");
      const courseNames = getStudentCourses(student.userId);
      row.innerHTML = `
        <td>${student.userId || "N/A"}</td>
        <td>${student.candidateName || "N/A"}</td>
        <td>${student.email || "N/A"}</td>
        <td>${courseNames}</td>
        <td><span class="status ${statusClass}">${(student.accountStatus || "N/A").toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}</span></td>
        <td><button class="action-btn view-btn"><i class="fas fa-eye"></i> View</button></td>
      `;
      studentTableBody.appendChild(row);

      // View modal
      row.querySelector(".view-btn").addEventListener("click", () => {
        document.getElementById("modalStudentName").textContent = `${student.userId || ""} ${student.candidateName || ""}`;

        const table = document.getElementById("studentDetailsTable");
        table.innerHTML = `
          <tr><td colspan="2" class="group-title">Basic Information</td></tr>
          <tr><td><strong>User ID:</strong></td><td>${student.userId || "N/A"}</td></tr>
          <tr><td><strong>Name:</strong></td><td>${student.candidateName || "N/A"}</td></tr>
          <tr><td><strong>Email:</strong></td><td>${student.email || "N/A"}</td></tr>
          <tr><td><strong>Course:</strong></td><td>${courseNames}</td></tr>
          <tr><td><strong>Account Status:</strong></td><td>${(student.accountStatus || "N/A").toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}</td></tr>
          <tr><td colspan="2" class="group-title">Personal Details</td></tr>
          <tr><td><strong>Father/Husband Name:</strong></td><td>${student.fatherHusbandName || "N/A"}</td></tr>
          <tr><td><strong>Village Name:</strong></td><td>${student.villageName || "N/A"}</td></tr>
          <tr><td><strong>Taluk Name:</strong></td><td>${student.talukName || "N/A"}</td></tr>
          <tr><td><strong>District Name:</strong></td><td>${student.districtName || "N/A"}</td></tr>
          <tr><td><strong>Date of Birth:</strong></td><td>${student.dob || "N/A"}</td></tr>
          <tr><td><strong>Age:</strong></td><td>${student.age || "N/A"}</td></tr>
          <tr><td><strong>Gender:</strong></td><td>${student.gender || "N/A"}</td></tr>
          <tr><td><strong>Tribal:</strong></td><td>${student.tribal || "N/A"}</td></tr>
          <tr><td><strong>Person With Disability:</strong></td><td>${student.pwd || "N/A"}</td></tr>
          <tr><td colspan="2" class="group-title">Contact & Identification</td></tr>
          <tr><td><strong>Aadhaar Number:</strong></td><td>${student.aadharNumber || "N/A"}</td></tr>
          <tr><td><strong>Mobile Number:</strong></td><td>${student.candidatePhone || "N/A"}</td></tr>
          <tr><td><strong>Parent Mobile No:</strong></td><td>${student.parentPhone || "N/A"}</td></tr>
          <tr><td colspan="2" class="group-title">Additional Information</td></tr>
          <tr><td><strong>Family Members:</strong></td><td>${student.familyMembers || "N/A"}</td></tr>
          <tr><td><strong>Qualification:</strong></td><td>${student.qualification || "N/A"}</td></tr>
          <tr><td><strong>Caste:</strong></td><td>${student.caste || "N/A"}</td></tr>
          <tr><td><strong>Mobiliser Name:</strong></td><td>${student.mobiliserName || "N/A"}</td></tr>
        `;

        viewModal.style.display = "flex";
      });
    });

    updatePaginationInfo(data);
  }

  function updatePaginationInfo(data) {
    const totalPages = Math.ceil(data.length / rowsPerPage);
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  }

  // ✅ Apply search, status & course filters
  function applyFilters() {
    const searchTerm = (searchInput.value || "").toLowerCase();
    const statusValue = statusFilter.value.toLowerCase();
    const courseValue = courseFilter.value;

    const filtered = studentsData.filter(s => {
      const courseNames = getStudentCourses(s.userId).toLowerCase();
      const matchesSearch =
        (s.candidateName || "").toLowerCase().includes(searchTerm) ||
        courseNames.includes(searchTerm);

      const matchesStatus =
        statusValue === "all" ||
        (s.accountStatus.toLowerCase() === statusValue || s.approvalStatus.toLowerCase() === statusValue);

      const matchesCourse =
        courseValue === "All" || getStudentCourses(s.userId).split(", ").some(c => trainerCourses.find(tc => tc.courseName === c && tc.courseId === courseValue));

      return matchesSearch && matchesStatus && matchesCourse;
    });

    currentPage = 1;
    displayPage(currentPage, filtered);
    return filtered;
  }

  function displayPage(page, data) {
    renderTable(data);
  }

  // ✅ Pagination buttons
  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) currentPage--;
    applyFilters();
  });

  nextBtn.addEventListener("click", () => {
    const filtered = applyFilters();
    const totalPages = Math.ceil(filtered.length / rowsPerPage);
    if (currentPage < totalPages) currentPage++;
    applyFilters();
  });

  searchInput.addEventListener("input", applyFilters);
  statusFilter.addEventListener("change", applyFilters);
  courseFilter.addEventListener("change", applyFilters);

  // Close modal
  closeBtn.addEventListener("click", () => viewModal.style.display = "none");

  // ✅ Initial load
  fetchTrainerData();
});
