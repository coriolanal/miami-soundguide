console.log("🛠 moderator.js loaded");

// -------------------- 1. Initialize Supabase --------------------
const SUPABASE_URL = "https://vzzzjrlbwpkgvhojdiyh.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_iuM31qKUIoyTETDonSKXJw_aIRrZ2i-";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// -------------------- 2. Load pending events --------------------
async function loadPending() {
  const container = document.getElementById("pendingEvents");

  // 🔒 Absolute safety check (prevents silent failure)
  if (!container) {
    console.error("❌ #pendingEvents not found in moderator.html");
    document.body.insertAdjacentHTML(
      "beforeend",
      "<p style='color:red'>ERROR: pendingEvents container missing</p>"
    );
    return;
  }

  container.innerHTML = "<p>Loading pending events…</p>";

  const { data, error } = await supabaseClient
    .from("events")
    .select("*")
    .eq("status", "pending")
    .order("date", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    container.innerHTML = "<p>Error loading events.</p>";
    return;
  }

  if (!data || data.length === 0) {
    container.innerHTML = "<p>No pending events.</p>";
    return;
  }

  // Clear loading message
  container.innerHTML = "";

  // -------------------- 3. Render each pending event --------------------
  data.forEach(ev => {
    const card = document.createElement("div");
    card.style.border = "1px solid #555";
    card.style.padding = "10px";
    card.style.marginBottom = "10px";
    card.style.background = "#222";

    card.innerHTML = `
      <strong>${ev.title}</strong><br>
      <em>${ev.date}${ev.time ? " " + ev.time : ""}</em><br><br>

      <label style="display:block;margin-bottom:4px;">
        Moderator post:
      </label>
      <textarea
        data-id="${ev.id}"
        rows="4"
        style="width:100%;margin-bottom:6px;"
        placeholder="Write the public post that will appear in the calendar popup..."
      ></textarea>

      <button data-approve="${ev.id}">
        Approve & Publish
      </button>
    `;

    container.appendChild(card);
  });

  // -------------------- 4. Wire approve buttons --------------------
  container.querySelectorAll("button[data-approve]").forEach(btn => {
    btn.onclick = async () => {
      const eventId = btn.dataset.approve;
      const textarea = container.querySelector(
        `textarea[data-id="${eventId}"]`
      );
      const modPost = textarea.value.trim();

      if (!modPost) {
        alert("Please write a moderator post before approving.");
        return;
      }

      const { error } = await supabaseClient
        .from("events")
        .update({
          status: "approved",
          mod_post: modPost
        })
        .eq("id", eventId);

      if (error) {
        alert("Approval failed. See console.");
        console.error(error);
        return;
      }

      // Reload list after approval
      await loadPending();
    };
  });
}

// -------------------- 5. DOM Ready --------------------
document.addEventListener("DOMContentLoaded", async () => {
  console.log("📄 moderator DOM ready");

  await loadPending();
});
