document.addEventListener("DOMContentLoaded", async () => {
  const addModuleBtn = document.getElementById("addModuleBtn");
  const modulesList = document.getElementById("modulesList");
  const totalModules = document.getElementById("totalModules");

  // Redirect to add_module.html when button is clicked
  if (addModuleBtn) {
    addModuleBtn.addEventListener("click", () => {
      window.location.href = "add_module.html";
    });
  }

  // Use the same DB as add_module.html
  const db = new PouchDB("svym_courses");

  // Fetch and render modules
  async function renderModules() {
    const result = await db.allDocs({ include_docs: true });
    const modules = result.rows
      .map(row => row.doc)
      .filter(doc => doc.type === "module"); // only modules

    totalModules.textContent = modules.length;

    if (modules.length === 0) {
      modulesList.innerHTML = "<p>No modules added yet.</p>";
      return;
    }

    // Create table
    modulesList.innerHTML = `
      <table class="module-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Training Name</th>
            <th>Module Name</th>
            <th>Duration</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${modules.map((module, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${module.trainingName}</td>
              <td>${module.moduleName}</td>
              <td>${module.startDate} → ${module.endDate}</td>
              <td>${module.status}</td>
              <td>
                <button class="edit-btn" data-id="${module._id}"><i class="fas fa-edit"></i> Edit</button>
                <button class="delete-btn" data-id="${module._id}"><i class="fas fa-trash"></i> Delete</button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;

    // Attach event listeners
    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const id = e.target.closest("button").dataset.id;
        const doc = await db.get(id);
        await db.remove(doc);
        renderModules(); // refresh
      });
    });

    document.querySelectorAll(".edit-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.target.closest("button").dataset.id;
        window.location.href = `add_module.html?id=${id}`;
      });
    });
  }

  renderModules();
});
