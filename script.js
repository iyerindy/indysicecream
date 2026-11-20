/* =========================================================
   Indy's — the only file you need to touch each month.
   ========================================================= */

/* ---------- 1. Settings ----------
   LIST_ENDPOINT / CONTACT_ENDPOINT: paste a form URL from a service like
   Formspree (https://formspree.io), Basin, or Getform. Anything that accepts
   a POST with form fields and answers JSON works.
   If an endpoint is left empty, the form falls back to opening an email
   to CONTACT_EMAIL instead.                                              */
const SITE = {
  CONTACT_EMAIL: "hello@example.com",   // TODO: your real email
  LIST_ENDPOINT: "",                    // TODO: e.g. "https://formspree.io/f/abcd1234"
  CONTACT_ENDPOINT: "",                 // TODO: can be the same form or a second one
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
    title.innerHTML = left > 0
      ? "<span>Drop</span><span>is</span><span>live</span><span>now!</span>"
      : "<span>Sold</span><span>out!</span><span>see you</span><span>next month</span>";
    ticket.querySelector(".ticket__foot").textContent = left > 0 ? "reply to the email to claim yours" : "join the list for the next one";
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
  const empties = Math.max(2, 4 - (DROPS.length % 4 || 4)) ;
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
function setupForm(form, { endpoint, subject, toBody, success }) {
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

    if (!endpoint) {
      const body = encodeURIComponent(toBody(data));
      window.location.href = `mailto:${SITE.CONTACT_EMAIL}?subject=${encodeURIComponent(subject(data))}&body=${body}`;
      msg.textContent = "opening your email app…";
      return;
    }

    btn.disabled = true;
    msg.textContent = "sending…";
    try {
      const res = await fetch(endpoint, { method: "POST", body: data, headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(res.status);
      form.reset();
      msg.textContent = success;
    } catch {
      msg.classList.add("is-error");
      msg.textContent = `that didn't work — email us at ${SITE.CONTACT_EMAIL}`;
    } finally {
      btn.disabled = false;
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderCurrentDrop();
  renderArchive();

  setupForm($('[data-form="list"]'), {
    endpoint: SITE.LIST_ENDPOINT,
    subject: () => "Add me to the list!",
    toBody: (d) => `Please add ${d.get("email")} to the Indy's list.`,
    success: "you're on the list! 🍦",
  });

  setupForm($('[data-form="contact"]'), {
    endpoint: SITE.CONTACT_ENDPOINT,
    subject: (d) => `${d.get("topic")} — from ${d.get("name")}`,
    toBody: (d) => `${d.get("message")}\n\n— ${d.get("name")} (${d.get("email")})`,
    success: "got it! we'll write back soon.",
  });

  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
});
