let trainers = [];
let editingTrainerIndex = -1;

async function saveTrainer() {
  const name = document.getElementById("trainerName").value.trim();
  const subject = document.getElementById("subject").value.trim();
  const phone = document.getElementById("trainerPhone").value.trim();
  const email = document.getElementById("trainerEmail").value.trim();
  const district = document.getElementById("trainerDistrict").value.trim();

  if (!name || !subject || !phone || !email || !district) {
    alert("Please fill out all fields.");
    return;
  }

  const trainerData = { name, expertise: subject, mobile: phone, email, address: district };

  try {
    if (editingTrainerId) {
      // Edit existing trainer
      trainerData.trainerId = editingTrainerId;
      const response = await fetch('/.netlify/functions/editTrainer', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trainerData)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      alert('Trainer updated successfully');
    } else {
      // Add new trainer
      const response = await fetch('/.netlify/functions/createTrainer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trainerData)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      alert('Trainer added successfully');
    }
  } catch (error) {
    alert('Error: ' + error.message);
    return;
  }

  editingTrainerId = null;
  document.getElementById("trainerFormTitle").innerText = "Add Trainer";
  clearTrainerForm();
  await fetchTrainers();
}

function renderTrainerList() {
  const trainerBody = document.getElementById("trainerBody");
  trainerBody.innerHTML = "";

  trainers.forEach((trainer) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${trainer.name}</td>
      <td>${trainer.expertise || trainer.subject}</td>
      <td>${trainer.mobile || trainer.phone}</td>
      <td>${trainer.email}</td>
      <td>${trainer.address || trainer.district}</td>
      <td>
        <button class="action-btn edit-btn" onclick="editTrainer('${trainer.trainerId}')">Edit</button>
        <button class="action-btn delete-btn" onclick="deleteTrainer('${trainer.trainerId}')">Delete</button>
      </td>
    `;
    trainerBody.appendChild(row);
  });
}

function editTrainer(trainerId) {
  const trainer = trainers.find(t => t.trainerId === trainerId);
  if (!trainer) return;
  document.getElementById("trainerName").value = trainer.name;
  document.getElementById("subject").value = trainer.expertise || trainer.subject;
  document.getElementById("trainerPhone").value = trainer.mobile || trainer.phone;
  document.getElementById("trainerEmail").value = trainer.email;
  document.getElementById("trainerDistrict").value = trainer.address || trainer.district;
  editingTrainerId = trainerId;
  document.getElementById("trainerFormTitle").innerText = "Edit Trainer";
}

function deleteTrainer(trainerId) {
  if (confirm("Are you sure you want to delete this trainer?")) {
    // For now, just remove from local array; in future, call delete API
    trainers = trainers.filter(t => t.trainerId !== trainerId);
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
        (trainer.expertise || trainer.subject || "").toLowerCase().includes(query) ||
        (trainer.address || trainer.district || "").toLowerCase().includes(query)
    )
    .forEach((trainer) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${trainer.name}</td>
        <td>${trainer.expertise || trainer.subject}</td>
        <td>${trainer.mobile || trainer.phone}</td>
        <td>${trainer.email}</td>
        <td>${trainer.address || trainer.district}</td>
        <td>
          <button class="action-btn edit-btn" onclick="editTrainer('${trainer.trainerId}')">Edit</button>
          <button class="action-btn delete-btn" onclick="deleteTrainer('${trainer.trainerId}')">Delete</button>
        </td>
      `;
      trainerBody.appendChild(row);
    });
});
