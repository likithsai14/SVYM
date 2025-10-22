document.addEventListener('DOMContentLoaded', async function () {

  // ------------------- Global Data Variables -------------------
  let studentDataGlobal = [];
  let trainerDataGlobal = [];
  let fieldMobiliserDataGlobal = [];
  let coursesDataGlobal = [];
  let transactionsDataGlobal = [];
  let attendanceDataGlobal = [];
  let enrollmentsDataGlobal = [];

  // ------------------- Fetch and Set Counts -------------------
  const fetchAndSetCounts = async () => {
    try {
      // Students
      const studentRes = await fetch('/.netlify/functions/allstudents');
      if (studentRes.ok) {
        const data = await studentRes.json();
        studentDataGlobal = data.students || [];

        const totalStudents = studentDataGlobal.length;
        const activeStudents = studentDataGlobal.filter(st => st.accountStatus === 'active').length;

        const studentTotalElem = document.getElementById('noOfStudents');
        const studentActiveElem = document.getElementById('noOfActiveStudents');
        if (studentTotalElem) studentTotalElem.textContent = totalStudents;
        if (studentActiveElem) studentActiveElem.textContent = activeStudents;
      }

      // Trainers
      const trainerRes = await fetch('/.netlify/functions/allTrainers');
      if (trainerRes.ok) {
        const data = await trainerRes.json();
        trainerDataGlobal = data.trainers || [];

        const totalTrainers = trainerDataGlobal.length;
        const activeTrainers = trainerDataGlobal.filter(tr => tr.status === 'Active').length;

        const trainerTotalElem = document.getElementById('noOfTrainers');
        const trainerActiveElem = document.getElementById('noOfActiveTrainers');
        if (trainerTotalElem) trainerTotalElem.textContent = totalTrainers;
        if (trainerActiveElem) trainerActiveElem.textContent = activeTrainers;
      }

      // Field Mobilisers
      const fmRes = await fetch('/.netlify/functions/allfieldmobilisers');
      if (fmRes.ok) {
        const data = await fmRes.json();
        fieldMobiliserDataGlobal = data.fieldmobilisers || [];

        const totalFM = fieldMobiliserDataGlobal.length;
        const activeFM = fieldMobiliserDataGlobal.filter(fm => fm.accountStatus === 'active').length;

        const fmTotalElem = document.getElementById('noOfFieldMobilisers');
        const fmActiveElem = document.getElementById('noOfActiveFieldMobilisers');
        if (fmTotalElem) fmTotalElem.textContent = totalFM;
        if (fmActiveElem) fmActiveElem.textContent = activeFM;
      }

      // Courses
      const coursesRes = await fetch('/.netlify/functions/allCourses');
      if (coursesRes.ok) {
        const data = await coursesRes.json();
        coursesDataGlobal = data.courses || [];

        const totalCourses = coursesDataGlobal.length;
        const activeCourses = coursesDataGlobal.filter(c => c.status === 'Active').length;

        const coursesTotalElem = document.getElementById('noOfCourses');
        const coursesActiveElem = document.getElementById('noOfActiveCourses');
        if (coursesTotalElem) coursesTotalElem.textContent = totalCourses;
        if (coursesActiveElem) coursesActiveElem.textContent = activeCourses;
      }

      // Transactions
      const transRes = await fetch('/.netlify/functions/getAllTransactions');
      if (transRes.ok) {
        const data = await transRes.json();
        transactionsDataGlobal = data.transactions || [];

        const totalTrans = transactionsDataGlobal.length;
        const pendingFees = transactionsDataGlobal.filter(t => t.status === 'pending').length;

        const transTotalElem = document.getElementById('noOfTransactions');
        const pendingElem = document.getElementById('pendingFees');
        if (transTotalElem) transTotalElem.textContent = totalTrans;
        if (pendingElem) pendingElem.textContent = pendingFees;
      }

      // Attendance
      const attRes = await fetch('/.netlify/functions/markAttendance');
      if (attRes.ok) {
        const data = await attRes.json();
        attendanceDataGlobal = data.attendance || [];

        const totalAtt = attendanceDataGlobal.length;
        const presentCount = attendanceDataGlobal.filter(a => a.status === 'present').length;

        const attTotalElem = document.getElementById('noOfAttendance');
        const presentElem = document.getElementById('presentCount');
        if (attTotalElem) attTotalElem.textContent = totalAtt;
        if (presentElem) presentElem.textContent = presentCount;
      }

    } catch (err) {
      console.error("Error fetching counts:", err);
    }
  };

  await fetchAndSetCounts();

  // ------------------- Generate Student Report -------------------
  const studentReport = document.getElementById('studentReportButton');
  if (studentReport) {
    studentReport.addEventListener('click', function () {
      generateStudentExcelReport(studentDataGlobal);
    });
  }

  // ------------------- Generate Trainer Report -------------------
  const trainerReport = document.getElementById('trainerReportButton');
  if (trainerReport) {
    trainerReport.addEventListener('click', function () {
      generateTrainerExcelReport(trainerDataGlobal);
    });
  }

  // ------------------- Generate Field Mobiliser Report -------------------
  const fieldMobiliserReport = document.getElementById('fieldMobiliserReportButton');
  if (fieldMobiliserReport) {
    fieldMobiliserReport.addEventListener('click', function () {
      generateFieldMobiliserExcelReport(fieldMobiliserDataGlobal);
    });
  }

  // ------------------- Generate Courses Report -------------------
  const coursesReport = document.getElementById('coursesReportButton');
  if (coursesReport) {
    coursesReport.addEventListener('click', function () {
      generateCoursesExcelReport(coursesDataGlobal);
    });
  }

  // ------------------- Generate Fee Details Report -------------------
  const feeDetailsReport = document.getElementById('feeDetailsReportButton');
  if (feeDetailsReport) {
    feeDetailsReport.addEventListener('click', function () {
      showFeeDetailsModal();
    });
  }

  // ------------------- Generate Attendance Report -------------------
  const attendanceReport = document.getElementById('attendanceReportButton');
  if (attendanceReport) {
    attendanceReport.addEventListener('click', function () {
      showAttendanceModal();
    });
  }

  // ------------------- Student Report (Excel) -------------------
  const generateStudentExcelReport = (students) => {
    if (!students || students.length === 0) {
      alert("No student data available to generate report.");
      return;
    }

    const today = new Date().toLocaleDateString('en-IN');
    const reportTitle = `Student_Report_${today.replace(/\//g, '-')}.xlsx`;

    // Prepare Data
    const data = students.map(st => ({
      "User ID": st.userId,
      "Name": st.candidateName,
      "Father/Husband": st.fatherHusbandName,
      "Email": st.email,
      "Mobile": st.candidatePhone,
      "Parent Phone": st.parentPhone,
      "Aadhar": st.aadharNumber,
      "Gender": st.gender,
      "Caste": st.caste,
      "DOB": st.dob,
      "Age": st.age,
      "Education": st.qualification,
      "District": st.districtName,
      "Taluk": st.talukName,
      "Village": st.villageName,
      "Field Mobiliser ID": st.fieldMobiliserId,
      "Field Mobiliser": st.fieldMobiliserName,
      "Supported Project": st.supportedProject,
      "Referral Source": st.referralSource,
      "Staff Name": st.staffName,
      "Tribal": st.tribal,
      "PWD": st.pwd,
      "Status": st.approvalStatus,
      "Account Status": st.accountStatus,
      "Joined Date": st.createdAt ? new Date(st.createdAt).toLocaleDateString('en-IN') : 'N/A'
    }));

    // Convert to worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");

    // Preview in modal
    showPreviewModal("Student Report Preview", worksheet, workbook, reportTitle);
  };

  // ------------------- Trainer Report (Excel) -------------------
  const generateTrainerExcelReport = (trainers) => {
    if (!trainers || trainers.length === 0) {
      alert("No trainer data available to generate report.");
      return;
    }

    const today = new Date().toLocaleDateString('en-IN');
    const reportTitle = `Trainer_Report_${today.replace(/\//g, '-')}.xlsx`;

    // Prepare Data
    const data = trainers.map(tr => ({
      "Trainer ID": tr.trainerId,
      "Name": tr.name,
      "Email": tr.email,
      "Mobile": tr.mobile,
      "Expertise": tr.expertise,
      "Status": tr.status,
      "Security Question": tr.securityQuestion,
      "Security Answer": tr.securityAnswer,
      "Joined Date": tr.createdAt ? new Date(tr.createdAt).toLocaleDateString('en-IN') : 'N/A'
    }));

    // Convert to worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Trainers");

    // Preview in modal
    showPreviewModal("Trainer Report Preview", worksheet, workbook, reportTitle);
  };

  // ------------------- Field Mobiliser Report (Excel) -------------------
  const generateFieldMobiliserExcelReport = (fieldMobilisers) => {
    if (!fieldMobilisers || fieldMobilisers.length === 0) {
      alert("No field mobiliser data available to generate report.");
      return;
    }

    const today = new Date().toLocaleDateString('en-IN');
    const reportTitle = `Field_Mobiliser_Report_${today.replace(/\//g, '-')}.xlsx`;

    // Prepare Data
    const data = fieldMobilisers.map(fm => ({
      "User ID": fm.userId,
      "Name": fm.FieldMobiliserName,
      "Email": fm.FieldMobiliserEmailID,
      "Mobile": fm.FieldMobiliserMobileNo,
      "Region": fm.FieldMobiliserRegion,
      "Supported Project": fm.FieldMobiliserSupportedProject,
      "Status": fm.accountStatus,
      "Joined Date": fm.createdAt ? new Date(fm.createdAt).toLocaleDateString('en-IN') : 'N/A'
    }));

    // Convert to worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Field Mobilisers");

    // Preview in modal
    showPreviewModal("Field Mobiliser Report Preview", worksheet, workbook, reportTitle);
  };

  // ------------------- Courses Report (Excel) -------------------
  const generateCoursesExcelReport = (courses) => {
    if (!courses || courses.length === 0) {
      alert("No courses data available to generate report.");
      return;
    }

    const today = new Date().toLocaleDateString('en-IN');
    const reportTitle = `Courses_Report_${today.replace(/\//g, '-')}.xlsx`;

    // Prepare Data
    const data = courses.map(c => ({
      "Course ID": c.courseId,
      "Course Name": c.courseName,
      "Description": c.description,
      "Duration (Days)": c.durationMonths,
      "Fee": c.price,
      "Start Date": c.startDate ? new Date(c.startDate).toLocaleDateString('en-IN') : 'N/A',
      "End Date": c.endDate ? new Date(c.endDate).toLocaleDateString('en-IN') : 'N/A',
      "Modules": c.moduleNames ? c.moduleNames.join(', ') : 'N/A',
      "Trainer ID": c.trainerId || 'N/A',
      "Trainer Name": c.trainerName || 'N/A',
      "Status": c.courseStatus,
      "Created Date": c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN') : 'N/A'
    }));

    // Convert to worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Courses");

    // Preview in modal
    showPreviewModal("Courses Report Preview", worksheet, workbook, reportTitle);
  };

  // ------------------- Fee Details Modal -------------------
  const showFeeDetailsModal = () => {
    const modal = document.getElementById('previewModal');
    const titleElem = document.getElementById('previewTitle');
    const contentElem = document.getElementById('previewContent');
    const downloadBtn = document.getElementById('downloadBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const closeBtn = document.getElementById('closePreviewModal');

    titleElem.textContent = "Fee Details Report";

    // Add filter UI with dropdown
    contentElem.innerHTML = `
      <div style="margin-bottom: 20px;">
        <label>Report Type: <select id="feeFilterSelect">
          <option value="transactions">Transactions</option>
          <option value="studentFees">Student Fees</option>
        </select></label>
      </div>
      <div id="feeReportContent"></div>
    `;

    modal.classList.add('show');

    const closeModal = () => {
      modal.classList.remove('show');
    };

    // Default to transactions
    generateFeeDetailsReport('transactions');

    // On change, regenerate report
    document.getElementById('feeFilterSelect').onchange = () => {
      const filter = document.getElementById('feeFilterSelect').value;
      generateFeeDetailsReport(filter);
    };

    cancelBtn.onclick = closeModal;
    closeBtn.onclick = closeModal;

    // Close on outside click
    modal.onclick = (e) => {
      if (e.target === modal) closeModal();
    };
  };

  // ------------------- Fee Details Report -------------------
  const generateFeeDetailsReport = async (filter) => {
    const reportContentElem = document.getElementById('feeReportContent');

    if (filter === 'transactions') {
      // Transactions report
      const data = transactionsDataGlobal.map(t => ({
        "Transaction ID": t.transactionId,
        "Student ID": t.studentId,
        "Student Name": t.studentName,
        "Course": t.courseName,
        "Amount": t.amount,
        "Payment Method": t.paymentMedium,
        "Date": t.transactionDate ? new Date(t.transactionDate).toLocaleDateString('en-IN') : 'N/A'
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

      const today = new Date().toLocaleDateString('en-IN');
      const filename = `Transactions_Report_${today.replace(/\//g, '-')}.xlsx`;

      // Generate table HTML
      const htmlTable = XLSX.utils.sheet_to_html(worksheet);
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlTable, 'text/html');
      const table = doc.querySelector('table');
      const firstRow = table.querySelector('tr');
      if (firstRow) {
        const cells = firstRow.querySelectorAll('td');
        cells.forEach(cell => {
          const th = doc.createElement('th');
          th.innerHTML = cell.innerHTML;
          firstRow.replaceChild(th, cell);
        });
      }
      const modifiedTable = table.outerHTML;
      reportContentElem.innerHTML = `<div class="preview-table-container">${modifiedTable.replace('<table>', '<table class="preview-table">')}</div>`;

      // Update download button
      const downloadBtn = document.getElementById('downloadBtn');
      downloadBtn.onclick = () => {
        XLSX.writeFile(workbook, filename);
      };
    } else {
      // Student Fees report
      // Group by student and course from transactions
      const studentFees = {};
      transactionsDataGlobal.forEach(t => {
        const studentId = t.studentId;
        const courseId = t.courseId;
        const course = coursesDataGlobal.find(c => c.courseId === courseId);
        if (!course) return;
        const key = `${studentId}-${courseId}`;
        if (!studentFees[key]) {
          studentFees[key] = {
            studentId,
            studentName: t.studentName,
            courseId,
            courseName: t.courseName,
            totalFee: course.price,
            paid: 0
          };
        }
        studentFees[key].paid += t.amount;
      });

      // Group by student
      const studentGroups = {};
      Object.values(studentFees).forEach(fee => {
        const studentId = fee.studentId;
        if (!studentGroups[studentId]) {
          studentGroups[studentId] = [];
        }
        studentGroups[studentId].push(fee);
      });

      const data = [];
      Object.keys(studentGroups).forEach(studentId => {
        const courses = studentGroups[studentId];
        courses.forEach((course, index) => {
          data.push({
            "Student ID": index === 0 ? course.studentId : '',
            "Student Name": index === 0 ? course.studentName : '',
            "Course ID": course.courseId,
            "Course Name": course.courseName,
            "Total Fee": course.totalFee,
            "Amount Paid": course.paid,
            "Due Amount": course.totalFee - course.paid
          });
        });
      });

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Student Fees");

      const today = new Date().toLocaleDateString('en-IN');
      const filename = `Student_Fees_Report_${today.replace(/\//g, '-')}.xlsx`;

      // Generate table HTML
      const htmlTable = XLSX.utils.sheet_to_html(worksheet);
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlTable, 'text/html');
      const table = doc.querySelector('table');
      const firstRow = table.querySelector('tr');
      if (firstRow) {
        const cells = firstRow.querySelectorAll('td');
        cells.forEach(cell => {
          const th = doc.createElement('th');
          th.innerHTML = cell.innerHTML;
          firstRow.replaceChild(th, cell);
        });
      }
      const modifiedTable = table.outerHTML;
      reportContentElem.innerHTML = `<div class="preview-table-container">${modifiedTable.replace('<table>', '<table class="preview-table">')}</div>`;

      // Update download button
      const downloadBtn = document.getElementById('downloadBtn');
      downloadBtn.onclick = () => {
        XLSX.writeFile(workbook, filename);
      };
    }
  };

  // ------------------- Attendance Modal -------------------
  const showAttendanceModal = () => {
    const modal = document.getElementById('previewModal');
    const titleElem = document.getElementById('previewTitle');
    const contentElem = document.getElementById('previewContent');
    const downloadBtn = document.getElementById('downloadBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const closeBtn = document.getElementById('closePreviewModal');

    titleElem.textContent = "Attendance Report";

    // Add filter UI
    contentElem.innerHTML = `
      <div style="margin-bottom: 20px;">
        <label>Course: <select id="attendanceCourseSelect"></select></label>
        <label style="margin-left: 20px;">Month: <select id="attendanceMonthSelect"></select></label>
        <label style="margin-left: 20px;">Year: <select id="attendanceYearSelect"></select></label>
        <button id="generateAttendanceReportBtn" class="save-btn" style="margin-left: 20px;">Generate Report</button>
      </div>
      <div id="attendanceReportContent"></div>
    `;

    // Populate selects
    const courseSelect = document.getElementById('attendanceCourseSelect');
    coursesDataGlobal.forEach(c => {
      const option = document.createElement('option');
      option.value = c.courseId;
      option.textContent = c.courseName;
      courseSelect.appendChild(option);
    });

    const monthSelect = document.getElementById('attendanceMonthSelect');
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    months.forEach((m, i) => {
      const option = document.createElement('option');
      option.value = i + 1;
      option.textContent = m;
      monthSelect.appendChild(option);
    });

    const yearSelect = document.getElementById('attendanceYearSelect');
    const currentYear = new Date().getFullYear();
    for (let y = currentYear - 5; y <= currentYear + 1; y++) {
      const option = document.createElement('option');
      option.value = y;
      option.textContent = y;
      yearSelect.appendChild(option);
    }
    yearSelect.value = currentYear;

    modal.classList.add('show');

    const closeModal = () => {
      modal.classList.remove('show');
    };

    const regenerateReport = () => {
      const courseId = courseSelect.value;
      const month = parseInt(monthSelect.value);
      const year = parseInt(yearSelect.value);
      generateAttendanceReport(courseId, month, year);
    };

    courseSelect.onchange = regenerateReport;
    monthSelect.onchange = regenerateReport;
    yearSelect.onchange = regenerateReport;

    document.getElementById('generateAttendanceReportBtn').onclick = regenerateReport;

    cancelBtn.onclick = closeModal;
    closeBtn.onclick = closeModal;

    // Close on outside click
    modal.onclick = (e) => {
      if (e.target === modal) closeModal();
    };
  };

  // ------------------- Attendance Report -------------------
  const generateAttendanceReport = async (courseId, month, year) => {
    // Fetch attendance data for the course, month, year
    const res = await fetch(`/.netlify/functions/markAttendance?courseId=${courseId}&month=${month}&year=${year}`);
    if (!res.ok) {
      alert("Failed to fetch attendance data.");
      return;
    }
    const data = await res.json();
    console.log("Attendance data:", data);
    const attendanceRecords = data.attendance || [];

    // Filter attendance records by selected month and year
    const filteredAttendance = attendanceRecords.filter(a => {
      const recDate = new Date(a.attendanceDate);
      const recYear = recDate.getUTCFullYear();
      const recMonth = recDate.getUTCMonth() + 1; // getUTCMonth is 0-based
      return recYear === year && recMonth === month;
    });

    // Get students enrolled in the course or who have attendance records in the month
    const enrolledStudentsSet = new Set();
    studentDataGlobal.forEach(st => {
      if (st.enrolledCourses && st.enrolledCourses.includes(courseId)) {
        enrolledStudentsSet.add(st.userId);
      }
    });
    filteredAttendance.forEach(record => {
      record.students.forEach(s => enrolledStudentsSet.add(s.studentId));
    });
    const enrolledStudents = Array.from(enrolledStudentsSet).map(id => {
      const student = studentDataGlobal.find(st => st.userId === id);
      if (student) return student;
      // If not found in global data, find from filtered attendance records
      for (const record of filteredAttendance) {
        const attStudent = record.students.find(s => s.studentId === id);
        if (attStudent) {
          return { userId: id, candidateName: attStudent.studentName };
        }
      }
      return null;
    }).filter(Boolean);

    // Get all dates in the month
    const daysInMonth = new Date(year, month, 0).getDate();
    const dates = [];
    for (let d = 1; d <= daysInMonth; d++) {
      dates.push(new Date(Date.UTC(year, month - 1, d)));
    }

    // Prepare data: rows = students, columns = dates
    const reportData = [];
    enrolledStudents.forEach(student => {
      const row = { "Student Name": student.candidateName };
      dates.forEach(date => {
        // Find attendance record for this date using date parts comparison
        const record = filteredAttendance.find(a => {
          const recDate = new Date(a.attendanceDate);
          const recYear = recDate.getUTCFullYear();
          const recMonth = recDate.getUTCMonth();
          const recDay = recDate.getUTCDate();
          const dateYear = date.getUTCFullYear();
          const dateMonth = date.getUTCMonth();
          const dateDay = date.getUTCDate();
          return recYear === dateYear && recMonth === dateMonth && recDay === dateDay;
        });
        if (record) {
          const studentEntry = record.students.find(s => s.studentId === student.userId);
          row[date.toLocaleDateString('en-IN')] = studentEntry ? (studentEntry.present ? 'Present' : 'Absent') : '';
        } else {
          row[date.toLocaleDateString('en-IN')] = '';
        }
      });
      reportData.push(row);
    });

    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

    const filename = `Attendance_Report_${courseId}_${month}_${year}.xlsx`;

    // Generate table HTML
    const htmlTable = XLSX.utils.sheet_to_html(worksheet);
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlTable, 'text/html');
    const table = doc.querySelector('table');
    const firstRow = table.querySelector('tr');
    if (firstRow) {
      const cells = firstRow.querySelectorAll('td');
      cells.forEach(cell => {
        const th = doc.createElement('th');
        th.innerHTML = cell.innerHTML;
        firstRow.replaceChild(th, cell);
      });
    }
    const modifiedTable = table.outerHTML;
    const attendanceReportContent = document.getElementById('attendanceReportContent');
    attendanceReportContent.innerHTML = `<div class="preview-table-container">${modifiedTable.replace('<table>', '<table class="preview-table">')}</div>`;

    // Update download button
    const downloadBtn = document.getElementById('downloadBtn');
    downloadBtn.onclick = () => {
      XLSX.writeFile(workbook, filename);
    };
  };

  // ------------------- Preview Modal Function -------------------
  const showPreviewModal = (title, worksheet, workbook, filename) => {
    const modal = document.getElementById('previewModal');
    const titleElem = document.getElementById('previewTitle');
    const contentElem = document.getElementById('previewContent');
    const downloadBtn = document.getElementById('downloadBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const closeBtn = document.getElementById('closePreviewModal');

    titleElem.textContent = title;
    const htmlTable = XLSX.utils.sheet_to_html(worksheet);
    // Parse and modify to use <th> for headers
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlTable, 'text/html');
    const table = doc.querySelector('table');
    const firstRow = table.querySelector('tr');
    if (firstRow) {
      const cells = firstRow.querySelectorAll('td');
      cells.forEach(cell => {
        const th = doc.createElement('th');
        th.innerHTML = cell.innerHTML;
        firstRow.replaceChild(th, cell);
      });
    }
    const modifiedTable = table.outerHTML;
    // Wrap in container and add class to table
    contentElem.innerHTML = `<div class="preview-table-container">${modifiedTable.replace('<table>', '<table class="preview-table">')}</div>`;

    modal.classList.add('show');

    const closeModal = () => {
      modal.classList.remove('show');
    };

    downloadBtn.onclick = () => {
      XLSX.writeFile(workbook, filename);
      closeModal();
    };

    cancelBtn.onclick = closeModal;
    closeBtn.onclick = closeModal;

    // Close on outside click
    modal.onclick = (e) => {
      if (e.target === modal) closeModal();
    };
  };

});
