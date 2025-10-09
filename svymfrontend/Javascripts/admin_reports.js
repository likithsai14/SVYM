document.addEventListener('DOMContentLoaded', async function () {

  // ------------------- Global Data Variables -------------------
  let studentDataGlobal = [];
  let trainerDataGlobal = [];

  // ------------------- Fetch and Set Counts -------------------
  const fetchAndSetCounts = async () => {
    try {
      // Students
      const studentRes = await fetch('/.netlify/functions/allstudents');
      if (studentRes.ok) {
        const data = await studentRes.json();
        studentDataGlobal = data.students || [];

        const totalStudents = studentDataGlobal.length;
        const activeStudents = studentDataGlobal.filter(st => st.accountStatus  === 'active').length;

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

    } catch (err) {
      console.error("Error fetching counts:", err);
    }
  };

  await fetchAndSetCounts();

  // ------------------- Generate Student Report -------------------
  const studentReport = document.getElementById('studentReportButton');
  if (studentReport) {
    studentReport.addEventListener('click', function () {
      generateStudentReport(studentDataGlobal);
    });
  }

  // ------------------- Generate Trainer Report -------------------
  const trainerReport = document.getElementById('trainerReportButton');
  if (trainerReport) {
    trainerReport.addEventListener('click', function () {
      generateTrainerReport(trainerDataGlobal);
    });
  }

  // ------------------- Student Report Function -------------------
  const generateStudentReport = (students) => {
    if (!students || students.length === 0) {
      alert("No student data available to generate report.");
      return;
    }

    if (!window.jspdf || !window.jspdf.jsPDF) {
      alert("jsPDF not loaded. Include jsPDF and jspdf-autotable before this script.");
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a3' });

    const companyName = "SVYM Tech4Hope";
    const today = new Date().toLocaleDateString('en-IN');
    const reportTitle = `Student Report as on ${today}`;

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const drawHeaderAndBorder = (pageNumber, totalPages) => {
      doc.setFontSize(14);
      doc.text(companyName, 10, 12); // top-left
      doc.setFontSize(12);
      const titleWidth = doc.getTextWidth(reportTitle);
      doc.text(reportTitle, pageWidth - titleWidth - 10, 12); // top-right
      doc.setFontSize(8);
      doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - 25, pageHeight - 8);
      doc.setLineWidth(0.3);
      doc.rect(5, 5, pageWidth - 10, pageHeight - 10);
    };

    const headers = [[
      "User ID", "Name", "Father/Husband", "Email", "Mobile", "Parent Phone", "Aadhar",
      "Gender", "Caste", "DOB", "Age", "Education", "District", "Taluk", "Village",
      "Field Mobiliser ID", "Field Mobiliser", "Supported Project", "Referral Source",
      "Staff Name", "Tribal", "PWD", "Status","Account Status", "Created On"
    ]];

    const rows = students.map(st => [
      st.userId, st.candidateName, st.fatherHusbandName, st.email, st.mobile,
      st.parentPhone, st.aadharNumber, st.gender, st.caste, st.dob, st.age,
      st.education, st.districtName, st.talukName, st.villageName,
      st.fieldMobiliserId, st.fieldMobiliserName, st.supportedProject,
      st.referralSource, st.staffName, st.tribal, st.pwd, st.approvalStatus, st.accountStatus, st.creationDate
    ]);

    doc.autoTable({
      head: headers,
      body: rows,
      startY: 20,
      styles: {
        fontSize: 6.5,
        cellPadding: { top: 2, bottom: 2, left: 0.5, right: 0.5 },
        overflow: 'linebreak',
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        halign: 'left',
        valign: 'middle'
      },
      headStyles: { fillColor: [0, 102, 204], textColor: 255, fontStyle: 'bold', halign: 'center' },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: {
        0: { cellWidth: 'auto' }, 1: { cellWidth: 'wrap' }, 2: { cellWidth: 'wrap' },
        3: { cellWidth: 'wrap' }, 4: { cellWidth: 'auto' }, 5: { cellWidth: 'auto' },
        6: { cellWidth: 'auto' }, 7: { cellWidth: 'auto' }, 8: { cellWidth: 'auto' },
        9: { cellWidth: 'auto' }, 10: { cellWidth: 'auto' }, 11: { cellWidth: 'wrap' },
        12: { cellWidth: 'wrap' }, 13: { cellWidth: 'wrap' }, 14: { cellWidth: 'wrap' },
        15: { cellWidth: 'wrap' }, 16: { cellWidth: 'wrap' }, 17: { cellWidth: 'wrap' },
        18: { cellWidth: 'wrap' }, 19: { cellWidth: 'wrap' }, 20: { cellWidth: 'wrap' },
        21: { cellWidth: 'auto' }, 22: { cellWidth: 'auto' }, 23: { cellWidth: 'auto' },
        24: { cellWidth: 'auto' }
      },
      margin: { left: 6, right: 6, top: 20 },
      tableWidth: 'auto',
      didDrawPage: (data) => {
        const totalPages = doc.internal.getNumberOfPages();
        drawHeaderAndBorder(data.pageNumber, totalPages);
      }
    });
    //doc.save('trainer_report_today.pdf');
    doc.output('dataurlnewwindow');
  };

  // ------------------- Trainer Report Function -------------------
  const generateTrainerReport = (trainers) => {
    if (!trainers || trainers.length === 0) {
      alert("No trainer data available to generate report.");
      return;
    }

    if (!window.jspdf || !window.jspdf.jsPDF) {
      alert("jsPDF not loaded. Include jsPDF and jspdf-autotable before this script.");
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a3' });

    const companyName = "SVYM Tech4Hope";
    const today = new Date().toLocaleDateString('en-IN');
    const reportTitle = `Trainer Report as on ${today}`;

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const drawHeaderAndBorder = (pageNumber, totalPages) => {
      doc.setFontSize(14);
      doc.text(companyName, 10, 12);
      doc.setFontSize(12);
      const titleWidth = doc.getTextWidth(reportTitle);
      doc.text(reportTitle, pageWidth - titleWidth - 10, 12);
      doc.setFontSize(8);
      doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - 25, pageHeight - 8);
      doc.setLineWidth(0.3);
      doc.rect(5, 5, pageWidth - 10, pageHeight - 10);
    };

    const headers = [[
      "Trainer ID", "Name", "Email", "Mobile", "Expertise",
      "Status","Security Question", "Security Answer", "Created On"
    ]];

    const rows = trainers.map(tr => [
      tr.trainerId, tr.name, tr.email, tr.mobile, tr.expertise,
      tr.status,tr.securityQuestion, tr.securityAnswer, tr.createdAt
    ]);

    doc.autoTable({
      head: headers,
      body: rows,
      startY: 20,
      styles: {
        fontSize: 10,
        cellPadding: { top: 2, bottom: 2, left: 0.5, right: 0.5 },
        overflow: 'linebreak',
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        halign: 'left',
        valign: 'middle'
      },
      headStyles: { fillColor: [0, 102, 204], textColor: 255, fontStyle: 'bold', halign: 'center' },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: {
        0: { cellWidth: 'auto' }, 1: { cellWidth: 'auto' }, 2: { cellWidth: 'auto' },
        3: { cellWidth: 'auto' }, 4: { cellWidth: 'auto' }, 5: { cellWidth: 'auto' },
        6: { cellWidth: 'auto' }, 7: { cellWidth: 'auto' }, 8: { cellWidth: 'auto' }
      },
      margin: { left: 6, right: 6, top: 20 },
      tableWidth: 'auto',
      didDrawPage: (data) => {
        const totalPages = doc.internal.getNumberOfPages();
        drawHeaderAndBorder(data.pageNumber, totalPages);
      }
    });

    doc.output('dataurlnewwindow');
    //doc.save('trainer_report_today.pdf');
  };

});
