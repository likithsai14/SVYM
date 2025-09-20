document.addEventListener("DOMContentLoaded", () => {
  // Dummy courses and students
  const trainerCourses = ["Java Basics", "Python Advanced", "ReactJS"];
  const students = [
    { id: "STU001", name: "Rahul Kumar" },
    { id: "STU002", name: "Priya Sharma" },
    { id: "STU003", name: "Amit Verma" },
    { id: "STU004", name: "Sneha Reddy" },
  ];

  const courseSelect = document.getElementById("courseSelect");
  const dateInput = document.getElementById("attendanceDate");
  const tableBody = document.getElementById("studentsTableBody");
  const submitBtn = document.getElementById("submitAttendance");

  // Populate courses dropdown
  trainerCourses.forEach(course => {
    const option = document.createElement("option");
    option.value = course;
    option.textContent = course;
    courseSelect.appendChild(option);
  });

  // Date restrictions: not future, max past 7 days
  const today = new Date();
  const maxPastDate = new Date();
  maxPastDate.setDate(today.getDate() - 7);
  const formatDate = d => d.toISOString().split('T')[0];
  dateInput.max = formatDate(today);
  dateInput.min = formatDate(maxPastDate);
  dateInput.value = formatDate(today);

  // Populate student table
  function populateStudents() {
    tableBody.innerHTML = "";
    students.forEach(student => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${student.id}</td>
        <td>${student.name}</td>
        <td><input type="checkbox" class="attendanceCheckbox"></td>
        <td><input type="text" class="remarksInput" placeholder="Enter remarks"></td>
      `;
      tableBody.appendChild(row);
    });

    // Checkbox change: disable remarks if checked
    document.querySelectorAll(".attendanceCheckbox").forEach(chk => {
      chk.addEventListener("change", () => {
        const tr = chk.closest("tr");
        const remarks = tr.querySelector(".remarksInput");
        remarks.disabled = chk.checked;
        if (chk.checked) remarks.value = "";
      });
    });
  }

  populateStudents();

  // Submit attendance
  submitBtn.addEventListener("click", () => {
    let presentCount = 0;
    let absentCount = 0;

    document.querySelectorAll("#studentsTableBody tr").forEach(tr => {
      const isPresent = tr.querySelector(".attendanceCheckbox").checked;
      if (isPresent) presentCount++;
      else absentCount++;
    });

    alert(`Attendance Submitted!\nTotal Students: ${students.length}\nPresent: ${presentCount}\nAbsent: ${absentCount}`);
  });

  // Function to reset attendance checkboxes and remarks
function resetAttendance() {
  const checkboxes = document.querySelectorAll(".attendanceCheckbox");
  const remarksInputs = document.querySelectorAll(".remarksInput");

  checkboxes.forEach(cb => cb.checked = false);
  remarksInputs.forEach(input => input.value = "");
  // Enable all remarks fields
  remarksInputs.forEach(input => input.disabled = false);
}

courseSelect.addEventListener("change", resetAttendance);
dateInput.addEventListener("change", resetAttendance);

});
