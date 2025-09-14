document.addEventListener('DOMContentLoaded', () => {
    const overallAttendanceRateElement = document.getElementById('overallAttendanceRate');
    const daysPresentElement = document.getElementById('daysPresent');
    const daysAbsentElement = document.getElementById('daysAbsent');
    const attendanceLogTableBody = document.getElementById('attendanceLogTableBody');
    const attendancePieChartCtx = document.getElementById('attendancePieChart').getContext('2d');

    // Dummy attendance data for demonstration
    // In a real application, this would come from a backend API,
    // filtered by the logged-in user.
    const attendanceRecords = [
        { date: '2025-06-01', courseName: 'Fashion Designing', status: 'Present', remarks: '' },
        { date: '2025-06-02', courseName: 'Fashion Designing', status: 'Absent', remarks: 'Sick leave' },
        { date: '2025-06-03', courseName: 'Fashion Designing', status: 'Present', remarks: '' },
        { date: '2025-06-04', courseName: 'Fashion Designing', status: 'Present', remarks: '' },
        { date: '2025-06-05', courseName: 'Fashion Designing', status: 'Late', remarks: 'Sick leave' },
        { date: '2025-06-01', courseName: 'Mobile Repair and Service', status: 'Present', remarks: '' },
        { date: '2025-06-02', courseName: 'Mobile Repair and Service', status: 'Present', remarks: '' },
        { date: '2025-06-03', courseName: 'Mobile Repair and Service', status: 'Absent', remarks: 'Sick leave' },
        { date: '2025-06-04', courseName: 'Mobile Repair and Service', status: 'Present', remarks: '' },
        { date: '2025-06-05', courseName: 'Mobile Repair and Service', status: 'Present', remarks: '' },
        { date: '2025-06-06', courseName: 'Electrician Assistant', status: 'Present', remarks: '' },
        { date: '2025-06-07', courseName: 'Electrician Assistant', status: 'Present', remarks: '' },
        { date: '2025-06-08', courseName: 'Electrician Assistant', status: 'Absent', remarks: 'Sick leave' },
    ];

    function calculateAttendanceSummary() {
        let totalDays = attendanceRecords.length;
        let presentCount = 0;
        let absentCount = 0;
        let lateCount = 0;
        let excusedCount = 0;

        attendanceRecords.forEach(record => {
            if (record.status === 'Present') {
                presentCount++;
            } else if (record.status === 'Absent') {
                absentCount++;
            } else if (record.status === 'Late') {
                lateCount++;
            } else if (record.status === 'Excused') {
                excusedCount++;
            }
        });

        const overallAttendancePercentage = totalDays > 0 ? ((presentCount / totalDays) * 100).toFixed(1) : 0;

        overallAttendanceRateElement.textContent = `${overallAttendancePercentage}%`;
        daysPresentElement.textContent = presentCount;
        daysAbsentElement.textContent = absentCount;

        // Update card styles based on attendance rate
        if (overallAttendancePercentage < 75 && overallAttendancePercentage >= 50) {
            overallAttendanceRateElement.parentElement.classList.add('warning');
            overallAttendanceRateElement.parentElement.classList.remove('danger');
        } else if (overallAttendancePercentage < 50) {
            overallAttendanceRateElement.parentElement.classList.add('danger');
            overallAttendanceRateElement.parentElement.classList.remove('warning');
        } else {
            overallAttendanceRateElement.parentElement.classList.remove('warning', 'danger');
        }

        return { presentCount, absentCount, lateCount, excusedCount, totalDays };
    }

    function displayAttendanceLog() {
        attendanceLogTableBody.innerHTML = ''; // Clear existing rows
        let hasRecords = false;

        attendanceRecords.forEach(record => {
            hasRecords = true;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${record.date}</td>
                <td>${record.courseName}</td>
                <td>${record.status}</td>
                <td>${record.remarks || '-'}</td>
            `;
            attendanceLogTableBody.appendChild(row);
        });

        if (!hasRecords) {
            attendanceLogTableBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; padding: 20px; color: #555;">
                        No attendance data available yet.
                    </td>
                </tr>
            `;
        }
    }

    // Function to render the Pie Chart
    function renderAttendancePieChart(data) {
        new Chart(attendancePieChartCtx, {
            type: 'pie',
            data: {
                labels: ['Present', 'Absent', 'Late', 'Excused'],
                datasets: [{
                    data: [data.presentCount, data.absentCount, data.lateCount, data.excusedCount],
                    backgroundColor: [
                        'rgba(40, 167, 69, 0.8)',   // Green for Present
                        'rgba(220, 53, 69, 0.8)',    // Red for Absent
                        'rgba(255, 193, 7, 0.8)',    // Yellow for Late
                        'rgba(23, 162, 184, 0.8)'    // Cyan for Excused
                    ],
                    borderColor: [
                        'rgba(40, 167, 69, 1)',
                        'rgba(220, 53, 69, 1)',
                        'rgba(255, 193, 7, 1)',
                        'rgba(23, 162, 184, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, // Allows the chart to fit into the container
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Overall Attendance Distribution',
                        font: {
                            size: 16
                        },
                        color: '#333'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw;
                                const total = context.dataset.data.reduce((acc, current) => acc + current, 0);
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Initial load of data and chart
    const summaryData = calculateAttendanceSummary();
    displayAttendanceLog();
    renderAttendancePieChart(summaryData);
});