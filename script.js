// script.js

// Function to POST availability data to Netlify
async function saveAvailability(data) {
  try {
    const res = await fetch('https://YOUR_NETLIFY_SITE.netlify.app/api/saveAvailability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await res.json();
    console.log(result);

    // Show feedback to the user
    const message = document.getElementById('statusMessage');
    message.textContent = result.message || "Saved successfully!";
    message.style.color = "green";

  } catch (err) {
    console.error("Failed to save availability:", err);
    const message = document.getElementById('statusMessage');
    message.textContent = "Error saving availability.";
    message.style.color = "red";
  }
}

// Attach event listener to your form
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('availabilityForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Gather form data
    const user = document.getElementById('userName').value;
    const times = Array.from(document.querySelectorAll('input[name="times"]:checked'))
                       .map(input => input.value);

    // Send data to Netlify
    saveAvailability({ user, availability: times });
  });
});
