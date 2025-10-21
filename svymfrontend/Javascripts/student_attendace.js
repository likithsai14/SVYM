document.addEventListener('DOMContentLoaded', () => {
    const overallAttendanceRateElement = document.getElementById('overallAttendanceRate');
    const daysPresentElement = document.getElementById('daysPresent');
    const daysAbsentElement = document.getElementById('daysAbsent');
    const attendanceLogTableBody = document.getElementById('attendanceLogTableBody');

    // We'll fetch attendance dynamically for the logged-in student
    let attendanceRecords = [];

    async function fetchStudentAttendance() {
        try {
            const studentId = sessionStorage.getItem('userId');
            if (!studentId) {
                attendanceLogTableBody.innerHTML = `\n                    <tr>\n                        <td colspan="4" style="text-align:center;padding:20px;color:#555;">Please log in to view attendance.</td>\n                    </tr>`;
                return;
            }

            const res = await fetch('/.netlify/functions/getStudentAttendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId })
            });

            if (!res.ok) throw new Error('Failed to fetch attendance');

            const data = await res.json();
            console.log('Fetched attendance data:', data);
            // data.overall, data.courses
            // Convert courses summary into per-day records for the log view if needed
            attendanceRecords = []; // will build a simple log from per-course counts (best-effort)

            // For detailed per-session logs we would need the raw Attendance records. For now, render summaries and a generated log.
            // Populate overall cards and chart using returned overall/courses
            // Backend returns overall: { total, present, absent }
            const overall = data.overall || { total:0, present:0, absent:0 };
            const courses = data.courses || [];

            // Build a compact per-course summary list and render UI
            const summaryData = {
                presentCount: Number(overall.present || 0),
                absentCount: Number(overall.absent || 0),
                lateCount: 0,
                excusedCount: 0,
                totalDays: Number(overall.total || 0)
            };

            // Render per-course compact cards
            const container = document.getElementById('courseSummaryContainer');
            if (container) {
                container.innerHTML = '';
                if (!courses.length) {
                    container.innerHTML = '<p style="color:#555; text-align:center; padding:12px;">No attendance data available.</p>';
                } else {
                    const grid = document.createElement('div');
                    grid.style.display = 'flex';
                    grid.style.flexWrap = 'wrap';
                    grid.style.gap = '12px';

                    courses.forEach(c => {
                        const pct = c.totalDays ? Math.round((c.present / c.totalDays) * 100) : 0;
                        const card = document.createElement('div');
                        card.style.flex = '0 0 calc(33.333% - 12px)';
                        card.style.minWidth = '200px';
                        card.style.background = '#fff';
                        card.style.borderRadius = '10px';
                        card.style.padding = '12px';
                        card.style.boxShadow = '0 6px 18px rgba(0,0,0,0.04)';

                        card.innerHTML = `
                            <div style="font-weight:700;color:#004080;margin-bottom:6px">${c.courseName || c.courseId}</div>
                            <div style="font-size:0.95rem;color:#333;margin-bottom:8px">${c.present} / ${c.totalDays} days present (${pct}%)</div>
                            <div style="background:#f1f5f9;border-radius:8px;height:10px;overflow:hidden">
                                <div style="width:${pct}%;height:100%;background:linear-gradient(90deg,#28a745,#20a03a);"></div>
                            </div>
                        `;
                        grid.appendChild(card);
                    });

                    container.appendChild(grid);
                }
            }

            updateUIWithSummary(summaryData, []); // keep main summary and chart updated
        } catch (err) {
            console.error('Error fetching student attendance', err);
            attendanceLogTableBody.innerHTML = `\n                <tr>\n                    <td colspan="4" style="text-align: center; padding: 20px; color: #555;">Failed to load attendance data.</td>\n                </tr>`;
        }
    }

    function updateUIWithSummary(summary, records) {
        const { presentCount, absentCount, lateCount, excusedCount, totalDays } = summary;
        const overallAttendancePercentage = totalDays > 0 ? ((presentCount / totalDays) * 100).toFixed(1) : 0;

        overallAttendanceRateElement.textContent = `${overallAttendancePercentage}%`;
        daysPresentElement.textContent = presentCount;
        daysAbsentElement.textContent = absentCount;

        if (overallAttendancePercentage < 75 && overallAttendancePercentage >= 50) {
            overallAttendanceRateElement.parentElement.classList.add('warning');
            overallAttendanceRateElement.parentElement.classList.remove('danger');
        } else if (overallAttendancePercentage < 50) {
            overallAttendanceRateElement.parentElement.classList.add('danger');
            overallAttendanceRateElement.parentElement.classList.remove('warning');
        } else {
            overallAttendanceRateElement.parentElement.classList.remove('warning', 'danger');
        }

        // render table rows
        attendanceLogTableBody.innerHTML = '';
        if (!records || !records.length) {
            attendanceLogTableBody.innerHTML = `\n                <tr>\n                    <td colspan="4" style="text-align: center; padding: 20px; color: #555;">No attendance data available.</td>\n                </tr>`;
        } else {
            records.forEach(record => {
                const row = document.createElement('tr');
                row.innerHTML = `\n                    <td>${record.date}</td>\n                    <td>${record.courseName}</td>\n                    <td>${record.status}</td>\n                    <td>${record.remarks || '-'}</td>\n                `;
                attendanceLogTableBody.appendChild(row);
            });
        }

        // render chart
        renderAttendancePieChart({ presentCount, absentCount, lateCount, excusedCount });
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



    // Initial load of data and chart
    fetchStudentAttendance();

    // --- My Attendance modal ---
    const myAttendanceBtn = document.getElementById('myAttendanceBtn');

    function createMyAttendanceModal() {
        if (document.getElementById('myAttendanceModal')) return;

        // inject styles for the attendance boxes (only once)
        if (!document.getElementById('ma-box-styles')) {
            const s = document.createElement('style');
            s.id = 'ma-box-styles';
            s.textContent = `
            /* My Attendance boxes */
            .ma-grid{display:flex;flex-wrap:wrap;gap:12px;margin-top:12px}
            .ma-box{flex:0 0 calc(25% - 12px);background:#fff;border-radius:10px;padding:12px;box-shadow:0 6px 18px rgba(0,0,0,0.06);border:1px solid rgba(0,0,0,0.04);box-sizing:border-box;min-width:140px}
            .ma-box .ma-date{font-weight:600;color:#333;margin-bottom:8px}
            .ma-box .ma-status{display:inline-block;padding:6px 8px;border-radius:6px;color:#fff;font-weight:600;font-size:0.9rem}
            .ma-box.present .ma-status{background:linear-gradient(90deg,#28a745,#20a03a)}
            .ma-box.absent .ma-status{background:linear-gradient(90deg,#dc3545,#c82333)}
            .ma-box .ma-remarks{margin-top:8px;color:#555;font-size:0.9rem}
            @media (max-width:900px){ .ma-box{flex:0 0 calc(33.333% - 12px)} }
            @media (max-width:600px){ .ma-box{flex:0 0 calc(50% - 12px)} }
            @media (max-width:360px){ .ma-box{flex:0 0 100%} }
            `;
            document.head.appendChild(s);
        }

        const modal = document.createElement('div');
        modal.id = 'myAttendanceModal';
        modal.className = 'modal show';
        modal.style.display = 'none';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-btn" id="myAttendanceClose">&times;</span>
                <div class="modal-header"><h2>My Attendance</h2></div>
                <div class="modal-body">
                    <div style="display:flex;gap:10px;align-items:center;margin-bottom:12px;">
                        <select id="maCourseSelect" style="font-size:14px;font-family:'Poppins',sans-serif;"></select>
                        <select id="maMonthSelect" style="font-size:14px;font-family:'Poppins',sans-serif;"></select>
                        <select id="maYearSelect" style="font-size:14px;font-family:'Poppins',sans-serif;"></select>
                        <button id="maFetchBtn" >Get Attendance</button>
                    </div>
                    <div id="maMessage">Please select a course and month to get your attendance.</div>
                    <div id="maResults" style="margin-top:12px;"></div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        // close handler should also re-enable body scroll and clear results
        document.getElementById('myAttendanceClose').addEventListener('click', () => {
            modal.style.display = 'none';
            enableBodyScroll();
            const results = modal.querySelector('#maResults'); if (results) results.innerHTML = '';
            const msg = modal.querySelector('#maMessage'); if (msg) msg.textContent = 'Please select a course and month to get your attendance.';
        });
        // clicking outside modal-content closes modal
        modal.addEventListener('click', (ev) => {
            const content = modal.querySelector('.modal-content');
            if (!content) return;
            if (!content.contains(ev.target)) {
                modal.style.display = 'none';
                enableBodyScroll();
                const results = modal.querySelector('#maResults'); if (results) results.innerHTML = '';
                const msg = modal.querySelector('#maMessage'); if (msg) msg.textContent = 'Please select a course and month to get your attendance.';
            }
        });
        document.getElementById('maFetchBtn').addEventListener('click', fetchMyAttendanceForSelection);
    }

    function openMyAttendanceModal() {
        createMyAttendanceModal();
        populateMyAttendanceSelectors();
        const m = document.getElementById('myAttendanceModal');
        if (m) {
            // reset previous results/message
            const results = m.querySelector('#maResults'); if (results) results.innerHTML = '';
            const msg = m.querySelector('#maMessage'); if (msg) msg.textContent = 'Please select a course and month to get your attendance.';
            m.style.display = 'flex';
        }
        disableBodyScroll();
    }

    function disableBodyScroll(){
        try{ document.body.style.overflow = 'hidden'; }catch(e){}
    }

    function enableBodyScroll(){
        try{ document.body.style.overflow = ''; }catch(e){}
    }

    function populateMyAttendanceSelectors() {
        const courseSel = document.getElementById('maCourseSelect');
        const monthSel = document.getElementById('maMonthSelect');
        const yearSel = document.getElementById('maYearSelect');

        courseSel.innerHTML = '';
        monthSel.innerHTML = '';
        yearSel.innerHTML = '';

        // Courses — use last fetched courses from server (fetchStudentAttendance populates attendanceRecords as per-course summaries).
        // Better: call backend to get enrolled courses. For now, use the previously fetched overall courses from fetchStudentAttendance by calling it synchronously.
        // We'll fetch full data to ensure course names.
        (async () => {
            try {
                const studentId = sessionStorage.getItem('userId');
                if (!studentId) return;
                const res = await fetch('/.netlify/functions/getStudentAttendance', {
                    method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ studentId })
                });
                const data = await res.json();
                const courses = data.courses || [];
                if (!courses.length) {
                    courseSel.innerHTML = '<option value="">No courses found</option>';
                } else {
                    courseSel.innerHTML = '<option value="">Select course</option>' + courses.map(c=>`<option value="${c.courseId}">${c.courseName || c.courseId}</option>`).join('');
                }
            } catch (e) {
                courseSel.innerHTML = '<option value="">Failed to load</option>';
            }
        })();

        // Months
        const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        monthNames.forEach((m, i) => { const opt = document.createElement('option'); opt.value = String(i+1); opt.textContent = m; monthSel.appendChild(opt); });

        // Years: last 3 years
        const nowYear = new Date().getFullYear();
        for (let y = nowYear; y >= nowYear-3; y--) { const opt = document.createElement('option'); opt.value = String(y); opt.textContent = String(y); yearSel.appendChild(opt); }
    }

    async function fetchMyAttendanceForSelection() {
        const courseId = document.getElementById('maCourseSelect').value;
        const month = document.getElementById('maMonthSelect').value;
        const year = document.getElementById('maYearSelect').value;
        const msg = document.getElementById('maMessage');
        const results = document.getElementById('maResults');

        if (!courseId || !month || !year) { msg.textContent = 'Please select course, month and year.'; return; }
        msg.textContent = 'Loading...'; results.innerHTML = '';

        try {
            const studentId = sessionStorage.getItem('userId');
            const res = await fetch('/.netlify/functions/getStudentAttendance', {
                method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ studentId, courseId, month: Number(month), year: Number(year) })
            });
            const data = await res.json();
            if (!res.ok) { msg.textContent = data.message || 'Failed to fetch'; return; }

            const courses = data.courses || [];
            const c = courses.find(x=>x.courseId===courseId);
            if (!c) { msg.textContent = 'No attendance found for selected filters.'; return; }

            msg.textContent = `Total: ${data.overall.total || 0} Present: ${data.overall.present || 0} Absent: ${data.overall.absent || 0}`;

            // Render responsive boxes of dates
            const grid = document.createElement('div');
            grid.className = 'ma-grid';

            c.dates.sort((a,b)=>a.date.localeCompare(b.date)).forEach(d=>{
                const box = document.createElement('div');
                const present = !!d.present;
                const dt = new Date(d.date);
                // format like '24 Oct, 2025'
                const dateStr = isNaN(dt.getTime()) ? d.date : `${dt.getUTCDate()} ${dt.toLocaleString('en-US',{month:'short',timeZone:'UTC'})}, ${dt.getUTCFullYear()}`;
                box.className = 'ma-box ' + (present ? 'present' : 'absent');
                box.innerHTML = `
                    <div class="ma-date">${dateStr}</div>
                    <div class="ma-status">${present ? 'Present' : 'Absent'}</div>
                    <div class="ma-remarks">${present ? '-' : (d.remarks || '-')}</div>
                `;
                grid.appendChild(box);
            });
            results.appendChild(grid);
        } catch (err) {
            console.error(err);
            msg.textContent = 'Error fetching attendance';
        }
    }

    if (myAttendanceBtn) myAttendanceBtn.addEventListener('click', openMyAttendanceModal);
});