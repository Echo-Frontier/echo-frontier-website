// script.js

const hours = 24;
const increments = 2;
const days = 7;
const personCount = 5;

// cells from your availability.html grid
const cells = window.availabilityCells;

// Helper to get person selection (you can add a <select> in HTML)
const personSelect = document.createElement("select");
for (let i = 1; i <= personCount; i++) {
  const opt = document.createElement("option");
  opt.value = i;
  opt.textContent = `Person ${i}`;
  personSelect.appendChild(opt);
}
document.querySelector(".availability-header").appendChild(personSelect);

// Build a 2D array for the grid: 7 days × 48 slots
function getGridData() {
  const grid = Array.from({ length: days }, () => Array(48).fill(0));
  cells.forEach(cell => {
    const row = parseInt(cell.dataset.row);
    const day = parseInt(cell.dataset.day);
    const isActive = cell.style.backgroundColor === "rgb(106, 166, 255)"; // #6aa6ff
    grid[day][row] = isActive ? 1 : 0;
  });
  return grid;
}

// Save button handler
document.getElementById("editButton").addEventListener("click", async () => {
  const person = parseInt(personSelect.value);
  const gridData = getGridData();

  try {
    const res = await fetch('https://YOUR_NETLIFY_SITE.netlify.app/api/saveAvailability', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        person,
        grid: gridData // send entire 7x48 array at once
      })
    });

    const result = await res.json();
    const msg = document.getElementById("statusMessage");
    msg.textContent = result.message || "Availability saved!";
    msg.style.color = "green";
  } catch (err) {
    console.error(err);
    const msg = document.getElementById("statusMessage");
    msg.textContent = "Failed to save availability.";
    msg.style.color = "red";
  }
});
