// -------------------- 1. Initialize Supabase --------------------
const SUPABASE_URL = "https://vzzzjrlbwpkgvhojdiyh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6enpqcmxid3BrZ3Zob2pkaXloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4NDExNzgsImV4cCI6MjA4MjQxNzE3OH0.4LSiWfKEOG13hFZDekZMHlWT0wUFoxb07IetgRZO5TY";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// -------------------- 2. Fetch approved events --------------------
async function getApprovedEvents() {
  try {
    const { data, error } = await supabaseClient
      .from("events")
      .select("*")
      .eq("status", "approved")
      .order("date", { ascending: true });

    if (error) {
      console.error("Supabase fetch error:", error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("Supabase error:", err);
    return [];
  }
}

// -------------------- 3. Render calendar --------------------
async function renderCalendar() {
  const calendar = document.getElementById("calendar");
  calendar.innerHTML = "";

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const monthNames = ["January","February","March","April","May","June",
                      "July","August","September","October","November","December"];
  const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  document.getElementById("monthYear").textContent = monthNames[currentMonth] + " " + currentYear;

  // Add day headers
  dayNames.forEach(d => {
    const header = document.createElement("div");
    header.className = "header";
    header.textContent = d;
    calendar.appendChild(header);
  });

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Empty cells for previous month days
  for (let i = 0; i < firstDay; i++) {
    const emptyDiv = document.createElement("div");
    emptyDiv.className = "day";
    calendar.appendChild(emptyDiv);
  }

  // Add actual days
  for (let day = 1; day <= daysInMonth; day++) {
    const dayDiv = document.createElement("div");
    dayDiv.className = "day";
    dayDiv.dataset.day = day;

    const dn = document.createElement("div");
    dn.className = "date-number";
    dn.textContent = day;
    dayDiv.appendChild(dn);

    calendar.appendChild(dayDiv);
  }

  // Load approved events
  const events = await getApprovedEvents();

  events.forEach(ev => {
    const evDate = new Date(ev.date);
    if (evDate.getMonth() === currentMonth && evDate.getFullYear() === currentYear) {
      const dayDiv = Array.from(calendar.querySelectorAll('.day'))
        .find(d => d.dataset.day == evDate.getDate());
      if (dayDiv) {
        const link = document.createElement("span");
        link.className = "event-link";
        link.textContent = ev.title;
        link.onclick = () => openModal(ev);
        dayDiv.appendChild(link);
      }
    }
  });
}

// -------------------- 4. Modal popup --------------------
function openModal(ev) {
  const modal = document.getElementById("eventModal");
  const content = document.getElementById("modalContent");

  content.innerHTML = `
    <strong>${ev.title}</strong>
    <p>${ev.description || ""}</p>
    <p><em>${ev.date}${ev.time ? " " + ev.time : ""}</em></p>
    ${ev.location ? "<p>Location: " + ev.location + "</p>" : ""}
  `;
  modal.style.display = "block";
}

function closeModal() {
  document.getElementById("eventModal").style.display = "none";
}

// -------------------- 5. Initialize after DOM is ready --------------------
document.addEventListener("DOMContentLoaded", async () => {

  // Render calendar
  await renderCalendar();

  // Modal handlers
  document.getElementById("closeModal").onclick = closeModal;
  window.onclick = e => { if (e.target === document.getElementById("eventModal")) closeModal(); }

  // Form submission
  const form = document.getElementById("eventForm");
  form.onsubmit = async e => {
    e.preventDefault();
    const fd = new FormData(form);
    const newEvent = {
      title: fd.get("title"),
      date: fd.get("date"),
      time: fd.get("time"),
      location: fd.get("location"),
      description: fd.get("description"),
      status: "pending"
    };

    try {
      await supabaseClient.from("events").insert(newEvent);
      alert("Event submitted for approval!");
      form.reset();
    } catch (err) {
      console.error(err);
      alert("Submission failed. Check console.");
    }
  };
});
