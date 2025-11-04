let mobilizers = [];
let editingMobilizerIndex = -1;

// Add event listeners to prevent non-alphabetic input in Region and Supported Project fields
document.addEventListener('DOMContentLoaded', function() {
  const regionInput = document.getElementById('mobilizerRegion');
  const supportedProjectInput = document.getElementById('mobilizerSupportedProject');

  if (regionInput) {
    regionInput.addEventListener('keypress', function(event) {
      const char = String.fromCharCode(event.which);
      if (!/[a-zA-Z\s]/.test(char)) {
        event.preventDefault();
      }
    });
    regionInput.addEventListener('input', function() {
      this.value = this.value.replace(/[^a-zA-Z\s]/g, '');
    });
    regionInput.addEventListener('paste', function(event) {
      const paste = (event.clipboardData || window.clipboardData).getData('text');
      if (!/^[a-zA-Z\s]*$/.test(paste)) {
        event.preventDefault();
      }
    });
  }

  if (supportedProjectInput) {
    supportedProjectInput.addEventListener('keypress', function(event) {
      const char = String.fromCharCode(event.which);
      if (!/[a-zA-Z\s]/.test(char)) {
        event.preventDefault();
      }
    });
    supportedProjectInput.addEventListener('input', function() {
      this.value = this.value.replace(/[^a-zA-Z\s]/g, '');
    });
    supportedProjectInput.addEventListener('paste', function(event) {
      const paste = (event.clipboardData || window.clipboardData).getData('text');
      if (!/^[a-zA-Z\s]*$/.test(paste)) {
        event.preventDefault();
      }
    });
  }
});

function saveMobilizer() {
  const name = document.getElementById("mobilizerName").value.trim();
  const region = document.getElementById("mobilizerRegion").value.trim();
  const supportedProject = document.getElementById("mobilizerSupportedProject").value.trim();
  const phone = document.getElementById("mobilizerPhone").value.trim();
  const email = document.getElementById("mobilizerEmail").value.trim();

  if (!name || !region || !supportedProject || !phone || !email) {
    alert("Please fill out all fields.");
    return;
  }

  // Validate region and supportedProject to only allow alphabets and spaces
  const alphabetRegex = /^[a-zA-Z\s]+$/;
  if (!alphabetRegex.test(region)) {
    alert("Region must contain only alphabets and spaces.");
    return;
  }
  if (!alphabetRegex.test(supportedProject)) {
    alert("Supported Project must contain only alphabets and spaces.");
    return;
  }

  const mobilizerData = { name, region, supportedProject, phone, email };

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
      <td>${mobilizer.supportedProject}</td>
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
  document.getElementById("mobilizerSupportedProject").value = mobilizer.supportedProject;
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
  document.getElementById("mobilizerSupportedProject").value = "";
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
        mobilizer.region.toLowerCase().includes(query) ||
        mobilizer.supportedProject.toLowerCase().includes(query)
    )
    .forEach((mobilizer, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${mobilizer.name}</td>
        <td>${mobilizer.region}</td>
        <td>${mobilizer.supportedProject}</td>
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
