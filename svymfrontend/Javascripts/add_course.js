document.addEventListener("DOMContentLoaded", () => {
  const addCourseBtn = document.getElementById("openAddCourseModal");
  const modal = document.getElementById("addCourseModal");
  const closeModal = document.getElementById("closeModal");
  const cancelModal = document.getElementById("cancelModal");
  const errorMsg = document.getElementById("errorMsg");

  const trainerSelect = document.getElementById("trainerSelect");
  const newTrainerFields = document.getElementById("newTrainerFields");

  const formTrainerName = document.getElementById("formTrainerName");
  const formTrainerExpertise = document.getElementById("formTrainerExpertise");
  const formTrainerMobile = document.getElementById("formTrainerMobile");
  const formTrainerEmail = document.getElementById("formTrainerEmail");
  const formTrainerSecurityQuestion = document.getElementById("formTrainerSecurityQuestion");
  const formTrainerSecurityAnswer = document.getElementById("formTrainerSecurityAnswer");

  const startDateInput = document.getElementById("startDate");
  const endDateInput = document.getElementById("endDate");
  const durationInput = document.getElementById("duration");
  const locationSelect = document.getElementById("location");
  const modulesWrapper = document.getElementById("modulesWrapper");

  // Dummy locations
  const locations = ["Bangalore", "Mysore", "Hyderabad", "Chennai"];
  locations.forEach(loc => {
    const option = document.createElement("option");
    option.value = loc;
    option.textContent = loc;
    locationSelect.appendChild(option);
  });

  // Module inputs
  function createModuleInput() {
    const div = document.createElement("div");
    div.className = "module-input";
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.innerHTML = `
      <input type="text" name="moduleNames" class="moduleName" placeholder="Module name" required style="flex:1; padding:5px; margin-right:5px;">
      <button type="button" class="icon-btn removeBtn">X</button>
    `;
    div.querySelector(".removeBtn").addEventListener("click", () => div.remove());
    return div;
  }

  modulesWrapper.innerHTML = "";
  const moduleRow = document.createElement("div");
  moduleRow.className = "module-row";
  moduleRow.style.display = "flex";
  moduleRow.style.flexWrap = "wrap";
  moduleRow.appendChild(createModuleInput());
  const addBtn = document.createElement("button");
  addBtn.type = "button";
  addBtn.className = "icon-btn";
  addBtn.textContent = "+";
  addBtn.style.marginLeft = "5px";
  addBtn.addEventListener("click", () => moduleRow.insertBefore(createModuleInput(), addBtn));
  moduleRow.appendChild(addBtn);
  modulesWrapper.appendChild(moduleRow);

  // Auto-calc duration
  function calculateDuration() {
    const start = new Date(startDateInput.value);
    const end = new Date(endDateInput.value);
    if (start && end && end >= start) {
      const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
      durationInput.value = months > 0 ? months : 0;
    } else {
      durationInput.value = "";
    }
  }
  startDateInput.addEventListener("change", calculateDuration);
  endDateInput.addEventListener("change", calculateDuration);

  // Show/hide new trainer fields
  trainerSelect.addEventListener("change", () => {
    newTrainerFields.style.display = trainerSelect.value === "addNewTrainer" ? "block" : "none";
  });

  // Open modal & populate trainers
  addCourseBtn.addEventListener("click", async () => {
    modal.classList.add("show");
    trainerSelect.innerHTML = `<option value="">Loading...</option>`;

    try {
      const res = await fetch("/.netlify/functions/allTrainers");
      const data = await res.json();
      const activeTrainers = data.trainers.filter(t => t.status === "Active");

      trainerSelect.innerHTML = `
        <option value="">Select Trainer</option>
        <option value="addNewTrainer">+ Add New Trainer</option>
        ${activeTrainers.map(t => `<option value="${t.trainerId}">${t.name}</option>`).join("")}
      `;
    } catch (err) {
      console.error(err);
      trainerSelect.innerHTML = `<option value="">Error loading trainers</option>`;
    }
  });

  // Close modal
  closeModal.addEventListener("click", () => modal.classList.remove("show"));
  cancelModal.addEventListener("click", () => modal.classList.remove("show"));
  window.addEventListener("click", e => { if (e.target === modal) modal.classList.remove("show"); });

  // Form submit
  const form = document.getElementById("courseForm");
  form.addEventListener("submit", async e => {
    e.preventDefault();
    errorMsg.textContent = "";

    const courseName = document.getElementById("trainingName").value.trim();
    const price = document.getElementById("price").value;
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;
    const duration = durationInput.value;
    const location = locationSelect.value;
    const description = document.getElementById("description").value.trim();

    const moduleInputs = document.querySelectorAll(".moduleName");
    const moduleNames = Array.from(moduleInputs).map(i => i.value.trim()).filter(n => n);

    const selectedTrainer = trainerSelect.value;
    let trainerPayload = {};

    // ✅ Updated logic — pass isNewTrainer and trainerName
    if (selectedTrainer === "addNewTrainer") {
      if (!formTrainerName.value || !formTrainerExpertise.value || !formTrainerSecurityQuestion.value || !formTrainerSecurityAnswer.value) {
        return (errorMsg.textContent = "All new trainer fields are required.");
      }
      trainerPayload = {
        isNewTrainer: true,
        name: formTrainerName.value,
        trainerName: formTrainerName.value,
        expertise: formTrainerExpertise.value,
        mobile: formTrainerMobile.value,
        email: formTrainerEmail.value,
        securityQuestion: formTrainerSecurityQuestion.value,
        securityAnswer: formTrainerSecurityAnswer.value
      };
    } else if (selectedTrainer) {
      const selectedTrainerName = trainerSelect.options[trainerSelect.selectedIndex].textContent;
      trainerPayload = {
        isNewTrainer: false,
        trainerId: selectedTrainer,
        trainerName: selectedTrainerName
      };
    } else {
      return (errorMsg.textContent = "Please select or add a trainer.");
    }

    // ✅ Fix: wrap all course fields in `course` object (matches backend)
    const payload = {
      course: {
        courseName,
        price,
        startDate,
        endDate,
        duration,
        moduleNames,
        location,
        description
      },
      addedBy: sessionStorage.getItem("userId") || "unknown",
      trainer: trainerPayload
    };

    console.log("📦 Course Payload Sent to Backend:", payload);

    try {
      const res = await fetch("/.netlify/functions/addCourseWithTrainer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(await res.text());

      alert("✅ Course added successfully!");
      form.reset();
      newTrainerFields.style.display = "none";
      durationInput.value = "";
      modulesWrapper.innerHTML = "";
      modulesWrapper.appendChild(moduleRow);
    } catch (err) {
      console.error(err);
      errorMsg.textContent = "Error: " + err.message;
    }
  });
});
