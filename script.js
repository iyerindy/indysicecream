/* =========================================================
   Indy's — the only file you need to touch each month.
   ========================================================= */

/* ---------- 1. Settings ---------- */
const SITE = {
  // Shown if a form ever fails, and used as a fallback when SHEET_URL is empty.
  CONTACT_EMAIL: "hello@example.com",   // TODO: your real email

  // Google Sheets web-app URL (see google-sheets/README.md for the 5-minute setup).
  // Sign-ups go to the "List" tab, contact messages go to the "Messages" tab.
  SHEET_URL: "",                        // TODO: "https://script.google.com/macros/s/XXXX/exec"

  // Your Hotplate storefront. When a drop is "live", the ticket shows a
  // "claim a pint" button that links here. Leave empty until you're set up.
  HOTPLATE_URL: "",                     // e.g. "https://www.hotplate.com/indys"

  // Optional: shows in the footer.
  INSTAGRAM: "",                        // e.g. "indysicecream" (no @)
};

/* ---------- 2. Drops ----------
   Newest LAST. Each month, add a new entry at the bottom.
   status: "upcoming"  – announced but not out yet (flavor can be null to keep it secret)
           "live"      – pints available now
           "sold-out"  – gone forever (shows in the archive)
   pintsLeft only matters for upcoming/live drops.                        */
const DROPS = [
  {
    number: 1,
    flavor: null,                 // e.g. "Brown Butter Sprinkle"
    description: "",              // one-liner for the archive card
    when: "TBA — watch your inbox",
    status: "upcoming",
    pintsLeft: 10,
  },
];

const TOTAL_PINTS = 10;

/* =========================================================
   Below here is the machinery. No need to edit.
   ========================================================= */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const pad = (n) => String(n).padStart(3, "0");
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const PINT_SVG = (gone) => `
  <svg class="pint${gone ? " is-gone" : ""}" viewBox="0 0 40 48">
    <path d="M8 12h24l-3 32H11z"/>
    <path class="lid" d="M5 5h30v7H5z"/>
  </svg>`;

const CARD_COLORS = ["var(--butter)", "var(--mint)", "var(--sky)", "var(--pink-soft)", "var(--lavender-soft)", "var(--cream)"];

/* ---- next drop ticket + top bar ---- */
function renderCurrentDrop() {
  const current = [...DROPS].reverse().find((d) => d.status === "live" || d.status === "upcoming");
  const ticket = $("[data-drop]");
  const pints = $("[data-pints]");
  const title = $("#drop-title");
  const foot = $(".ticket__foot", ticket);
  const claim = $("[data-claim]", ticket);

  if (!current) {
    // between drops: everything is sold out
    $("[data-drop-number]").textContent = "#" + pad((DROPS.at(-1)?.number ?? 0) + 1);
    $("[data-drop-flavor]").textContent = "being invented";
    $("[data-drop-left]").textContent = TOTAL_PINTS;
    pints.innerHTML = Array.from({ length: TOTAL_PINTS }, () => PINT_SVG(false)).join("");
    return;
  }

  const left = Math.max(0, Math.min(TOTAL_PINTS, current.pintsLeft ?? TOTAL_PINTS));
  $("[data-drop-number]").textContent = "#" + pad(current.number);
  $("[data-drop-flavor]").textContent = current.flavor || "top secret 🤫";
  $("[data-drop-when]").textContent = current.when || "TBA";
  $("[data-drop-left]").textContent = left;
  pints.innerHTML = Array.from({ length: TOTAL_PINTS }, (_, i) => PINT_SVG(i >= left)).join("");

  if (current.status === "live") {
    if (left > 0) {
      title.innerHTML = "<span>Drop</span><span>is</span><span>live</span><span>now!</span>";
      if (SITE.HOTPLATE_URL) {
        claim.href = SITE.HOTPLATE_URL;
        claim.hidden = false;
        foot.textContent = "first come, first scooped";
      } else {
        foot.textContent = "check your inbox to claim yours";
      }
    } else {
      title.innerHTML = "<span>Sold</span><span>out!</span><span>see you</span><span>next month</span>";
      foot.textContent = "join the list for the next one";
    }
  }

  const msg = current.status === "live" && left > 0
    ? `drop #${pad(current.number)} is live${current.flavor ? ": " + current.flavor : ""}`
    : current.flavor
      ? `next drop: ${current.flavor}`
      : "stay tuned for next drop";
  $$("[data-topbar]").forEach((el) => (el.textContent = msg));
}

