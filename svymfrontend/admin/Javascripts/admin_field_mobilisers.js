let mobilizers = [];
let editingMobilizerIndex = -1;

function saveMobilizer() {
  const name = document.getElementById("mobilizerName").value.trim();
  const region = document.getElementById("mobilizerRegion").value.trim();
  const phone = document.getElementById("mobilizerPhone").value.trim();
  const email = document.getElementById("mobilizerEmail").value.trim();

  if (!name || !region || !phone || !email) {
    alert("Please fill out all fields.");
    return;
  }

  const mobilizerData = { name, region, phone, email };

  if (editingMobilizerIndex >= 0) {
    mobilizers[editingMobilizerIndex] = mobilizerData;
    editingMobilizerIndex = -1;
    document.getElementById("mobilizerFormTitle").innerText = "Add Field Mobilizer";
  } else {
    mobilizers.push(mobilizerData);
  }

  clearMobilizerForm();
  renderMobilizerList();
}

function renderMobilizerList() {
  const mobilizerBody = document.getElementById("mobilizerBody");
  mobilizerBody.innerHTML = "";

  mobilizers.forEach((mobilizer, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${mobilizer.name}</td>
      <td>${mobilizer.region}</td>
      <td>${mobilizer.phone}</td>
      <td>${mobilizer.email}</td>
      <td>
        <button class="action-btn edit-btn" onclick="editMobilizer(${index})">Edit</button>
        <button class="action-btn delete-btn" onclick="deleteMobilizer(${index})">Delete</button>
      </td>
    `;
    mobilizerBody.appendChild(row);
  });
}

function editMobilizer(index) {
  const mobilizer = mobilizers[index];
  document.getElementById("mobilizerName").value = mobilizer.name;
  document.getElementById("mobilizerRegion").value = mobilizer.region;
  document.getElementById("mobilizerPhone").value = mobilizer.phone;
  document.getElementById("mobilizerEmail").value = mobilizer.email;
  editingMobilizerIndex = index;
  document.getElementById("mobilizerFormTitle").innerText = "Edit Field Mobilizer";
}

function deleteMobilizer(index) {
  if (confirm("Are you sure you want to delete this field mobilizer?")) {
    mobilizers.splice(index, 1);
    renderMobilizerList();
  }
}

function clearMobilizerForm() {
  document.getElementById("mobilizerName").value = "";
  document.getElementById("mobilizerRegion").value = "";
  document.getElementById("mobilizerPhone").value = "";
  document.getElementById("mobilizerEmail").value = "";
}

document.getElementById("searchMobilizer").addEventListener("input", function () {
  const query = this.value.toLowerCase();
  const mobilizerBody = document.getElementById("mobilizerBody");
  mobilizerBody.innerHTML = "";

  mobilizers
    .filter(
      (mobilizer) =>
        mobilizer.name.toLowerCase().includes(query) ||
        mobilizer.region.toLowerCase().includes(query)
    )
    .forEach((mobilizer, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${mobilizer.name}</td>
        <td>${mobilizer.region}</td>
        <td>${mobilizer.phone}</td>
        <td>${mobilizer.email}</td>
        <td>
          <button class="action-btn edit-btn" onclick="editMobilizer(${index})">Edit</button>
          <button class="action-btn delete-btn" onclick="deleteMobilizer(${index})">Delete</button>
        </td>
      `;
      mobilizerBody.appendChild(row);
    });
});
