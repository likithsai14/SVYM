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
      "Mobile": st.mobile,
      "Parent Phone": st.parentPhone,
      "Aadhar": st.aadharNumber,
      "Gender": st.gender,
      "Caste": st.caste,
      "DOB": st.dob,
      "Age": st.age,
      "Education": st.education,
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
      "Created On": new Date(st.creationDate).toLocaleDateString('en-IN')
    }));

    // Convert to worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");

    // Trigger Excel download
    XLSX.writeFile(workbook, reportTitle);
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
      "Created On": tr.createdAt
    }));

    // Convert to worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Trainers");

    // Trigger Excel download
    XLSX.writeFile(workbook, reportTitle);
  };

});
