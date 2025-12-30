console.log("🛠 moderator.js loaded");

// -------------------- 1. Initialize Supabase --------------------
const SUPABASE_URL = "https://vzzzjrlbwpkgvhojdiyh.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_iuM31qKUIoyTETDonSKXJw_aIRrZ2i-";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// -------------------- 2. Load pending events --------------------
async function loadPending() {
  const container = document.getElementById("pendingEvents");

  // Safety check
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

  container.innerHTML = "";

  data.forEach(ev => {
    const card = document.createElement("div");
    card.className = "event";
    card.style.background = "#222";

    // Flyer image
    let flyerHtml = "";
    if (ev.flyer_url) {
      flyerHtml = `<img src="${ev.flyer_url}" alt="Event flyer">`;
    }

    // Additional info
    let additionalInfo = ev.additional_info
      ? `<p><strong>Additional info:</strong> ${ev.additional_info}</p>`
      : "";

    card.innerHTML = `
      <strong>${ev.title}</strong><br>
      <em>${ev.date}${ev.time ? " " + ev.time : ""}</em><br><br>
      ${flyerHtml}
      ${additionalInfo}
      <label>Moderator post:</label>
      <textarea data-id="${ev.id}" placeholder="Write the public post for the calendar popup...">${ev.mod_post || ""}</textarea>
      <button data-approve="${ev.id}">Approve & Publish</button>
      <button data-delete="${ev.id}" style="margin-left:5px;background:#550000;">Delete</button>
    `;

    container.appendChild(card);
  });

  // -------------------- 3. Wire approve buttons --------------------
  container.querySelectorAll("button[data-approve]").forEach(btn => {
    btn.onclick = async () => {
      const eventId = btn.dataset.approve;
      const textarea = container.querySelector(`textarea[data-id="${eventId}"]`);
      const modPost = textarea.value.trim();

      if (!modPost) {
        alert("Please write a moderator post before approving.");
        return;
      }

      const { error } = await supabaseClient
        .from("events")
        .update({ status: "approved", mod_post: modPost })
        .eq("id", eventId);

      if (error) {
        alert("Approval failed. See console.");
        console.error(error);
        return;
      }

      // Remove approved event from dashboard
      btn.closest(".event").remove();
    };
  });

  // -------------------- 4. Wire delete buttons --------------------
  container.querySelectorAll("button[data-delete]").forEach(btn => {
    btn.onclick = async () => {
      const eventId = btn.dataset.delete;
      if (!confirm("Are you sure you want to delete this event?")) return;

      const { error } = await supabaseClient
        .from("events")
        .delete()
        .eq("id", eventId);

      if (error) {
        alert("Delete failed. See console.");
        console.error(error);
        return;
      }

      // Remove deleted event from dashboard
      btn.closest(".event").remove();
    };
  });
}

// -------------------- 5. DOM Ready --------------------
document.addEventListener("DOMContentLoaded", async () => {
  console.log("📄 moderator DOM ready");
  await loadPending();
});
