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

  const monthNames = ["January","February","March","April","May","June",
                      "July","August","September","October","November","December"];
  const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  document.getElementById("monthYear").textContent = monthNames[currentMonth] + " " + currentYear;

  // Day headers
  dayNames.for
