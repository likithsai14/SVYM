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
      const accountStatus = student.accountStatus || "active";
      let statusBgColor = "";
      if (accountStatus === "active") statusBgColor = "green";
      else if (accountStatus === "followUp1") statusBgColor = "orange";
      else if (accountStatus === "followUp2") statusBgColor = "red";
      else if (accountStatus === "droppedOut") statusBgColor = "darkred";

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${student.userId || "N/A"}</td>
        <td>${student.candidateName || "N/A"}</td>
        <td>${student.email || "N/A"}</td>
        <td><span class="status" style="background-color: ${statusBgColor}; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold;">${accountStatus.charAt(0).toUpperCase() + accountStatus.slice(1)}</span></td>
        <td>
          <button class="action-btn view-btn"><i class="fas fa-eye"></i> View</button>
          <button class="action-btn dropout-btn"><i class="fas fa-user-slash"></i> Drop Out</button>
        </td>
      `;
      studentTableBody.appendChild(row);

      // View Modal
      row.querySelector(".view-btn").addEventListener("click", () => {
        openViewStudentModal(student);
      });

      // Drop Out Button
      row.querySelector(".dropout-btn").addEventListener("click", () => {
        openDropoutModal(student);
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

  // ✅ View Student Modal (Tabular Format)
  function openViewStudentModal(student) {
    const table = document.getElementById("studentDetailsTable");
    table.innerHTML = '';

    const groups = [
      { title: 'Basic Details', fields: [
        ['User ID', student.userId],
        ['Name', student.candidateName],
        ['Status', student.accountStatus],
        ['Date of Birth', student.dob],
        ['Age', student.age],
        ['Gender', student.gender]
      ]},
      { title: 'Address Details', fields: [
        ['District', student.districtName],
        ['Taluk', student.talukName],
        ['Village', student.villageName]
      ]},
      { title: 'Contact Details', fields: [
        ['Email', student.email],
        ['Mobile', student.candidatePhone],
        ['Aadhaar Number', student.aadharNumber],
        ['Field Mobiliser', student.fieldMobiliserName]
      ]},
      { title: 'Other Details', fields: [
        ['Caste', student.caste],
        ['Tribal', student.tribal],
        ['Pwd', student.pwd],
        ['Education', student.qualification],
        ['Creation Date', new Date(student.createdAt).toLocaleDateString('en-IN')]
      ]}
    ];

    groups.forEach(group => {
      const trTitle = document.createElement('tr');
      const tdTitle = document.createElement('td');
      tdTitle.colSpan = 4;
      tdTitle.className = 'group-title';
      tdTitle.textContent = group.title;
      trTitle.appendChild(tdTitle);
      table.appendChild(trTitle);

      for (let i = 0; i < group.fields.length; i += 2) {
        const tr = document.createElement('tr');

        const [label1, value1] = group.fields[i];
        const td1 = document.createElement('td');
        td1.innerHTML = `<strong>${label1}</strong>`;
        const td2 = document.createElement('td');
        td2.textContent = value1 || 'N/A';
        tr.appendChild(td1);
        tr.appendChild(td2);

        if (i + 1 < group.fields.length) {
          const [label2, value2] = group.fields[i+1];
          const td3 = document.createElement('td');
          td3.innerHTML = `<strong>${label2}</strong>`;
          const td4 = document.createElement('td');
          td4.textContent = value2 || 'N/A';
          tr.appendChild(td3);
          tr.appendChild(td4);
        } else {
          const td3 = document.createElement('td'); td3.colSpan = 2; td3.textContent = '';
          tr.appendChild(td3);
        }

        table.appendChild(tr);
      }
    });

    document.getElementById("modalStudentName").textContent = `${student.userId} - ${student.candidateName}`;
    viewModal.style.display = "flex";
  }

  // ✅ Drop Out Modal
  function openDropoutModal(student) {
    const currentStatus = student.accountStatus || 'active';
    const nextStatuses = {
      'active': 'followUp1',
      'followUp1': 'followUp2',
      'followUp2': 'droppedOut'
    };

    const nextStatus = nextStatuses[currentStatus];
    if (!nextStatus) {
      alert('No further status update available for this student.');
      return;
    }

    document.getElementById("dropoutUserId").value = student.userId;
    document.getElementById("dropoutStudentName").value = student.candidateName;
    document.getElementById("dropoutStatus").innerHTML = `<option value="${nextStatus}">${nextStatus}</option>`;

    document.getElementById("dropoutModal").style.display = "flex";
  }

  // ✅ Handle Drop Out Form Submission
  document.getElementById("dropoutForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const userId = document.getElementById("dropoutUserId").value;
    const accountStatus = document.getElementById("dropoutStatus").value;

    try {
      const response = await fetch("/.netlify/functions/updateStudentAccountStatus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, accountStatus })
      });

      if (!response.ok) throw new Error("Failed to update status");

      alert("Student account status updated successfully.");
      document.getElementById("dropoutModal").style.display = "none";
      fetchMobiliserData(); // reload table
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update student account status.");
    }
  });

  // Close modals
  document.querySelectorAll('.close-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.modal').style.display = 'none';
    });
  });

  // ✅ Initial load
  fetchMobiliserData();
});
