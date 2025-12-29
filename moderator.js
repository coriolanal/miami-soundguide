const SUPABASE_URL = "https://vzzzjrlbwpkgvhojdiyh.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_iuM31qKUIoyTETDonSKXJw_aIRrZ2i-";
const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

document.addEventListener("DOMContentLoaded", async () => {

  document.body.insertAdjacentHTML(
  "beforeend",
  "<p style='color:red'>JS RENDER TEST</p>"
);

  const container = document.getElementById("pendingEvents");

  const { data, error } = await supabaseClient
    .from("events")
    .select("*")
    .eq("status", "pending")
    .order("date", { ascending: true });

  console.log("PENDING EVENTS:", data);

  if (error) {
    container.textContent = "Error loading events";
    return;
  }

  if (!data || data.length === 0) {
    container.textContent = "No pending events.";
    return;
  }

  data.forEach(ev => {
    const div = document.createElement("div");
    div.style.border = "1px solid #555";
    div.style.margin = "10px";
    div.style.padding = "10px";

    div.innerHTML = `
      <strong>${ev.title}</strong><br>
      ${ev.date}<br><br>
      <button>Approve</button>
    `;

    container.appendChild(div);
  });
});


