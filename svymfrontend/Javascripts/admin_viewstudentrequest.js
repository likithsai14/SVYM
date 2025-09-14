let totalrequests = 0;
let totalapproved = 0;
let totalrejected = 0;
let totalpending = 0;

document.addEventListener('DOMContentLoaded', async function () {
    const studentsData = [];

    try {
        const response = await fetch('/.netlify/functions/allstudents');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const fetchedData = await response.json();
        console.log('Fetched student data:', typeof fetchedData.students);

        for (const student of fetchedData.students) {
            // Map the approvalStatus string
            let status = student.approvalStatus.toLowerCase();
            if (!['pending', 'approved', 'rejected'].includes(status)) status = 'pending';

            studentsData.push({
                id: student._id,
                userId: student.userId,
                name: student.candidateName,
                email: student.email,
                course: student.supportedProject,
                status: status.charAt(0).toUpperCase() + status.slice(1) // Capitalize first letter
            });

            console.log(`Student ID: ${student._id}, Name: ${student.candidateName}, Email: ${student.email}, Course: ${student.supportedProject}, Status: ${student.approvalStatus}`);

            totalrequests++;
            if (status === 'approved') totalapproved++;
            else if (status === 'pending') totalpending++;
            else totalrejected++;
        }

        renderTable(studentsData);
    } catch (error) {
        console.error('Failed to fetch student data:', error);
        const tableBody = document.getElementById('studentTableBody');
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--danger-color);">
            Failed to load data. Please try again later.
        </td></tr>`;
    }

    function renderTable(data) {
        const tableBody = document.getElementById('studentTableBody');
        tableBody.innerHTML = '';

        data.forEach(student => {
            const row = document.createElement('tr');
            const statusClass = student.status.toLowerCase();

            const statusHtml = `<span class="status ${statusClass}">${student.status}</span>`;

            row.innerHTML = `
                <td>${student.userId}</td>
                <td>${student.name}</td>
                <td>${student.email}</td>
                <td>${student.course}</td>
                <td>${statusHtml}</td>
                <td>
                    <div class="actions">
                        <button class="action-btn approve-btn"><i class="fas fa-check"></i> Approve</button>
                        <button class="action-btn reject-btn"><i class="fas fa-trash-alt"></i> Reject</button>
                    </div>
                </td>
            `;

            const approveBtn = row.querySelector('.approve-btn');
            const rejectBtn = row.querySelector('.reject-btn');
            const statusElem = row.querySelector('.status');

            // Disable buttons if already approved/rejected
            if (statusClass === 'approved' || statusClass === 'rejected') {
                approveBtn.disabled = true;
                rejectBtn.disabled = true;
            }

            approveBtn.addEventListener('click', async () => {
                if (!confirm(`Are you sure you want to approve the request for student ID: ${student.userId}?`)) return;

                student.status = 'Approved';
                statusElem.textContent = 'Approved';
                statusElem.className = 'status approved';
                approveBtn.disabled = true;
                rejectBtn.disabled = true;

                totalapproved++;
                totalpending--;
                console.log('Total Requests:', totalrequests);
                console.log('Total Approved:', totalapproved);
                console.log('Total Rejected:', totalrejected);
                console.log('Total Pending:', totalpending);

                const requestBody = { studentId: student.id, approvalStatus: 'approved' };
                try {
                    const response = await fetch('/.netlify/functions/studentrequesthandler', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(requestBody)
                    });
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    console.log('Response from student request handler:', await response.json());
                } catch (error) {
                    console.error('Error updating student status:', error);
                }
            });

            rejectBtn.addEventListener('click', async () => {
                if (!confirm(`Are you sure you want to reject the request for student ID: ${student.userId}?`)) return;

                student.status = 'Rejected';
                statusElem.textContent = 'Rejected';
                statusElem.className = 'status rejected';
                approveBtn.disabled = true;
                rejectBtn.disabled = true;

                totalrejected++;
                totalpending--;
                console.log('Total Requests:', totalrequests);
                console.log('Total Approved:', totalapproved);
                console.log('Total Rejected:', totalrejected);
                console.log('Total Pending:', totalpending);

                const requestBody = { studentId: student.id, approvalStatus: 'rejected' };
                try {
                    const response = await fetch('/.netlify/functions/studentrequesthandler', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(requestBody)
                    });
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    console.log('Response from student request handler:', await response.json());
                } catch (error) {
                    console.error('Error updating student status:', error);
                }
            });

            tableBody.appendChild(row);
        });
    }

    function handleSearch() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const filteredData = studentsData.filter(student =>
            student.name.toLowerCase().includes(searchTerm) ||
            student.email.toLowerCase().includes(searchTerm) ||
            student.course.toLowerCase().includes(searchTerm)
        );
        renderTable(filteredData);
    }

    document.getElementById('searchInput').addEventListener('keyup', handleSearch);
    document.getElementById('searchBtn').addEventListener('click', handleSearch);

    renderTable(studentsData);

    function getStudentDashboardData() {
        return {
            totalRequests: totalrequests,
            totalApproved: totalapproved,
            totalRejected: totalrejected,
            totalPending: totalpending
        };
    }
});
