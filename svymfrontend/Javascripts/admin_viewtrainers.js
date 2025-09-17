const trainersTableBody = document.getElementById("fieldmobiliserTableBody");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

let allTrainers = [];
let currentPage = 1;
const rowsPerPage = 5; // pagination limit

// ✅ Fetch trainers from backend
async function fetchTrainers() {
  try {
    const response = await fetch("/.netlify/functions/allTrainers");
    if (!response.ok) throw new Error("Failed to fetch trainers");

    const data = await response.json();
    allTrainers = data.trainers || [];

    console.log("Fetched trainers:", allTrainers);
    renderTrainersTable();
  } catch (error) {
    console.error("Error fetching trainers:", error);
    trainersTableBody.innerHTML =
      '<tr><td colspan="6">Error loading trainers.</td></tr>';
  }
}

// ✅ Generic function to update trainer status
async function updateTrainerStatus(userId, newStatus) {
  const actionText = newStatus === "Active" ? "activate" : "deactivate";

  if (!confirm(`Are you sure you want to ${actionText} trainer ${userId}?`)) return;

  try {
    const response = await fetch("/.netlify/functions/updateTrainerStatus", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, status: newStatus }),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to update");

    // Update local array
    const trainer = allTrainers.find((t) => t.userId === userId);
    if (trainer) trainer.status = newStatus;

    renderTrainersTable();
    showMainMessage("success", `Trainer ${userId} ${actionText}d successfully.`);
  } catch (error) {
    console.error(`Error trying to ${actionText} trainer:`, error);
    showMainMessage("error", `Error trying to ${actionText} trainer.`);
  }
}

// ✅ Render trainers into table
function renderTrainersTable() {
  if (!trainersTableBody) {
    console.error("trainersTableBody element not found!");
    return;
  }

  trainersTableBody.innerHTML = "";

  // Apply search filter
  const searchValue = searchInput.value.toLowerCase();
  const filtered = allTrainers.filter((t) =>
    t.name.toLowerCase().includes(searchValue)
  );

  // Pagination
  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const paginated = filtered.slice(start, end);

  if (paginated.length === 0) {
    trainersTableBody.innerHTML =
      '<tr><td colspan="6">No trainer records found.</td></tr>';
    return;
  }

  paginated.forEach((trainer) => {
    const row = `
      <tr>
        <td>${trainer.userId}</td>
        <td>${trainer.name || "N/A"}</td>
        <td>${trainer.email || "N/A"}</td>
        <td>${trainer.expertise || "N/A"}</td>
        <td class=" ${trainer.status === 'active' ? 'approved' : 'rejected'}">${trainer.status || "N/A"}</td>
        <td>
          ${
            trainer.status === "Active"
              ? `
                <button class="action-btn edit-btn edit-trainer-btn" data-user-id="${trainer.userId}">Edit</button>
                <button class="action-btn delete-btn deactivate-trainer-btn" data-user-id="${trainer.userId}">Deactivate</button>
              `
              : `
                <button class="action-btn view-btn activate-trainer-btn" data-user-id="${trainer.userId}">Activate</button>
              `
          }
        </td>
      </tr>
    `;
    trainersTableBody.insertAdjacentHTML("beforeend", row);
  });

  // ✅ Attach button listeners after rendering
  trainersTableBody.querySelectorAll(".deactivate-trainer-btn").forEach((btn) =>
    btn.addEventListener("click", () => updateTrainerStatus(btn.dataset.userId, "Inactive"))
  );

  trainersTableBody.querySelectorAll(".activate-trainer-btn").forEach((btn) =>
    btn.addEventListener("click", () => updateTrainerStatus(btn.dataset.userId, "Active"))
  );

  trainersTableBody.querySelectorAll(".edit-trainer-btn").forEach((btn) =>
    btn.addEventListener("click", () => openAddEditTrainerModal(btn.dataset.userId))
  );
}

// ✅ Search event
searchBtn.addEventListener("click", () => {
  currentPage = 1;
  renderTrainersTable();
});
searchInput.addEventListener("keyup", () => {
  currentPage = 1;
  renderTrainersTable();
});

// ✅ Pagination
document.getElementById("prevBtn").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderTrainersTable();
  }
});

document.getElementById("nextBtn").addEventListener("click", () => {
  const filtered = allTrainers.filter((t) =>
    t.name.toLowerCase().includes(searchInput.value.toLowerCase())
  );
  if (currentPage * rowsPerPage < filtered.length) {
    currentPage++;
    renderTrainersTable();
  }
});

// ✅ Initialize
document.addEventListener("DOMContentLoaded", fetchTrainers);
