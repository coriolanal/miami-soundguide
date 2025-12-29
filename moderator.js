console.log("🛠 moderator.js loaded");

const SUPABASE_URL = "https://vzzzjrlbwpkgvhojdiyh.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_iuM31qKUIoyTETDonSKXJw_aIRrZ2i-";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

async function loadPending() {
  const { data, error } = await supabaseClient
    .from("events")
    .select("*")
    .eq("status", "pending")
    .order("date");

  if (error) {
    console.error(error);
    return;
  }

  const container = document.getElementById("pending");
  container.innerHTML = "";

  data.forEach(ev => {
    const div = document.createElement("div");
    div.className = "event";

    div.innerHTML = `
      <strong>${ev.title}</strong><br>
      ${ev.date} ${ev.time || ""}<br>
      ${ev.flyer_url ? `<img src="${ev.flyer_url}">` : ""}
      <textarea placeholder="Write moderator post...">${ev.mod_post || ""}</textarea>
      <button>Approve</button>
    `;

    const textarea = div.querySelector("textarea");
    const button = div.querySelector("button");

    button.onclick = async () => {
      const { error } = await supabaseClient
        .from("events")
        .update({
          status: "approved",
          mod_post: textarea.value
        })
        .eq("id", ev.id);

      if (error) {
        alert("Error approving");
        console.error(error);
      } else {
        div.remove();
      }
    };

    container.appendChild(div);
  });
}

loadPending();

console.log("PENDING EVENTS:", data);
