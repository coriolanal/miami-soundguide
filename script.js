let displayedMonth;
let displayedYear;

console.log("🔥 script.js loaded");

const SUPABASE_URL = "https://vzzzjrlbwpkgvhojdiyh.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_iuM31qKUIoyTETDonSKXJw_aIRrZ2i-";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function getApprovedEvents() {
  const { data, error } = await supabaseClient
    .from("events")
    .select("*")
    .eq("status", "approved");

  return error ? [] : data;
}

async function renderCalendar() {
  const calendar = document.getElementById("calendar");
  calendar.innerHTML = "";

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  document.getElementById("monthYear").textContent =
    `${monthNames[displayedMonth]} ${displayedYear}`;

  const firstDay = new Date(displayedYear, displayedMonth, 1).getDay();
  const daysInMonth = new Date(displayedYear, displayedMonth + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    calendar.appendChild(document.createElement("div"));
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const cell = document.createElement("div");
    cell.className = "day";
    cell.dataset.day = d;

    const num = document.createElement("div");
    num.className = "date-number";
    num.textContent = d;
    cell.appendChild(num);

    calendar.appendChild(cell);
  }

  const events = await getApprovedEvents();

  events.forEach(ev => {
    const date = new Date(ev.date + "T00:00:00");
    if (
      date.getUTCMonth() === displayedMonth &&
      date.getUTCFullYear() === displayedYear
    ) {
      const cell = calendar.querySelector(
        `.day[data-day="${date.getUTCDate()}"]`
      );
      if (cell) {
        const link = document.createElement("span");
        link.className = "event-link";
        link.textContent = ev.title;
        link.onclick = () => openModal(ev);
        cell.appendChild(link);
      }
    }
  });
}

function openModal(ev) {
  document.getElementById("modalContent").innerHTML = `
    <strong>${ev.title}</strong>
    <p>${ev.mod_post || "No post available."}</p>
  `;
  document.getElementById("eventModal").style.display = "block";
}

document.addEventListener("DOMContentLoaded", async () => {
  const now = new Date();
  displayedMonth = now.getMonth();
  displayedYear = now.getFullYear();

  await renderCalendar();

  document.getElementById("nextMonth").onclick = async () => {
    displayedMonth++;
    if (displayedMonth > 11) {
      displayedMonth = 0;
      displayedYear++;
    }
    await renderCalendar();
  };

  document.getElementById("prevMonth").onclick = async () => {
    displayedMonth--;
    if (displayedMonth < 0) {
      displayedMonth = 11;
      displayedYear--;
    }
    await renderCalendar();
  };

  document.getElementById("closeModal").onclick =
    () => document.getElementById("eventModal").style.display = "none";
});
