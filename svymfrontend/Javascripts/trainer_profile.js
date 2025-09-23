document.addEventListener("DOMContentLoaded", () => {
    // Fetch trainer ID from session
    const trainerId = sessionStorage.getItem("userId") || "TR12345";

    // Sample dynamic data (replace with API)
    const trainerData = {
        trainerId: trainerId,
        trainerName: "John Doe",
        trainerEmail: "johndoe@example.com",
        trainerPhone: "+91-9876543210",
        trainerRole: "Senior Trainer",
        trainerJoined: "2023-01-15"
    };

    // Populate profile details
    document.getElementById("trainerId").textContent = trainerData.trainerId;
    document.getElementById("trainerName").textContent = trainerData.trainerName;
    document.getElementById("trainerEmail").textContent = trainerData.trainerEmail;
    document.getElementById("trainerPhone").textContent = trainerData.trainerPhone;
    document.getElementById("trainerRole").textContent = trainerData.trainerRole;
    document.getElementById("trainerJoined").textContent = `Joined: ${new Date(trainerData.trainerJoined).toLocaleDateString()}`;

    // Side menu toggle
    const hamburger = document.getElementById("hamburger");
    const overlay = document.getElementById("overlay");
    const sideMenu = document.getElementById("sideMenu");

    hamburger.addEventListener("click", () => {
        sideMenu.classList.toggle("active");
        overlay.classList.toggle("active");
    });
    overlay.addEventListener("click", () => {
        sideMenu.classList.remove("active");
        overlay.classList.remove("active");
    });

    // Action buttons
    document.getElementById("updateProfileBtn").addEventListener("click", () => {
        alert("Redirect to Update Profile Page (or show modal)");
    });
    document.getElementById("changePasswordBtn").addEventListener("click", () => {
        alert("Redirect to Change Password Page (or show modal)");
    });
});
