const toggle = document.getElementById("toggle-theme");
const currentTheme = localStorage.getItem("theme");

// Only override if user made a choice
if (currentTheme) {
   document.body.style.colorScheme = currentTheme;
}

// Set toggle icon based on actual computed scheme
toggle.textContent = getComputedStyle(document.body).colorScheme.includes(
   "dark",
)
   ? "☾"
   : "☀";

toggle.addEventListener("click", () => {
   const isDark = getComputedStyle(document.body).colorScheme.includes("dark");
   const newTheme = isDark ? "light" : "dark";
   document.body.style.colorScheme = newTheme;
   localStorage.setItem("theme", newTheme);
   toggle.textContent = newTheme === "dark" ? "☾" : "☀";
});
