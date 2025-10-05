document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const userIdInput = document.getElementById("userId");
  const passwordInput = document.getElementById("password");
  const newPasswordGroup = document.getElementById("newPasswordGroup");
  const newPasswordInput = document.getElementById("newPassword");
  const confirmNewPasswordGroup = document.getElementById("confirmNewPasswordGroup");
  const confirmNewPasswordInput = document.getElementById("confirmNewPassword");
  const messageDiv = document.getElementById("message");
  const submitButton = loginForm.querySelector('button[type="submit"]');

  // 🔹 Create and insert loader element dynamically
  const loader = document.createElement("div");
  loader.id = "loader";
  loader.innerHTML = `<div class="spinner"></div><p>Logging in...</p>`;
  loader.style.display = "none";
  document.body.appendChild(loader);

  let isFirstLoginFlow = false;

  // Ensure the submit event fires even if HTML constraint validation would block it
  loginForm.noValidate = true;

  passwordInput.setAttribute("required", "required");
  newPasswordInput.removeAttribute("required");
  confirmNewPasswordInput.removeAttribute("required");

  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const userId = userIdInput.value.trim().toUpperCase();
    const password = passwordInput.value.trim();
    const newPassword = newPasswordInput.value.trim();
    const confirmNewPassword = confirmNewPasswordInput.value.trim();

    // Console debug logs
    console.log("login submit fired", { userId, isFirstLoginFlow });

    // Validate User ID format
    if (!/^(SVYM|SVYMA|SVYMS|SVYMFM|SVYMT)\d{5}$/.test(userId)) {
      showMessage("error", "Invalid User ID format. It should be SVYM followed by 5 digits.");
      return;
    }

    try {
      let endpoint = "login";
      let body = { userId, password };

      if (isFirstLoginFlow) {
        // Validate new PIN
        if (!newPassword || !confirmNewPassword) {
          showMessage("error", "Please enter and confirm your new 5-digit PIN.");
          return;
        }
        if (!/^\d{5}$/.test(newPassword)) {
          showMessage("error", "New PIN must be a 5-digit number.");
          return;
        }
        if (newPassword !== confirmNewPassword) {
          showMessage("error", "New PIN and confirmation do not match.");
          return;
        }
        endpoint = "update-pin";
        body = { userId, newPin: newPassword };
      }

      console.log("Sending fetch to endpoint:", endpoint, body);

      // 🔹 Show loader and disable button
      showLoader(true);

      const response = await fetch(`/.netlify/functions/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      let data = {};
      try {
        data = await response.json();
      } catch (e) {
        console.warn("Response JSON parse failed", e);
      }

      console.log("Fetch response", response.status, data);

      if (response.ok) {
        if (!isFirstLoginFlow && data.isFirstLoginPrompt) {
          // First login detected
          isFirstLoginFlow = true;
          passwordInput.style.display = "none";
          newPasswordGroup.style.display = "block";
          confirmNewPasswordGroup.style.display = "block";
          userIdInput.readOnly = true;
          submitButton.textContent = "Update PIN";
          showMessage("info", "This is your first login. Please set a new 5-digit PIN.");
        } else {
          // After PIN update or normal login
          if (isFirstLoginFlow) {
            showMessage("success", "PIN updated successfully! Please login with your new PIN.");
            setTimeout(() => window.location.reload(), 2000);
          } else {
            if (!data.user) {
              showMessage("error", "Invalid server response: user is missing.");
              return;
            }

            // Store session details
            sessionStorage.setItem("userId", data.user.userId);
            sessionStorage.setItem("role", data.user.role);
            sessionStorage.setItem("user", JSON.stringify(data.user));
            sessionStorage.setItem("username", data.user.username);

            const roleLower = (data.user.role || "").toLowerCase();

            // Redirect based on role
            if (roleLower === "admin") {
              window.location.href = "admin_dashboard.html";
            } else if (roleLower === "trainer") {
              window.location.href = "trainer_dashboard.html";
            } else if (
              roleLower === "fieldmobiliser" ||
              roleLower === "fieldmobilizer"
            ) {
              window.location.href = "field_mobiliser_dashboard.html";
            } else if (roleLower === "user") {
              window.location.href = "candidate_dashboard.html";
            } else {
              window.location.href = "candidate_dashboard.html";
            }
          }
        }
      } else {
        showMessage("error", data.message || "An error occurred.");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      showMessage("error", `Network error: ${err.message}`);
    } finally {
      // 🔹 Hide loader and re-enable button
      showLoader(false);
    }
  });

  // Show message below form
  function showMessage(type, text) {
    messageDiv.textContent = text;
    messageDiv.className = "";
    messageDiv.classList.add("message", type);
    messageDiv.style.display = "block";
  }

  // 🔹 Helper to toggle loader visibility
  function showLoader(show) {
    if (show) {
      loader.style.display = "flex";
      submitButton.disabled = true;
      submitButton.style.opacity = "0.6";
    } else {
      loader.style.display = "none";
      submitButton.disabled = false;
      submitButton.style.opacity = "1";
    }
  }
});
