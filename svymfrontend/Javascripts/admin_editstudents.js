document.addEventListener('DOMContentLoaded', async function() {
    const viewModal = document.getElementById('viewModal');
    const closeBtn = document.querySelector('.close-btn');
    const studentsData = [];
    const studentTableBody = document.getElementById('studentTableBody');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const statusFilter = document.getElementById('statusFilter');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const pageInfo = document.getElementById('page-info');
    const rowsPerPage = 5;
    let currentPage = 1;
    let allRows = [];
    let filteredRows = [];

    try {
        const response = await fetch('/.netlify/functions/allstudents');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const fetchedData = await response.json();

        fetchedData.students.forEach(student => {
            studentsData.push({
                id: student._id,
                userId: student.userId,
                name: student.candidateName,
                email: student.email,
                course: student.supportedProject,
                status: student.approvalStatus || 'Pending',
                fatherHusbandName: student.fatherHusbandName,
                villageName: student.villageName,
                talukName: student.talukName,
                districtName: student.districtName,
                dob: student.dob,
                age: student.age,
                gender: student.gender,
                tribal: student.tribal,
                pwd: student.pwd,
                aadharNumber: student.aadharNumber,
                candidatePhone: student.candidatePhone,
                parentPhone: student.parentPhone,
                familyMembers: student.familyMembers,
                qualification: student.qualification,
                caste: student.caste,
                mobiliserName: student.mobiliserName
            });
        });

        renderTable(studentsData);
        initPagination();
    } catch (error) {
        console.error('Failed to fetch student data:', error);
        studentTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--danger-color);">
            Failed to load data. Please try again later.
        </td></tr>`;
    }

    function renderTable(data) {
        studentTableBody.innerHTML = '';
        if (!Array.isArray(data) || data.length === 0) {
            studentTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--subtle-text);">No records found.</td></tr>`;
            return;
        }

        data.forEach(student => {
            const row = document.createElement('tr');
            const statusClass = (student.status || '').toLowerCase();
            const statusHtml = `<span class="status ${statusClass}">${escapeHtml(student.status || '')}</span>`;

            row.innerHTML = `
                <td>${escapeHtml(student.userId || '')}</td>
                <td>${escapeHtml(student.name || '')}</td>
                <td>${escapeHtml(student.email || '')}</td>
                <td>${escapeHtml(student.course || '')}</td>
                <td>${statusHtml}</td>
                <td>
                    <div class="actions">
                        <button class="action-btn view-btn"><i class="fas fa-eye"></i> View</button>
                        <button class="action-btn edit-btn"><i class="fas fa-edit"></i> Edit</button>
                        <button class="action-btn delete-btn"><i class="fas fa-trash-alt"></i> InActive</button>
                    </div>
                </td>
            `;

            row.querySelector('.view-btn').addEventListener('click', function() {
                document.getElementById('modalStudentName').textContent = `${student.userId} - ${student.name}`;
                populateModalTable(student);
                viewModal.style.display = 'flex';
            });

            row.querySelector('.edit-btn').addEventListener('click', function() {
                window.location.href = `admin_studentupdate.html?studentId=${encodeURIComponent(student.id)}`;
            });

            studentTableBody.appendChild(row);
        });

        updateRowCache();
    }

    function populateModalTable(student) {
    const table = document.getElementById('studentDetailsTable');
    table.innerHTML = '';

    const groups = [
        { title: 'Basic Details', fields: [
            ['User ID', student.userId], ['Name', student.name], ['Course', student.course],
            ['Status', student.status], ['Date of Birth', student.dob], ['Age', student.age], ['Gender', student.gender]
        ]},
        { title: 'Address Details', fields: [
            ['Village', student.villageName], ['Taluk', student.talukName], ['District', student.districtName]
        ]},
        { title: 'Contact Details', fields: [
            ['Email', student.email], ['Mobile', student.candidatePhone], ['Parent Mobile', student.parentPhone], ['Mobiliser Name', student.mobiliserName]
        ]},
        { title: 'Other Details', fields: [
            ['Father / Husband Name', student.fatherHusbandName], ['Tribal', student.tribal], ['PWD', student.pwd],
            ['Aadhar Number', student.aadharNumber], ['Family Members', student.familyMembers],
            ['Qualification', student.qualification], ['Caste', student.caste]
        ]}
    ];

    groups.forEach(group => {
        // Group Title
        const trTitle = document.createElement('tr');
        const tdTitle = document.createElement('td');
        tdTitle.colSpan = 4; // span across 4 columns (2 fields per row)
        tdTitle.className = 'group-title';
        tdTitle.textContent = group.title;
        trTitle.appendChild(tdTitle);
        table.appendChild(trTitle);

        // Display 2 fields per row
        for (let i = 0; i < group.fields.length; i += 2) {
            const tr = document.createElement('tr');

            // First field
            const [label1, value1] = group.fields[i];
            const td1 = document.createElement('td');
            td1.innerHTML = `<strong>${escapeHtml(label1)}</strong>`;
            const td2 = document.createElement('td');
            td2.textContent = value1 || 'N/A';

            tr.appendChild(td1);
            tr.appendChild(td2);

            // Second field (if exists)
            if (i + 1 < group.fields.length) {
                const [label2, value2] = group.fields[i + 1];
                const td3 = document.createElement('td');
                td3.innerHTML = `<strong>${escapeHtml(label2)}</strong>`;
                const td4 = document.createElement('td');
                td4.textContent = value2 || 'N/A';
                tr.appendChild(td3);
                tr.appendChild(td4);
            } else {
                // Fill empty cells if odd number of fields
                const td3 = document.createElement('td');
                td3.innerHTML = '';
                const td4 = document.createElement('td');
                td4.innerHTML = '';
                tr.appendChild(td3);
                tr.appendChild(td4);
            }

            table.appendChild(tr);
        }
    });
}


    closeBtn.addEventListener('click', () => viewModal.style.display = 'none');

    function escapeHtml(unsafe) {
        if (unsafe === null || unsafe === undefined) return '';
        return String(unsafe).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }

    function applyFiltersAndRender() {
        const searchTerm = (searchInput.value || '').trim().toLowerCase();
        const selectedStatus = (statusFilter.value || 'All').trim();

        const filtered = studentsData.filter(s => {
            const matchesSearch = !searchTerm ||
                (s.name || '').toLowerCase().includes(searchTerm) ||
                (s.email || '').toLowerCase().includes(searchTerm) ||
                (s.course || '').toLowerCase().includes(searchTerm) ||
                (s.userId || '').toLowerCase().includes(searchTerm);

            const matchesStatus = selectedStatus === 'All' ||
                ((s.status || '').toLowerCase() === selectedStatus.toLowerCase());

            return matchesSearch && matchesStatus;
        });

        currentPage = 1;
        renderTable(filtered);
        initPagination();
    }

    searchInput.addEventListener('keyup', applyFiltersAndRender);
    searchBtn.addEventListener('click', applyFiltersAndRender);
    statusFilter.addEventListener('change', applyFiltersAndRender);

    function updateRowCache() {
        const tableBody = document.querySelector('.data-table tbody');
        allRows = Array.from(tableBody.querySelectorAll('tr'));
        if (allRows.length === 1 && allRows[0].querySelectorAll('td').length === 1) {
            filteredRows = [];
            allRows = [];
            displayPage(1, []);
            return;
        }
        filteredRows = allRows.slice();
    }

    function initPagination() { updateRowCache(); currentPage = 1; displayPage(currentPage, filteredRows); }

    function displayPage(page, rowsArray) {
        const totalPages = Math.max(1, Math.ceil(rowsArray.length / rowsPerPage));
        const tableBody = document.querySelector('.data-table tbody');

        if (!rowsArray || rowsArray.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--subtle-text);">No records to display.</td></tr>`;
            pageInfo.textContent = `Page 0 of 0`;
            prevBtn.disabled = true;
            nextBtn.disabled = true;
            return;
        }

        allRows.forEach(r => r.style.display = 'none');

        const startIndex = (page - 1) * rowsPerPage;
        const endIndex = Math.min(startIndex + rowsPerPage, rowsArray.length);

        for (let i = startIndex; i < endIndex; i++) rowsArray[i].style.display = '';

        pageInfo.textContent = `Page ${page} of ${totalPages}`;
        prevBtn.disabled = page === 1;
        nextBtn.disabled = page >= totalPages;
    }

    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) { currentPage--; displayPage(currentPage, filteredRows); }
    });

    nextBtn.addEventListener('click', () => {
        const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
        if (currentPage < totalPages) { currentPage++; displayPage(currentPage, filteredRows); }
    });

});
