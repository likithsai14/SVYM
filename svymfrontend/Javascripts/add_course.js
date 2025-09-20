const form = document.getElementById("courseForm");
const modulesWrapper = document.getElementById("modulesWrapper");
const errorMsg = document.getElementById("errorMsg");

// Function to create a new module row with remove button
function createModuleRow() {
  const div = document.createElement("div");
  div.className = "module";
  div.innerHTML = `
    <input type="text" name="moduleNames" class="moduleName" placeholder="Enter module name" required>
    <button type="button" class="icon-btn removeBtn">X</button>
  `;

  // Attach remove handler
  div.querySelector(".removeBtn").addEventListener("click", () => div.remove());
  return div;
}

// Attach event listener to existing '+' button in HTML
const addModuleBtn = document.getElementById("addModuleBtn");
addModuleBtn.addEventListener("click", () => {
  modulesWrapper.appendChild(createModuleRow());
});

// Form submit handler
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorMsg.textContent = "";

  const courseName = document.getElementById("trainingName").value.trim();
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;
  const moduleInputs = document.querySelectorAll(".moduleName");

  // Collect module names
  const moduleNames = Array.from(moduleInputs)
    .map(input => input.value.trim())
    .filter(name => name.length > 0);

  // Validation
  if (!courseName) return errorMsg.textContent = "Course name is required.";
  if (!startDate || !endDate) return errorMsg.textContent = "Start date and End date are required.";
  if (new Date(endDate) < new Date(startDate)) return errorMsg.textContent = "End date must be after Start date.";
  if (moduleNames.length === 0) return errorMsg.textContent = "At least one module name is required.";

  const addedBy = sessionStorage.getItem("userId") || "unknown";

  try {
    const response = await fetch("/.netlify/functions/addCourse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseName,
        startDate,
        endDate,
        moduleNames,
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

    // Reset form after success
    form.reset();
    // Keep only the first module row with '+' button
    modulesWrapper.innerHTML = `
      <div class="module">
        <input type="text" name="moduleNames" class="moduleName" placeholder="Enter module name" required>
        <button type="button" id="addModuleBtn" class="icon-btn">+</button>
      </div>
    `;
    // Reattach event listener to reset '+' button
    document.getElementById("addModuleBtn").addEventListener("click", () => {
      modulesWrapper.appendChild(createModuleRow());
    });

  } catch (err) {
    console.error(err);
    errorMsg.textContent = "Error: " + err.message;
  }
});
