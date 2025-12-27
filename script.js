

console.log("🔥 script.js loaded");

// -------------------- 1. Initialize Supabase --------------------
const SUPABASE_URL = "https://vzzzjrlbwpkgvhojdiyh.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_iuM31qKUIoyTETDonSKXJw_aIRrZ2i-";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

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
async function renderCalendar() {
  const calendar = document.getElementById("calendar");
  calendar.innerHTML = "";

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  console.log("Calendar rendering for:", {
    month: currentMonth,
    year: currentYear
  });

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  document.getElementById("monthYear").textContent =
    monthNames[currentMonth] + " " + currentYear;

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Empty placeholders
  for (let i = 0; i < firstDay; i++) {
    const emptyDiv = document.createElement("div");
    emptyDiv.className = "day";
    calendar.appendChild(emptyDiv);
  }

  // Actual day cells
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
    const evDate = new Date(ev.date + "T00:00:00");
    const evDay = evDate.getUTCDate();
    const evMonth = evDate.getUTCMonth();
    const evYear = evDate.getUTCFullYear();

    if (evMonth === currentMonth && evYear === currentYear) {
      const dayDiv = Array.from(
        calendar.querySelectorAll(".day[data-day]")
      ).find(d => parseInt(d.dataset.day) === evDay);

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

// -------------------- 4. Modal --------------------
function openModal(ev) {
  const modal = document.getElementById("eventModal");
  const content = document.getElementById("modalContent");

  content.innerHTML = `
    <strong>${ev.title}</strong>
    <p>${ev.moderator_post || "No post available."}</p>
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
  window.onclick = e => {
    if (e.target === document.getElementById("eventModal")) closeModal();
  };

  const form = document.getElementById("eventForm");

  form.onsubmit = async e => {
    e.preventDefault();

    const fd = new FormData(form);

    const newEvent = {
      title: fd.get("title"),
      date: fd.get("date"),
      time: fd.get("time") || null,
      location: null,
      description: null,
      status: "pending"
    };

    try {
      const { data, error } = await supabaseClient
        .from("events")
        .insert(newEvent);

      if (error) {
        console.error("Insert error:", error);
        alert("Submission failed: " + error.message);
      } else {
        console.log("Insert success:", data);
        alert("Event submitted for approval!");
        form.reset();
      }
    } catch (err) {
      console.error("Submission exception:", err);
      alert("Submission failed: check console.");
    }
  };
});
