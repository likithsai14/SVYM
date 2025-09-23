document.addEventListener("DOMContentLoaded", async () => {
  const courseSelect = document.getElementById("courseSelect");
  const dateInput = document.getElementById("attendanceDate");
  const tableBody = document.getElementById("studentsTableBody");
  const submitBtn = document.getElementById("submitAttendance");

  let trainerId = sessionStorage.getItem("userId") || "T001"; // example
  let courses = [];
  let students = [];
  let enrollments = [];

  // Fetch trainer courses & students
  async function loadTrainerData() {
    try {
      const res = await fetch("/.netlify/functions/getTrainerStudentsData", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trainerId }),
      });

      if (!res.ok) throw new Error("Failed to fetch trainer data");

      const data = await res.json();
      courses = data.courses;
      students = data.students;
      enrollments = data.enrollments;

      // console.log("logging", courses);
      // console.log(students);
      // console.log(enrollments);
      
      populateCourses();
      await checkExistingAttendance(); // check immediately on first load
    } catch (err) {
      console.error("Error loading trainer data:", err);
      alert("Error loading trainer data");
    }
  }

  // Populate courses dropdown
  function populateCourses() {
    courseSelect.innerHTML = "";
    courses.forEach(course => {
      const option = document.createElement("option");
      option.value = course.courseId;
      option.textContent = course.courseName;
      courseSelect.appendChild(option);
    });
  }

  // Fetch attendance record for selected course/date
  async function checkExistingAttendance() {
    const selectedCourseId = courseSelect.value;
    const attendanceDate = dateInput.value;

    if (!selectedCourseId || !attendanceDate) return;

    try {
      const res = await fetch(
        `/.netlify/functions/markAttendance?trainerId=${trainerId}&courseId=${selectedCourseId}&attendanceDate=${attendanceDate}`,
        { method: "GET" }
      );

      const data = await res.json();

      if (data.exists) {
        populateStudents(data.record.students, true); // readonly mode
        submitBtn.disabled = true;
        submitBtn.textContent = "Attendance Already Submitted";
      } else {
        populateStudents(); // fresh editable table
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Attendance";
      }
    } catch (err) {
      console.error("Error checking attendance:", err);
    }
  }

  // Populate students table
  function populateStudents(existing = [], readOnly = false) {
    tableBody.innerHTML = "";
    const selectedCourseId = courseSelect.value;

    const enrollment = enrollments.find(e => e.courseId === selectedCourseId);
    if (!enrollment) return;

    const courseStudents = students.filter(s => enrollment.studentIds.includes(s.userId));

    courseStudents.forEach(student => {
      const existingRec = existing.find(e => e.studentId === student.userId);
      const isPresent = existingRec ? existingRec.present : false;
      const remarksVal = existingRec ? existingRec.remarks : "";

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${student.userId}</td>
        <td>${student.candidateName}</td>
        <td><input type="checkbox" class="attendanceCheckbox" ${isPresent ? "checked" : ""} ${readOnly ? "disabled" : ""}></td>
        <td><input type="text" class="remarksInput" value="${remarksVal}" placeholder="Enter remarks" ${readOnly || isPresent ? "disabled" : ""}></td>
      `;
      tableBody.appendChild(row);
    });

    if (!readOnly) {
      // Checkbox logic (disable remarks when present is checked)
      document.querySelectorAll(".attendanceCheckbox").forEach(chk => {
        chk.addEventListener("change", () => {
          const tr = chk.closest("tr");
          const remarks = tr.querySelector(".remarksInput");
          remarks.disabled = chk.checked;
          if (chk.checked) remarks.value = "";
        });
      });
    }
  }

  // Date restrictions
  const today = new Date();
  const maxPastDate = new Date();
  maxPastDate.setDate(today.getDate() - 7);
  const formatDate = d => d.toISOString().split("T")[0];
  dateInput.max = formatDate(today);
  dateInput.min = formatDate(maxPastDate);
  dateInput.value = formatDate(today);

  // Submit attendance
  submitBtn.addEventListener("click", async () => {
    const selectedCourseId = courseSelect.value;
    const attendanceDate = dateInput.value;

    const attendanceData = [];
    document.querySelectorAll("#studentsTableBody tr").forEach(tr => {
      const studentId = tr.cells[0].textContent;
      const studentName = tr.cells[1].textContent;
      const isPresent = tr.querySelector(".attendanceCheckbox").checked;
      const remarks = tr.querySelector(".remarksInput").value;
      attendanceData.push({ studentId, studentName, present: isPresent, remarks });
    });

    try {
      const res = await fetch("/.netlify/functions/markAttendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trainerId,
          courseId: selectedCourseId,
          attendanceDate,
          students: attendanceData,
        }),
      });

      const result = await res.json();
      if (res.ok) {
        alert("Attendance saved successfully!");
        await checkExistingAttendance(); // reload as read-only
      } else {
        alert("Error: " + result.message);
      }
    } catch (err) {
      console.error("Error submitting attendance:", err);
      alert("Failed to submit attendance");
    }
  });

  // Change course/date → check for existing record
  courseSelect.addEventListener("change", checkExistingAttendance);
  dateInput.addEventListener("change", checkExistingAttendance);

  // Initial load
  await loadTrainerData();
});
