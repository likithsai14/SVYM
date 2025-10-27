document.addEventListener("DOMContentLoaded", async () => {
  const courseSelect = document.getElementById("courseSelect");
  const dateInput = document.getElementById("attendanceDate");
  const filterSelect = document.getElementById("filterSelect");
  const tableBody = document.getElementById("studentsTableBody");
  const submitBtn = document.getElementById("submitAttendance");
  const editBtn = document.getElementById("editAttendance");

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
        submitBtn.style.display = "none"; // completely remove the button
        editBtn.style.display = "block"; // show edit button
      } else {
        populateStudents(); // fresh editable table
        submitBtn.style.display = "block";
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Attendance";
        editBtn.style.display = "none"; // hide edit button
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

    let courseStudents = students.filter(s => enrollment.studentIds.includes(s.userId));

    if (courseStudents.length === 0) {
      tableBody.innerHTML = "<tr><td colspan='4'>No students enrolled for this course</td></tr>";
      submitBtn.style.display = "none";
      return;
    }

    // Apply filtering based on filterSelect value
    const filterValue = filterSelect.value;
    if (filterValue !== "default") {
      courseStudents = courseStudents.filter(student => {
        const existingRec = existing.find(e => e.studentId === student.userId);
        const isPresent = existingRec ? existingRec.present : false;
        if (filterValue === "present") return isPresent;
        if (filterValue === "absent") return !isPresent;
        return true;
      });
    }

    courseStudents.forEach(student => {
      const existingRec = existing.find(e => e.studentId === student.userId);
      const isPresent = existingRec ? existingRec.present : false;
      const remarksVal = existingRec ? existingRec.remarks : "";

      const row = document.createElement("tr");
      if (readOnly) {
        // Display as text
        const displayRemarks = !isPresent && (!remarksVal || remarksVal.trim() === "") ? "not yet joined" : (remarksVal || "—");
        row.innerHTML = `
          <td>${student.userId}</td>
          <td>${student.candidateName}</td>
          <td>${isPresent ? "Present" : "Absent"}</td>
          <td>${displayRemarks}</td>
        `;
      } else {
        // Editable with dropdown
        const statusValue = isPresent ? "Present" : "Absent";
        row.innerHTML = `
          <td>${student.userId}</td>
          <td>${student.candidateName}</td>
          <td>
            <select class="attendanceSelect">
              <option value="Present" ${statusValue === "Present" ? "selected" : ""}>Present</option>
              <option value="Absent" ${statusValue === "Absent" ? "selected" : ""}>Absent</option>
            </select>
          </td>
          <td><input type="text" class="remarksInput" value="${remarksVal}" placeholder="Enter remarks"></td>
        `;
      }
      tableBody.appendChild(row);
    });

    if (!readOnly) {
      // Dropdown logic (remarks is always enabled, but clear when Present is selected)
      document.querySelectorAll(".attendanceSelect").forEach(sel => {
        sel.addEventListener("change", () => {
          const tr = sel.closest("tr");
          const remarks = tr.querySelector(".remarksInput");
          if (sel.value === "Present") remarks.value = "";
        });
      });
    }
  }

  // Set default date to today
  const today = new Date();
  const formatDate = d => d.toISOString().split("T")[0];
  dateInput.value = formatDate(today);

  // Submit or update attendance
  submitBtn.addEventListener("click", async () => {
    const selectedCourseId = courseSelect.value;
    const attendanceDate = dateInput.value;

    const attendanceData = [];
    let hasError = false;
    document.querySelectorAll("#studentsTableBody tr").forEach(tr => {
      const studentId = tr.cells[0].textContent;
      const studentName = tr.cells[1].textContent;
      const isPresent = tr.querySelector(".attendanceSelect").value === "Present";
      const remarks = tr.querySelector(".remarksInput").value.trim();

      // Validate: remarks mandatory if absent
      if (!isPresent && !remarks) {
        alert(`Remarks are mandatory for absent students. Please provide remarks for ${studentName}.`);
        hasError = true;
        return;
      }

      attendanceData.push({ studentId, studentName, present: isPresent, remarks });
    });

    if (hasError) return;

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
        const isUpdate = submitBtn.textContent === "Update Attendance";
        alert(isUpdate ? "Attendance updated successfully!" : "Attendance saved successfully!");
        await checkExistingAttendance(); // reload as read-only
      } else {
        alert("Error: " + result.message);
      }
    } catch (err) {
      console.error("Error submitting/updating attendance:", err);
      alert("Failed to submit/update attendance");
    }
  });

  // Change course/date/filter → check for existing record or re-filter
  courseSelect.addEventListener("change", checkExistingAttendance);
  dateInput.addEventListener("change", checkExistingAttendance);
  filterSelect.addEventListener("change", () => {
    // Re-populate students with current data
    const selectedCourseId = courseSelect.value;
    const attendanceDate = dateInput.value;
    if (!selectedCourseId || !attendanceDate) return;

    // Fetch current attendance data to re-filter
    fetch(
      `/.netlify/functions/markAttendance?trainerId=${trainerId}&courseId=${selectedCourseId}&attendanceDate=${attendanceDate}`,
      { method: "GET" }
    )
      .then(res => res.json())
      .then(data => {
        if (data.exists) {
          populateStudents(data.record.students, true);
        } else {
          populateStudents();
        }
      })
      .catch(err => console.error("Error re-filtering:", err));
  });

  // Edit attendance
  editBtn.addEventListener("click", async () => {
    const selectedCourseId = courseSelect.value;
    const attendanceDate = dateInput.value;
    if (!selectedCourseId || !attendanceDate) return;

    // Fetch current attendance data
    try {
      const res = await fetch(
        `/.netlify/functions/markAttendance?trainerId=${trainerId}&courseId=${selectedCourseId}&attendanceDate=${attendanceDate}`,
        { method: "GET" }
      );
      const data = await res.json();
      if (data.exists) {
        populateStudents(data.record.students, false); // editable mode with pre-filled data
        editBtn.style.display = "none";
        submitBtn.style.display = "block";
        submitBtn.textContent = "Update Attendance";
      }
    } catch (err) {
      console.error("Error fetching attendance for edit:", err);
    }
  });

  // Initial load
  await loadTrainerData();
});
