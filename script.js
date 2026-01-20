// script.js

const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const slots = Array.from({length:48}, (_, i) => `${String(i/2|0).padStart(2,'0')}:${i%2===0?'00':'30'}-${String((i/2|0 + (i%2===0?0:1))%24).padStart(2,'0')}:${i%2===0?'30':'00'}`);

const grid = Array.from({length:7}, ()=>Array(48).fill(0));

const table = document.getElementById("availabilityGrid");

// Build table
days.forEach((day, d) => {
  const tr = document.createElement("tr");
  const th = document.createElement("th");
  th.textContent = day;
  tr.appendChild(th);

  for(let s=0; s<48; s++){
    const td = document.createElement("td");
    td.classList.add("slot");
    td.dataset.day = d;
    td.dataset.slot = s;
    td.addEventListener("click", ()=>{
      grid[d][s] = grid[d][s] ? 0 : 1;
      td.classList.toggle("active", grid[d][s]===1);
    });
    tr.appendChild(td);
  }

  table.appendChild(tr);
});

// Save button
document.getElementById("saveButton").addEventListener("click", async ()=>{
  const person = parseInt(document.getElementById("personSelect").value);

  try {
    for(let day=0; day<7; day++){
      await fetch('https://YOUR_NETLIFY_SITE.netlify.app/api/saveAvailability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          person,
          day,
          grid: grid[day]
        })
      });
    }

    const msg = document.getElementById("statusMessage");
    msg.textContent = "Availability saved!";
    msg.style.color = "green";

  } catch(err){
    console.error(err);
    const msg = document.getElementById("statusMessage");
    msg.textContent = "Failed to save availability.";
    msg.style.color = "red";
  }
});
