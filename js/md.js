const toggle = document.getElementById("masthead");
const currentTheme = localStorage.getItem("theme");

// Only override if user made a choice
if (currentTheme) {
   document.body.style.colorScheme = currentTheme;
}

toggle.addEventListener("click", () => {
   const isDark = getComputedStyle(document.body).colorScheme.includes("dark");
   const newTheme = isDark ? "light" : "dark";
   document.body.style.colorScheme = newTheme;
   localStorage.setItem("theme", newTheme);
});