/* ---- archive ---- */
function renderArchive() {
  const grid = $("[data-archive]");
  const cards = DROPS.map((d, i) => {
    const gone = d.status === "sold-out";
    const name = gone || d.flavor ? (d.flavor || "Mystery flavor") : "Top secret";
    const stamp = gone ? "sold out" : d.status === "live" ? "on now" : "coming soon";
    return `
      <article class="flavor" style="--card:${CARD_COLORS[i % CARD_COLORS.length]}">
        <span class="flavor__num">DROP #${pad(d.number)}</span>
        <span class="flavor__stamp">${stamp}</span>
        ${PINT_SVG(false)}
        <h3>${esc(name)}</h3>
        <p>${esc(d.description || (gone ? "" : "Shh. You'll find out with everyone else on the list."))}</p>
        <p class="flavor__meta">${esc(d.when || "")}</p>
      </article>`;
  });

  // a few empty slots for flavors not invented yet
  const nextNum = (DROPS.at(-1)?.number ?? 0) + 1;
  const empties = Math.max(2, 4 - (DROPS.length % 4 || 4));
  for (let k = 0; k < empties; k++) {
    cards.push(`
      <article class="flavor flavor--empty" aria-label="Future drop">
        <span class="flavor__num">DROP #${pad(nextNum + k)}</span>
        <h3>not invented yet</h3>
      </article>`);
  }
  grid.innerHTML = cards.join("");
}

/* ---- forms ---- */
function setupForm(form, { subject, toBody, success }) {
  const msg = $(".form-msg", form);
  const btn = $("button[type=submit]", form);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.classList.remove("is-error");

    const bad = $$("[required]", form).find((f) => !f.checkValidity());
    if (bad) {
      msg.classList.add("is-error");
      msg.textContent = bad.type === "email" ? "hmm, that email looks off" : "you missed a spot!";
      bad.focus();
      return;
    }

    const data = new FormData(form);

    // bots fill in the hidden "website" field; quietly pretend it worked
    if (data.get("website")) { form.reset(); msg.textContent = success; return; }

    if (!SITE.SHEET_URL) {
      const body = encodeURIComponent(toBody(data));
      window.location.href = `mailto:${SITE.CONTACT_EMAIL}?subject=${encodeURIComponent(subject(data))}&body=${body}`;
      msg.textContent = "opening your email app…";
      return;
    }

    btn.disabled = true;
    msg.textContent = "sending…";
    try {
      // Google Apps Script doesn't send CORS headers we can read, so this is
      // a fire-and-forget POST; a network failure still lands in the catch.
      await fetch(SITE.SHEET_URL, { method: "POST", mode: "no-cors", body: new URLSearchParams(data) });
      form.reset();
      msg.textContent = success;
    } catch {
      msg.classList.add("is-error");
      msg.textContent = `that didn't work. email me at ${SITE.CONTACT_EMAIL}`;
    } finally {
      btn.disabled = false;
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderCurrentDrop();
  renderArchive();

  setupForm($('[data-form="list"]'), {
    subject: () => "Add me to the list!",
    toBody: (d) => `Please add ${d.get("email")} to the Indy's list.`,
    success: "you're on the list! 🍦",
  });

  setupForm($('[data-form="contact"]'), {
    subject: (d) => `${d.get("topic")} — from ${d.get("name")}`,
    toBody: (d) => `${d.get("message")}\n\n— ${d.get("name")} (${d.get("email")})`,
    success: "got it! I'll write back soon.",
  });

  if (SITE.INSTAGRAM) {
    const ig = $("[data-instagram]");
    ig.href = `https://instagram.com/${encodeURIComponent(SITE.INSTAGRAM)}`;
    ig.textContent = "@" + SITE.INSTAGRAM;
    ig.hidden = false;
  }

  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
});
