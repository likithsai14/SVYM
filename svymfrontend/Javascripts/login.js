function initLogin() {
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
              window.location.href = "student_dashboard.html";
            } else {
              window.location.href = "student_dashboard.html";
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

  // ------------------ Forgot Password Modal ------------------
  const forgotPasswordLink = document.getElementById("forgotPasswordLink");

  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener("click", (e) => {
      e.preventDefault();
      openForgotModal();
    });
  }

  // Create and manage forgot-password modal
  function openForgotModal() {
    // If modal already exists, remove it first
    const existing = document.getElementById("forgotModal");
    if (existing) existing.remove();

    const modal = document.createElement("div");
    modal.id = "forgotModal";
    modal.className = "modal";
    modal.innerHTML = `
      <div class="modal-content" style="max-width:520px;padding:20px;">
        <span class="close-btn" id="forgotClose">&times;</span>
        <h3>Forgot PIN / Password</h3>
        <p>Enter your User ID to receive a one-time OTP to your registered email.</p>
        <div style="margin-top:12px;">
          <label>User ID</label>
          <input type="text" id="fpUserId" placeholder="SVYM12345" style="width:100%;padding:8px;margin-top:6px;" value="${userIdInput.value || ''}" />
        </div>
        <div id="fpStatus" style="margin-top:10px;color:#444"></div>
        <div style="display:flex;gap:10px;margin-top:14px;">
          <button id="getOtpBtn" class="download-button">Get OTP</button>
          <button id="cancelForgot" class="download-button" style="background:#ccc;color:#000">Cancel</button>
        </div>
        <div id="otpArea" style="display:none;margin-top:12px;">
          <p id="maskedEmail" style="color:#333"></p>
          <label>Enter OTP</label>
          <input type="password" id="enteredOtp" maxlength="6" inputmode="numeric" pattern="\d{6}" autocomplete="one-time-code" autocorrect="off" spellcheck="false" style="width:100%;padding:8px;margin-top:6px;" />
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;">
            <small id="otpTimer" style="color:#666">Time left: 90s</small>
            <button id="verifyOtpBtn" class="download-button">Verify OTP</button>
          </div>
        </div>
      </div>
    `;

  document.body.appendChild(modal);
    // Ensure modal shows as overlay. Add 'show' class and fallback inline styles
    try {
      modal.classList.add('show');
      // Fallback inline styles in case CSS didn't load or is overridden
      modal.style.display = 'flex';
      modal.style.position = 'fixed';
      modal.style.left = '0';
      modal.style.top = '0';
      modal.style.width = '100%';
      modal.style.height = '100%';
      modal.style.backgroundColor = 'rgba(0,0,0,0.4)';
      modal.style.justifyContent = 'center';
      modal.style.alignItems = 'center';
      modal.style.padding = '20px';
      modal.style.zIndex = '2000';
    } catch (e) {
      console.warn('Could not apply modal fallback styles', e);
    }

    // Wire up controls
    function cleanupModal() {
      try {
        // stop timer if running
        if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
      } catch (e) { /* ignore */ }
      try { otpArea.style.display = 'none'; } catch (e) {}
      try { maskedEmailP.textContent = ''; } catch (e) {}
      try { enteredOtp.value = ''; } catch (e) {}
      try { fpStatus.textContent = ''; } catch (e) {}
      try { otpTimer.textContent = 'Time left: 90s'; } catch (e) {}
      try { fpUserIdInput.value = ''; } catch (e) {}
      try { sessionStorage.removeItem('forgotOtp'); } catch (e) {}
    }

    document.getElementById("forgotClose").addEventListener("click", () => { cleanupModal(); modal.remove(); });
    document.getElementById("cancelForgot").addEventListener("click", () => { cleanupModal(); modal.remove(); });

  const getOtpBtn = document.getElementById("getOtpBtn");
    const fpUserIdInput = document.getElementById("fpUserId");
    const fpStatus = document.getElementById("fpStatus");
    const otpArea = document.getElementById("otpArea");
    const maskedEmailP = document.getElementById("maskedEmail");
    const enteredOtp = document.getElementById("enteredOtp");
    const otpTimer = document.getElementById("otpTimer");
    const verifyOtpBtn = document.getElementById("verifyOtpBtn");

    let timerInterval = null;

  // Reset modal inputs/state on open
  try { fpUserIdInput.value = ''; } catch (e) {}
  try { fpStatus.textContent = ''; } catch (e) {}
  try { otpArea.style.display = 'none'; } catch (e) {}
  try { maskedEmailP.textContent = ''; } catch (e) {}
  try { enteredOtp.value = ''; enteredOtp.autocomplete = 'one-time-code'; } catch (e) {}
  try { otpTimer.textContent = 'Time left: 90s'; } catch (e) {}
  try { sessionStorage.removeItem('forgotOtp'); } catch (e) {}

    getOtpBtn.addEventListener("click", async () => {
      fpStatus.textContent = "";
      const fpUserId = (fpUserIdInput.value || "").trim().toUpperCase();
      if (!/^(SVYM|SVYMA|SVYMS|SVYMFM|SVYMT)\d{5}$/.test(fpUserId)) {
        fpStatus.style.color = "#c62828";
        fpStatus.textContent = "Invalid User ID format.";
        return;
      }

      try {
        fpStatus.style.color = "#444";
        fpStatus.textContent = "Requesting OTP...";

        const resp = await fetch(`/.netlify/functions/requestOtp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: fpUserId })
        });

        const json = await resp.json();
        if (!resp.ok) {
          fpStatus.style.color = '#c62828';
          fpStatus.textContent = json.message || 'Failed to request OTP.';
          return;
        }

        // Show masked email returned by server
        maskedEmailP.textContent = `OTP will be sent to: ${json.maskedEmail}`;
        fpStatus.style.color = '#2e7d32';
        fpStatus.textContent = 'OTP sent. Please check your email.';
        otpArea.style.display = 'block';

        // Start countdown (client-side display only)
        if (timerInterval) clearInterval(timerInterval);
        let remaining = 90;
        otpTimer.textContent = `Time left: ${remaining}s`;
        timerInterval = setInterval(() => {
          remaining -= 1;
          if (remaining <= 0) {
            clearInterval(timerInterval);
            otpTimer.textContent = 'OTP expired.';
            fpStatus.style.color = '#c62828';
            fpStatus.textContent = 'OTP expired. Please request a new OTP.';
          } else {
            otpTimer.textContent = `Time left: ${remaining}s`;
          }
        }, 1000);

      } catch (err) {
        console.error(err);
        fpStatus.style.color = "#c62828";
        fpStatus.textContent = "Error while requesting OTP. Please try again later.";
      }
    });

    verifyOtpBtn.addEventListener('click', async (evt) => {
      evt.preventDefault();
      const entered = (document.getElementById('enteredOtp').value || '').trim();
      const fpUserId = (fpUserIdInput.value || '').trim().toUpperCase();
      if (!entered) {
        alert('Please enter the OTP received in your email.');
        return;
      }

      try {
        const resp = await fetch(`/.netlify/functions/verifyOtp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: fpUserId, otp: entered })
        });
        const json = await resp.json();
        if (!resp.ok) {
          alert(json.message || 'Failed to verify OTP.');
          return;
        }

  // OTP valid. Close modal and switch login form to update-pin flow
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  cleanupModal();
  const modalEl = document.getElementById('forgotModal');
  if (modalEl) modalEl.remove();

        // Populate the login userId input and set up update PIN UI
        userIdInput.value = fpUserId;
        isFirstLoginFlow = true;
        passwordInput.style.display = 'none';
        newPasswordGroup.style.display = 'block';
        confirmNewPasswordGroup.style.display = 'block';
        userIdInput.readOnly = true;
        submitButton.textContent = 'Update PIN';
        showMessage('info','OTP verified. Enter your new 5-digit PIN below and submit to update.');

      } catch (err) {
        console.error('verify OTP error', err);
        alert('Error verifying OTP. Please try again later.');
      }
    });
  }

  // Expose for resilience: allow other code or delegated listeners to open the modal
  try { window.openForgotModal = openForgotModal; } catch (e) { /* ignore */ }

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
}

// Ensure init runs whether the script is loaded before or after DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLogin);
} else {
  initLogin();
}

// Delegated click handler: if the forgot link exists or is clicked, attempt to open modal via exposed function
document.addEventListener('click', function (e) {
  try {
    const target = e.target || e.srcElement;
    if (!target) return;
    if (target.id === 'forgotPasswordLink' || target.closest && target.closest('#forgotPasswordLink')) {
      e.preventDefault();
      if (typeof window.openForgotModal === 'function') {
        window.openForgotModal();
      } else {
        console.warn('openForgotModal not available yet');
      }
    }
  } catch (err) {
    console.error('delegated forgot click error', err);
  }
});
