// if(!sessionStorage.getItem("user")) return;

const user = JSON.parse(sessionStorage.getItem("user"));
let url = "../public/partials//admin_nav.html";

if (user) {
  if (user.role === "admin") {
    url = "../public/partials//admin_nav.html";
  } else if (user.role === "trainer") {
    url = "../public/partials//trainer_nav.html";
  } else if (user.role === "fieldMobiliser") {
    url = "../public/partials//field_mobilizer_nav.html";
  } else if (user.role === "user") {
    url = "../public/partials//student_nav.html";
  }
}

fetch(url)
  .then((res) => res.text())
  .then((data) => {
    const activeLink = window.location.pathname;
    document.getElementsByClassName("side-menu")[0].innerHTML = data;

    // 🌟 Display logged-in username (if available)
    const userInfo = JSON.parse(sessionStorage.getItem("user"));
    if (userInfo && userInfo.username) {
      const usernameDisplay = document.getElementById("usernameDisplay");
      if (usernameDisplay) {
        usernameDisplay.textContent = "Welcome, " + userInfo.username;
      }
    }

    // ✅ Highlight active navigation link
    const navLinks = document.querySelectorAll(".side-menu a.nav-link");
    switch (activeLink) {
      case "/admin_dashboard.html": {
        navLinks[0]?.classList.add("active");
        break;
      }
      case "/admin_students.html": {
        navLinks[1]?.classList.add("active");
        break;
      }
      case "/admin_trainers.html": {
        navLinks[2]?.classList.add("active");
        break;
      }
      case "/admin_field_mobilisers.html": {
        navLinks[3]?.classList.add("active");
        break;
      }
      case "/admin_courses.html": {
        navLinks[4]?.classList.add("active");
        break;
      }
      case "/admin_fee_management.html": {
        navLinks[5]?.classList.add("active");
        break;
      }
      case "/admin_placements.html": {
        navLinks[6]?.classList.add("active");
        break;
      }
      case "/admin_reports.html": {
        navLinks[7]?.classList.add("active");
        break;
      }
    }

    // ✅ Handle sidebar toggle (hamburger menu)
    const hamburgerMenu = document.getElementById("hamburgerMenu");
    const sidebar = document.querySelector(".side-menu");
    if (hamburgerMenu && sidebar) {
      hamburgerMenu.addEventListener("click", () => {
        sidebar.classList.toggle("active");
      });
    }
  })
  .catch((err) => console.error("Failed to load nav:", err));

const logout = () => {
  sessionStorage.clear();
  window.location.href = "login.html";
};
