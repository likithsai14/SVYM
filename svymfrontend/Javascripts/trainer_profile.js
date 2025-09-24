document.addEventListener("DOMContentLoaded", () => {
    // Fetch trainer ID from session
    const trainerId = sessionStorage.getItem("userId") || "TR12345";

    // Sample dynamic data (replace with API fetch)
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
    document.getElementById("trainerJoined").textContent =
        `Joined: ${new Date(trainerData.trainerJoined).toLocaleDateString()}`;

    // --- Modal Handling ---
    const openModal = (id) => document.getElementById(id).style.display = "flex";
    const closeModal = (id) => document.getElementById(id).style.display = "none";

    document.querySelectorAll(".modal-close").forEach(btn => {
        btn.addEventListener("click", () => closeModal(btn.dataset.close));
    });

    // Open modals
    document.getElementById("updateProfileBtn").addEventListener("click", () => {
        // Pre-fill data
        document.getElementById("updName").value = trainerData.trainerName;
        document.getElementById("updEmail").value = trainerData.trainerEmail;
        document.getElementById("updPhone").value = trainerData.trainerPhone;
        openModal("updateProfileModal");
    });

    document.getElementById("changePasswordBtn").addEventListener("click", () => {
        openModal("changePasswordModal");
    });

    // --- Update Profile Submit ---
    document.getElementById("updateProfileForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const updatedData = {
            trainerId: trainerData.trainerId,
            name: document.getElementById("updName").value,
            email: document.getElementById("updEmail").value,
            phone: document.getElementById("updPhone").value
        };

        try {
            const res = await fetch("/.netlify/functions/updateTrainer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedData)
            });
            const result = await res.json();
            alert(result.message || "Profile updated!");

            // Update UI
            document.getElementById("trainerName").textContent = updatedData.name;
            document.getElementById("trainerEmail").textContent = updatedData.email;
            document.getElementById("trainerPhone").textContent = updatedData.phone;

            closeModal("updateProfileModal");
        } catch (err) {
            alert("Error updating profile: " + err.message);
        }
    });

    // --- Change Password Submit ---
    document.getElementById("changePasswordForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const current = document.getElementById("currentPassword").value;
        const newPass = document.getElementById("newPassword").value;
        const confirm = document.getElementById("confirmPassword").value;

        if (newPass !== confirm) {
            alert("New Password and Confirm Password do not match!");
            return;
        }
        if (!/^\d{5}$/.test(newPass)) {
            alert("Password must be exactly 5 digits.");
            return;
        }

        try {
            const res = await fetch("/.netlify/functions/changePassword", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ trainerId, current, newPass })
            });
            const result = await res.json();
            alert(result.message || "Password changed!");
            closeModal("changePasswordModal");
        } catch (err) {
            alert("Error changing password: " + err.message);
        }
    });

    // --- Side menu toggle ---
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
});
