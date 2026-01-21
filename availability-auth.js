// ===== SIMPLE STATIC AUTH =====
const USER = "EchoFrontier";
const PASS = "3ch0Fr0ntier";

const loginScreen = document.getElementById("login-screen");
const content = document.getElementById("availability-content");
const errorText = document.getElementById("login-error");

function unlock() {
  loginScreen.style.display = "none";
  content.style.display = "block";
}

if (sessionStorage.getItem("ef-auth") === "true") {
  unlock();
}

document.getElementById("login-form").addEventListener("submit", e => {
  e.preventDefault();

  const u = document.getElementById("username").value;
  const p = document.getElementById("password").value;

  if (u === USER && p === PASS) {
    sessionStorage.setItem("ef-auth", "true");
    unlock();
  } else {
    errorText.style.display = "block";
  }
});
