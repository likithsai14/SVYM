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
        <td><span class="status ${statusClass}">${student.approvalStatus || student.accountStatus || "N/A"}</span></td>
        <td><button class="action-btn view-btn"><i class="fas fa-eye"></i> View</button></td>
      `;
      studentTableBody.appendChild(row);

      // View modal
      row.querySelector(".view-btn").addEventListener("click", () => {
        document.getElementById("modalStudentName").textContent = `${student.userId || ""} ${student.candidateName || ""}`;
        document.getElementById("modalUserId").textContent = student.userId || "N/A";
        document.getElementById("modalUserName").textContent = student.candidateName || "N/A";
        document.getElementById("modalUserEmail").textContent = student.email || "N/A";
        document.getElementById("modalUserCourse").textContent = courseNames;
        document.getElementById("modalUserStatus").textContent = student.approvalStatus || student.accountStatus || "N/A";
        document.getElementById("modalUserFatherHusband").textContent = student.fatherHusbandName || "N/A";
        document.getElementById("modalUserVillageName").textContent = student.villageName || "N/A";
        document.getElementById("modalUserTalukName").textContent = student.talukName || "N/A";
        document.getElementById("modalUserDistrictName").textContent = student.districtName || "N/A";
        document.getElementById("modalUserDob").textContent = student.dob || "N/A";
        document.getElementById("modalUserAge").textContent = student.age || "N/A";
        document.getElementById("modalUserGender").textContent = student.gender || "N/A";
        document.getElementById("modalUserTribal").textContent = student.tribal || "N/A";
        document.getElementById("modalUserPWD").textContent = student.pwd || "N/A";
        document.getElementById("modalUserAadharNumber").textContent = student.aadharNumber || "N/A";
        document.getElementById("modalUserMobileNumber").textContent = student.candidatePhone || "N/A";
        document.getElementById("modalUserParentMobileNo").textContent = student.parentPhone || "N/A";
        document.getElementById("modalUserFamilyMembers").textContent = student.familyMembers || "N/A";
        document.getElementById("modalUserQualification").textContent = student.qualification || "N/A";
        document.getElementById("modalUserCaste").textContent = student.caste || "N/A";
        document.getElementById("modalUserMobiliserName").textContent = student.mobiliserName || "N/A";

        const mus = document.getElementById("modalUserStatus");
        const status = student.approvalStatus || student.accountStatus;
        mus.style.color = status === "approved" ? "green" :
                          status === "rejected" ? "red" :
                          status === "inactive" ? "gray" : "orange";
        mus.style.fontWeight = "bold";

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
