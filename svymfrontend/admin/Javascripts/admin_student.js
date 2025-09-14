// student.js
let students = [];
let editingIndex = -1;

function renderStudents() {
  const tbody = document.getElementById("studentBody");
  tbody.innerHTML = "";
  students.forEach((student, index) => {
    const row = `<tr>
      <td>${student.name}</td>
      <td>${student.fatherName}</td>
      <td>${student.phone}</td>
      <td>${student.aadhar}</td>
      <td>${student.district}</td>
      <td>
        <button class='action-btn edit-btn' onclick='editStudent(${index})'>Edit</button>
        <button class='action-btn delete-btn' onclick='deleteStudent(${index})'>Delete</button>
      </td>
    </tr>`;
    tbody.innerHTML += row;
  });
}

function saveStudent() {
  const name = document.getElementById("name").value.trim();
  const fatherName = document.getElementById("fatherName").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const aadhar = document.getElementById("aadhar").value.trim();
  const district = document.getElementById("district").value.trim();

  if (!name || !fatherName || !phone || !aadhar || !district) {
    alert("Please fill in all fields.");
    return;
  }

  const student = { name, fatherName, phone, aadhar, district };

  if (editingIndex >= 0) {
    students[editingIndex] = student;
    document.getElementById("formTitle").innerText = "Add Student";
    editingIndex = -1;
  } else {
    students.push(student);
  }

  document.getElementById("name").value = "";
  document.getElementById("fatherName").value = "";
  document.getElementById("phone").value = "";
  document.getElementById("aadhar").value = "";
  document.getElementById("district").value = "";

  renderStudents();
}

function editStudent(index) {
  const student = students[index];
  document.getElementById("name").value = student.name;
  document.getElementById("fatherName").value = student.fatherName;
  document.getElementById("phone").value = student.phone;
  document.getElementById("aadhar").value = student.aadhar;
  document.getElementById("district").value = student.district;
  document.getElementById("formTitle").innerText = "Edit Student";
  editingIndex = index;
}

function deleteStudent(index) {
  if (confirm("Are you sure you want to delete this student?")) {
    students.splice(index, 1);
    renderStudents();
  }
}

document.getElementById("searchInput").addEventListener("input", function () {
  const searchTerm = this.value.toLowerCase();
  const tbody = document.getElementById("studentBody");
  tbody.innerHTML = "";
  students
    .filter(
      (student) =>
        student.name.toLowerCase().includes(searchTerm) ||
        student.district.toLowerCase().includes(searchTerm)
    )
    .forEach((student, index) => {
      const row = `<tr>
        <td>${student.name}</td>
        <td>${student.fatherName}</td>
        <td>${student.phone}</td>
        <td>${student.aadhar}</td>
        <td>${student.district}</td>
        <td>
          <button class='action-btn edit-btn' onclick='editStudent(${index})'>Edit</button>
          <button class='action-btn delete-btn' onclick='deleteStudent(${index})'>Delete</button>
        </td>
      </tr>`;
      tbody.innerHTML += row;
    });
});

renderStudents();
