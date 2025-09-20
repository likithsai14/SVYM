const form = document.getElementById("courseForm");
const modulesWrapper = document.getElementById("modulesWrapper");
const errorMsg = document.getElementById("errorMsg");
const startDateInput = document.getElementById("startDate");
const endDateInput = document.getElementById("endDate");
const durationInput = document.getElementById("duration");
const locationSelect = document.getElementById("location");

// Dummy location list (replace with API if needed)
const locations = ["Bangalore", "Mysore", "Hyderabad", "Chennai"];
locations.forEach(loc => {
  const option = document.createElement("option");
  option.value = loc;
  option.textContent = loc;
  locationSelect.appendChild(option);
});

// Create a single module input with remove button
function createModuleInput() {
  const div = document.createElement("div");
  div.className = "module-input";
  div.style.display = "flex";
  div.style.alignItems = "center";
  div.style.marginRight = "10px";
  div.innerHTML = `
    <input type="text" name="moduleNames" class="moduleName" placeholder="Module name" required style="flex:1; padding:5px; margin-right:5px;">
    <button type="button" class="icon-btn removeBtn">X</button>
  `;
  const removeBtn = div.querySelector(".removeBtn");
  removeBtn.addEventListener("click", () => div.remove());
  return div;
}

// Initialize the first module input
modulesWrapper.innerHTML = "";
const initialRow = document.createElement("div");
initialRow.className = "module-row";
initialRow.style.display = "flex";
initialRow.style.flexWrap = "wrap";
initialRow.appendChild(createModuleInput());

// Add "+" button at the end of the row
const addBtn = document.createElement("button");
addBtn.type = "button";
addBtn.className = "icon-btn";
addBtn.textContent = "+";
addBtn.style.marginLeft = "5px";
initialRow.appendChild(addBtn);

modulesWrapper.appendChild(initialRow);

// Add module on "+" click
addBtn.addEventListener("click", () => {
  const newModule = createModuleInput();
  // If current row is full (approximation), create new row
  if (initialRow.scrollWidth > modulesWrapper.clientWidth) {
    const newRow = document.createElement("div");
    newRow.className = "module-row";
    newRow.style.display = "flex";
    newRow.style.flexWrap = "wrap";
    newRow.appendChild(newModule);
    modulesWrapper.appendChild(newRow);
  } else {
    initialRow.insertBefore(newModule, addBtn);
  }
});

// Auto calculate duration in months
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

// Form submit handler
form.addEventListener("submit", async (e) => {
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
  const moduleNames = Array.from(moduleInputs)
    .map(input => input.value.trim())
    .filter(name => name.length > 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0); // ignore time part
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Validation
  if (!courseName) return errorMsg.textContent = "Course name is required.";
  if (!price || price < 0) return errorMsg.textContent = "Valid price is required.";
  if (!startDate || !endDate) return errorMsg.textContent = "Start date and End date are required.";
  if (start < today) return errorMsg.textContent = "Start date cannot be in the past.";
  if (end < start) return errorMsg.textContent = "End date must be after Start date.";
  if (moduleNames.length === 0) return errorMsg.textContent = "At least one module name is required.";
  if (!location) return errorMsg.textContent = "Location is required.";
  if (!description) return errorMsg.textContent = "Description is required.";

  const addedBy = sessionStorage.getItem("userId") || "unknown";

  try {
    const response = await fetch("/.netlify/functions/addCourse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseName,
        price,
        startDate,
        endDate,
        duration,
        moduleNames,
        location,
        description,
        addedBy
      })
    });

    if (!response.ok) {
      const resText = await response.text();
      throw new Error("Server returned " + response.status + ": " + resText);
    }

    const result = await response.json();
    alert("Course added successfully!");
    console.log("Server response:", result);

    // Reset form
    form.reset();
    durationInput.value = "";

    modulesWrapper.innerHTML = "";
    const newRow = document.createElement("div");
    newRow.className = "module-row";
    newRow.style.display = "flex";
    newRow.style.flexWrap = "wrap";
    newRow.appendChild(createModuleInput());
    const newAddBtn = document.createElement("button");
    newAddBtn.type = "button";
    newAddBtn.className = "icon-btn";
    newAddBtn.textContent = "+";
    newAddBtn.style.marginLeft = "5px";
    newRow.appendChild(newAddBtn);
    modulesWrapper.appendChild(newRow);

    // Reattach listener
    newAddBtn.addEventListener("click", () => {
      const mod = createModuleInput();
      if (newRow.scrollWidth > modulesWrapper.clientWidth) {
        const extraRow = document.createElement("div");
        extraRow.className = "module-row";
        extraRow.style.display = "flex";
        extraRow.style.flexWrap = "wrap";
        extraRow.appendChild(mod);
        modulesWrapper.appendChild(extraRow);
      } else {
        newRow.insertBefore(mod, newAddBtn);
      }
    });

  } catch (err) {
    console.error(err);
    errorMsg.textContent = "Error: " + err.message;
  }
});
