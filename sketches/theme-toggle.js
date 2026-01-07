// Theme toggle functionality
const toggle = document.getElementById("toggle-theme");
const body = document.body;

// Check for saved theme preference or default to 'light'
const currentTheme = localStorage.getItem("theme") || "light";
body.style.colorScheme = currentTheme;
toggle.textContent = currentTheme === "light" ? "☀" : "☾";

// Toggle theme on click
toggle.addEventListener("click", () => {
   const newTheme = body.style.colorScheme === "light" ? "dark" : "light";
   body.style.colorScheme = newTheme;
   localStorage.setItem("theme", newTheme);
   toggle.textContent = newTheme === "light" ? "☀" : "☾";
});
