console.log("🔥 script.js loaded");

// -------------------- 1. Initialize Supabase --------------------
const SUPABASE_URL = "https://vzzzjrlbwpkgvhojdiyh.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_ANON_KEY_HERE"; // Use your actual anon key
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

    console.log("Approved events from Supabase:", data);
    return data || [];
  } catch (err) {
    console.error("Supabase exception:", err);
    return [];
  }
}

// -------------------- 3. Render calendar --------------------
async function renderCalendar(year = null, month = null) {
  const calendar = document.getElementById("calendar");
  calendar.innerHTML = "";

  const today = new Date();
  const currentMonth = month !== null ? month : today.getMonth();
  const currentYear = year !== null ? year : today.getFullYear();

  console.log("Rendering calendar for:", { month: currentMonth, year: currentYear });

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  document.getElementById("monthYear").textContent =
    `${monthNames[currentMonth]} ${currentYear}`;

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();

  // Create empty placeholders for first week
  for (let i = 0; i < firstDay; i++) {
    const emptyDiv = document.createElement("div");
    emptyDiv.className = "day";
    calendar.appendChild(emptyDiv);
  }

  // Create day cells
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

  // -------------------- Place approved events --------------------
  const events = await getApprovedEvents();

  events.forEach(ev => {
    if (!ev.date) return; // skip events with no date

    const [yearStr, monthStr, dayStr] = ev.date.split("-").map(Number);
    const evYear = yearStr;
    const evMonth = monthStr - 1;
    const evDay = dayStr;

    if (evYear === currentYear && evMonth === currentMonth) {
      const dayDiv = calendar.querySelector(`.day[data-day="${evDay}"]`);
      if (dayDiv) {
        const link = document.createElement("span");
        link.className = "event-link";
        link.textContent = ev.title;
        link.style.fontSize = "0.9em";
        link.onclick = () => openModal(ev);
        dayDiv.appendChild(link);
      }
    }
  });
}

// -------------------- 4. Modal --------------------
function openModal(ev) {
  const modal = document.getElementById("eventModal");
  const content = document.getElementById("modalContent");

  content.innerHTML = `
    <strong>${ev.title}</strong>
    <p>${ev.description || ""}</p>
    <p><em>${ev.date}${ev.time ? " " + ev.time : ""}</em></p>
    ${ev.location ? `<p>Location: ${ev.location}</p>` : ""}
  `;
  modal.style.display = "block";
}

function closeModal() {
  document.getElementById("eventModal").style.display = "none";
}

// -------------------- 5. DOM Ready --------------------
document.addEventListener("DOMContentLoaded", async () => {
  await renderCalendar();

  document.getElementById("closeModal").onclick = closeModal;
  window.onclick = e => { if (e.target === document.getElementById("eventModal")) closeModal(); }

  const form = document.getElementById("eventForm");
  form.onsubmit = async e => {
    e.preventDefault();
    const fd = new FormData(form);

    const newEvent = {
      title: fd.get("title"),
      date: fd.get("date"),
      time: fd.get("time"),
      status: "pending",
      description: null,
      location: null
    };

    try {
      const { data, error } = await supabaseClient.from("events").insert(newEvent);
      if (error) {
        console.error("Insert error:", error);
        alert("Submission failed: " + error.message);
      } else {
        console.log("Insert success:", data);
        alert("Event submitted for approval!");
        form.reset();
        await renderCalendar(); // re-render calendar after submission
      }
    } catch (err) {
      console.error("Submission exception:", err);
      alert("Submission failed: check console.");
    }
  };
});
