document.addEventListener("DOMContentLoaded", async () => {
  const studentTableBody = document.getElementById("studentTableBody");
  const searchInput = document.getElementById("searchInput");
  const statusFilter = document.getElementById("statusFilter");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const pageInfo = document.getElementById("page-info");
  const viewModal = document.getElementById("viewModal");
  const closeBtn = document.querySelector(".close-btn");

  const rowsPerPage = 5;
  let currentPage = 1;
  let studentsData = [];

  const allStatuses = ["All", "Active", "followUp1", "followUp2", "droppedOut"];

  // ✅ Fetch students from backend
  async function fetchMobiliserData() {
    try {
      const mobiliserId = sessionStorage.getItem("userId");
      console.log("front mobi", mobiliserId);
      if (!mobiliserId) throw new Error("Mobiliser ID not found in sessionStorage");

      const response = await fetch("/.netlify/functions/getFieldMobiliserStudents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fieldMobiliserId: mobiliserId })
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const { students } = await response.json();
      studentsData = students || [];

      populateFilters();
      applyFilters();
    } catch (error) {
      console.error("Error fetching mobiliser data:", error);
      studentTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:red;">Failed to load students</td></tr>`;
    }
  }

  // ✅ Populate filters
  function populateFilters() {
    statusFilter.innerHTML = allStatuses.map(s => `<option value="${s}">${s}</option>`).join("");
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
      row.innerHTML = `
        <td>${student.userId || "N/A"}</td>
        <td>${student.candidateName || "N/A"}</td>
        <td>${student.email || "N/A"}</td>
        <td><span class="status ${statusClass}">${student.approvalStatus || student.accountStatus || "N/A"}</span></td>
        <td>
          <button class="action-btn view-btn"><i class="fas fa-eye"></i> View</button>
          <button class="action-btn dropout-btn"><i class="fas fa-user-slash"></i> Drop Out</button>
        </td>
      `;
      studentTableBody.appendChild(row);

      // View Modal
      row.querySelector(".view-btn").addEventListener("click", () => {
        document.getElementById("modalStudentName").textContent = `${student.userId || ""} ${student.candidateName || ""}`;
        document.getElementById("modalUserId").textContent = student.userId || "N/A";
        document.getElementById("modalUserName").textContent = student.candidateName || "N/A";
        document.getElementById("modalUserEmail").textContent = student.email || "N/A";
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

        const mus = document.getElementById("modalUserStatus");
        const status = student.approvalStatus || student.accountStatus;
        mus.style.color = status === "approved" ? "green" :
                          status === "rejected" ? "red" :
                          status === "inactive" ? "gray" : "orange";
        mus.style.fontWeight = "bold";

        viewModal.style.display = "flex";
      });

      // Drop Out Button
      row.querySelector(".dropout-btn").addEventListener("click", async () => {
        if (!confirm(`Are you sure you want to mark ${student.candidateName} as Dropped Out?`)) return;

        try {
          const response = await fetch("/.netlify/functions/updateStudentStatus", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: student.userId, accountStatus: "DroppedOut" })
          });

          if (!response.ok) throw new Error("Failed to update status");

          alert("Student marked as Dropped Out.");
          fetchMobiliserData(); // reload table
        } catch (err) {
          console.error("Error updating status:", err);
          alert("Failed to update student status.");
        }
      });
    });

    updatePaginationInfo(data);
  }

  function updatePaginationInfo(data) {
    const totalPages = Math.ceil(data.length / rowsPerPage);
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  }

  // ✅ Apply search & filter
  function applyFilters() {
    const searchTerm = (searchInput.value || "").toLowerCase();
    const statusValue = statusFilter.value.toLowerCase();

    const filtered = studentsData.filter(s => {
      const matchesSearch = (s.candidateName || "").toLowerCase().includes(searchTerm);
      const matchesStatus = statusValue === "all" || 
        (s.accountStatus.toLowerCase() === statusValue || s.approvalStatus.toLowerCase() === statusValue);
      return matchesSearch && matchesStatus;
    });

    currentPage = 1;
    displayPage(currentPage, filtered);
    return filtered;
  }

  function displayPage(page, data) {
    renderTable(data);
  }

  // ✅ Pagination
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

  // Close modal
  closeBtn.addEventListener("click", () => viewModal.style.display = "none");

  // ✅ Initial load
  fetchMobiliserData();
});
