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

  // Example dummy data (replace with backend fetch)
  studentsData = [
    {
      id: 1, userId: "STU001", name: "Rahul Kumar", email: "rahul@example.com",
      course: "Java", status: "Approved", fatherHusbandName: "Ramesh Kumar",
      villageName: "Village A", talukName: "Taluk A", districtName: "District A",
      dob: "2000-01-01", age: 23, gender: "Male", tribal: "No", pwd: "No",
      aadharNumber: "123456789012", candidatePhone: "9876543210", parentPhone: "9123456780",
      familyMembers: 5, qualification: "B.Tech", caste: "General", mobiliserName: "Mobiliser 1"
    },
    {
      id: 2, userId: "STU002", name: "Priya Sharma", email: "priya@example.com",
      course: "Python", status: "Pending", fatherHusbandName: "Shyam Sharma",
      villageName: "Village B", talukName: "Taluk B", districtName: "District B",
      dob: "2001-05-12", age: 22, gender: "Female", tribal: "No", pwd: "No",
      aadharNumber: "234567890123", candidatePhone: "9876543211", parentPhone: "9123456781",
      familyMembers: 4, qualification: "B.Sc", caste: "OBC", mobiliserName: "Mobiliser 2"
    }
    // Add more as needed
  ];

  const allStatuses = ["All", "Approved", "Pending", "Rejected", "Inactive"];
  const allCourses = ["All", "Java", "Python", "Web Development", "Data Science", "AI/ML", "Cloud Computing"];

  // Populate dropdowns
  function populateFilters() {
    statusFilter.innerHTML = allStatuses.map(s => `<option value="${s}">${s}</option>`).join("");
    courseFilter.innerHTML = allCourses.map(c => `<option value="${c}">${c}</option>`).join("");
  }

  // Render simple table
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
      const row = document.createElement("tr");
      const statusClass = student.status.toLowerCase();
      row.innerHTML = `
        <td>${student.userId}</td>
        <td>${student.name}</td>
        <td>${student.email}</td>
        <td>${student.course}</td>
        <td><span class="status ${statusClass}">${student.status}</span></td>
        <td><button class="action-btn view-btn"><i class="fas fa-eye"></i> View</button></td>
      `;
      studentTableBody.appendChild(row);

      // View modal
      row.querySelector(".view-btn").addEventListener("click", () => {
        document.getElementById("modalStudentName").textContent = `${student.userId} ${student.name}`;
        document.getElementById("modalUserId").textContent = student.userId;
        document.getElementById("modalUserName").textContent = student.name;
        document.getElementById("modalUserEmail").textContent = student.email;
        document.getElementById("modalUserCourse").textContent = student.course;
        document.getElementById("modalUserStatus").textContent = student.status;
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
        mus.style.color = student.status === "Approved" ? "green" : student.status === "Rejected" ? "red" : "orange";
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

  function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const statusValue = statusFilter.value;
    const courseValue = courseFilter.value;

    const filtered = studentsData.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm) || s.course.toLowerCase().includes(searchTerm);
      const matchesStatus = statusValue === "All" || s.status === statusValue;
      const matchesCourse = courseValue === "All" || s.course === courseValue;
      return matchesSearch && matchesStatus && matchesCourse;
    });

    currentPage = 1;
    displayPage(currentPage, filtered);
    return filtered;
  }

  function displayPage(page, data) {
    renderTable(data);
  }

  // Pagination buttons
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

  // Filters
  searchInput.addEventListener("input", applyFilters);
  statusFilter.addEventListener("change", applyFilters);
  courseFilter.addEventListener("change", applyFilters);

  // Close modal
  closeBtn.addEventListener("click", () => viewModal.style.display = "none");

  // Initial load
  populateFilters();
  applyFilters();
});
