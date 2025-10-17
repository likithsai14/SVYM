document.addEventListener("DOMContentLoaded", async () => {
  const welcomeMessage = document.getElementById("welcomeMessage");
  const totalStudents = document.getElementById("totalStudents");
  const activeStudents = document.getElementById("activeStudents");
  const followup1Students = document.getElementById("followup1Students");
  const followup2Students = document.getElementById("followup2Students");
  const inactiveStudents = document.getElementById("inactiveStudents");

  // Set welcome message from sessionStorage like trainer
  const loggedInUserName = JSON.parse(sessionStorage.getItem("user")).username;
  if (welcomeMessage && loggedInUserName) {
    const displayUserName = loggedInUserName.charAt(0).toUpperCase() + loggedInUserName.slice(1);
    welcomeMessage.textContent = `Welcome, ${displayUserName}!`;
  } else if (welcomeMessage) {
    welcomeMessage.textContent = `Welcome to SVYM, Field Mobiliser!`;
  }

  // Fetch students stats
  async function fetchStudentsStats() {
    try {
      const mobiliserId = sessionStorage.getItem("userId");
      if (!mobiliserId) throw new Error("Mobiliser ID not found in sessionStorage");

      const response = await fetch("/.netlify/functions/getFieldMobiliserStudentsStats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobiliserId })
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const stats = await response.json();
      totalStudents.textContent = stats.total || 0;
      activeStudents.textContent = stats.active || 0;
      followup1Students.textContent = stats.followup1 || 0;
      followup2Students.textContent = stats.followup2 || 0;
      inactiveStudents.textContent = stats.inactive || 0;
    } catch (error) {
      console.error("Error fetching students stats:", error);
      // Keep default values (0)
    }
  }

  // Initialize dashboard
  fetchStudentsStats();
});
