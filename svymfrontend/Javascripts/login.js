document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const userIdInput = document.getElementById("userId");
  const passwordInput = document.getElementById("password");
  const newPasswordGroup = document.getElementById("newPasswordGroup");
  const newPasswordInput = document.getElementById("newPassword");
  const confirmNewPasswordGroup = document.getElementById(
    "confirmNewPasswordGroup"
  );
  const confirmNewPasswordInput = document.getElementById("confirmNewPassword");
  const messageDiv = document.getElementById("message");
  const submitButton = loginForm.querySelector('button[type="submit"]');

  let isFirstLoginFlow = false;

  passwordInput.setAttribute("required", "required");
  newPasswordInput.removeAttribute("required");
  confirmNewPasswordInput.removeAttribute("required");

  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const userId = userIdInput.value.trim().toUpperCase();
    const password = passwordInput.value.trim();
    const newPassword = newPasswordInput.value.trim();
    const confirmNewPassword = confirmNewPasswordInput.value.trim();

    // Validate User ID
    if (
      !userId.startsWith("SVYM") ||
      !/^(SVYM|SVYMA|SVYMS|SVYMFM|SVYMT)\d{5}$/.test(userId)
    ) {
      showMessage(
        "error",
        "Invalid User ID format. It should be SVYM followed by 5 digits."
      );
      return;
    }

    try {
      let endpoint = "login";
      let body = { userId, password };

      if (isFirstLoginFlow) {
        // Validate new PIN
        if (!newPassword || !confirmNewPassword) {
          showMessage(
            "error",
            "Please enter and confirm your new 5-digit PIN."
          );
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
        body = { userId, newPin: newPassword }; // oldPin not needed for first login
      }

      const response = await fetch(`/.netlify/functions/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        if (!isFirstLoginFlow && data.isFirstLoginPrompt) {
          // Trigger first-login flow
          isFirstLoginFlow = true;
          passwordInput.style.display = "none";
          newPasswordGroup.style.display = "block";
          confirmNewPasswordGroup.style.display = "block";
          userIdInput.readOnly = true; // User ID readonly
          submitButton.textContent = "Update PIN";
          showMessage(
            "info",
            "This is your first login. Please set a new 5-digit PIN."
          );
        } else {
          // Reset to normal login page after successful PIN update
          if (isFirstLoginFlow) {
            showMessage(
              "success",
              "PIN updated successfully! Please login with your new PIN."
            );
            setTimeout(() => window.location.reload(), 2000);
          } else {
            // Normal login
            sessionStorage.setItem("userId", data.user.userId);
            sessionStorage.setItem("role", data.user.role);
            sessionStorage.setItem("user", JSON.stringify(data.user));
            if (data.user.role === "admin") {
              window.location.href = "admin_dashboard.html";
            } else if (data.user.role === "trainer") {
              window.location.href = "trainer_dashboard.html";
            }else if (data.user.role === "fieldMobiliser") {
              window.location.href = "field_mobiliser_dashboard.html";
            } else if (data.user.role === "user") {
              // check if user is student or trainer or field_mobiliser
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
    }
  });

  function showMessage(type, text) {
    messageDiv.textContent = text;
    messageDiv.className = "";
    messageDiv.classList.add("message", type);
    messageDiv.style.display = "block";
  }
});
