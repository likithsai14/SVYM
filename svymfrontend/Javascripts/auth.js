if (!sessionStorage.getItem("userId") || !sessionStorage.getItem("role")) {
  sessionStorage.clear();
  console.log("inside")
  window.location.href = "/login.html";
}
