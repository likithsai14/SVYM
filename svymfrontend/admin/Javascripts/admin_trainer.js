let trainers = [];
let editingTrainerIndex = -1;

function saveTrainer() {
  const name = document.getElementById("trainerName").value.trim();
  const subject = document.getElementById("subject").value.trim();
  const phone = document.getElementById("trainerPhone").value.trim();
  const email = document.getElementById("trainerEmail").value.trim();
  const district = document.getElementById("trainerDistrict").value.trim();

  if (!name || !subject || !phone || !email || !district) {
    alert("Please fill out all fields.");
    return;
  }

  const trainerData = { name, subject, phone, email, district };

  if (editingTrainerIndex >= 0) {
    trainers[editingTrainerIndex] = trainerData;
    editingTrainerIndex = -1;
    document.getElementById("trainerFormTitle").innerText = "Add Trainer";
  } else {
    trainers.push(trainerData);
  }

  clearTrainerForm();
  renderTrainerList();
}

function renderTrainerList() {
  const trainerBody = document.getElementById("trainerBody");
  trainerBody.innerHTML = "";

  trainers.forEach((trainer, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${trainer.name}</td>
      <td>${trainer.subject}</td>
      <td>${trainer.phone}</td>
      <td>${trainer.email}</td>
      <td>${trainer.district}</td>
      <td>
        <button class="action-btn edit-btn" onclick="editTrainer(${index})">Edit</button>
        <button class="action-btn delete-btn" onclick="deleteTrainer(${index})">Delete</button>
      </td>
    `;
    trainerBody.appendChild(row);
  });
}

function editTrainer(index) {
  const trainer = trainers[index];
  document.getElementById("trainerName").value = trainer.name;
  document.getElementById("subject").value = trainer.subject;
  document.getElementById("trainerPhone").value = trainer.phone;
  document.getElementById("trainerEmail").value = trainer.email;
  document.getElementById("trainerDistrict").value = trainer.district;
  editingTrainerIndex = index;
  document.getElementById("trainerFormTitle").innerText = "Edit Trainer";
}

function deleteTrainer(index) {
  if (confirm("Are you sure you want to delete this trainer?")) {
    trainers.splice(index, 1);
    renderTrainerList();
  }
}

function clearTrainerForm() {
  document.getElementById("trainerName").value = "";
  document.getElementById("subject").value = "";
  document.getElementById("trainerPhone").value = "";
  document.getElementById("trainerEmail").value = "";
  document.getElementById("trainerDistrict").value = "";
}

document.getElementById("searchTrainer").addEventListener("input", function () {
  const query = this.value.toLowerCase();
  const trainerBody = document.getElementById("trainerBody");
  trainerBody.innerHTML = "";

  trainers
    .filter(
      (trainer) =>
        trainer.name.toLowerCase().includes(query) ||
        trainer.subject.toLowerCase().includes(query) ||
        trainer.district.toLowerCase().includes(query)
    )
    .forEach((trainer, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${trainer.name}</td>
        <td>${trainer.subject}</td>
        <td>${trainer.phone}</td>
        <td>${trainer.email}</td>
        <td>${trainer.district}</td>
        <td>
          <button class="action-btn edit-btn" onclick="editTrainer(${index})">Edit</button>
          <button class="action-btn delete-btn" onclick="deleteTrainer(${index})">Delete</button>
        </td>
      `;
      trainerBody.appendChild(row);
    });
});
