/* ==========================================================
   Sela Studio — main.js
   No dependencies. Edit SCHEDULE to set your weekly timetable.
   ========================================================== */

// Class types: key → display name and colour class (see --c-* in style.css)
const CLASS_TYPES = {
  vinyasa:  { name: "Vinyasa Flow",     color: "var(--c-vinyasa)" },
  yin:      { name: "Yin & Restore",    color: "var(--c-yin)" },
  reformer: { name: "Reformer Pilates", color: "var(--c-reformer)" },
  prenatal: { name: "Prenatal Yoga",    color: "var(--c-prenatal)" }
};

// Weekly timetable. 0 = Sunday ... 6 = Saturday. Times are 24h "HH:MM".
// spots = places left, of capacity.
const SCHEDULE = {
  1: [
    { time: "07:00", mins: 60, type: "vinyasa",  teacher: "Ana",   spots: 4,  capacity: 12 },
    { time: "12:15", mins: 50, type: "reformer", teacher: "Jonah", spots: 2,  capacity: 8 },
    { time: "18:00", mins: 60, type: "vinyasa",  teacher: "Ana",   spots: 0,  capacity: 12 },
    { time: "19:30", mins: 75, type: "yin",      teacher: "Lena",  spots: 7,  capacity: 12 }
  ],
  2: [
    { time: "07:00", mins: 50, type: "reformer", teacher: "Jonah", spots: 3,  capacity: 8 },
    { time: "10:00", mins: 60, type: "prenatal", teacher: "Lena",  spots: 6,  capacity: 10 },
    { time: "18:30", mins: 60, type: "vinyasa",  teacher: "Ana",   spots: 5,  capacity: 12 }
  ],
  3: [
    { time: "07:00", mins: 60, type: "vinyasa",  teacher: "Ana",   spots: 8,  capacity: 12 },
    { time: "12:15", mins: 50, type: "reformer", teacher: "Jonah", spots: 1,  capacity: 8 },
    { time: "17:30", mins: 50, type: "reformer", teacher: "Jonah", spots: 4,  capacity: 8 },
    { time: "19:30", mins: 75, type: "yin",      teacher: "Lena",  spots: 9,  capacity: 12 }
  ],
  4: [
    { time: "07:00", mins: 50, type: "reformer", teacher: "Jonah", spots: 5,  capacity: 8 },
    { time: "10:00", mins: 60, type: "prenatal", teacher: "Lena",  spots: 3,  capacity: 10 },
    { time: "18:30", mins: 60, type: "vinyasa",  teacher: "Ana",   spots: 2,  capacity: 12 }
  ],
  5: [
    { time: "07:00", mins: 60, type: "vinyasa",  teacher: "Ana",   spots: 6,  capacity: 12 },
    { time: "17:30", mins: 75, type: "yin",      teacher: "Lena",  spots: 10, capacity: 12 }
  ],
  6: [
    { time: "08:30", mins: 60, type: "vinyasa",  teacher: "Ana",   spots: 1,  capacity: 12 },
    { time: "10:00", mins: 50, type: "reformer", teacher: "Jonah", spots: 0,  capacity: 8 },
    { time: "11:30", mins: 60, type: "prenatal", teacher: "Lena",  spots: 5,  capacity: 10 }
  ],
  0: [
    { time: "09:00", mins: 75, type: "yin",      teacher: "Lena",  spots: 6,  capacity: 12 },
    { time: "17:00", mins: 60, type: "vinyasa",  teacher: "Ana",   spots: 8,  capacity: 12 }
  ]
};

const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/* ---------- Helpers ---------- */
const toMin = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
const pretty = (t) => {
  const [h, m] = t.split(":").map(Number);
  const s = h >= 12 ? "pm" : "am", h12 = ((h + 11) % 12) + 1;
  return m ? `${h12}:${String(m).padStart(2, "0")}${s}` : `${h12}${s}`;
};
const now = new Date();
const today = now.getDay();
const nowMin = now.getHours() * 60 + now.getMinutes();
const booked = new Set();

/* ---------- Mobile navigation ---------- */
const toggle = document.querySelector(".nav-toggle");
const nav = document.getElementById("site-nav");
if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    nav.classList.toggle("open", !open);
  });
  nav.addEventListener("click", (e) => {
    if (e.target.closest("a")) { toggle.setAttribute("aria-expanded", "false"); nav.classList.remove("open"); }
  });
}

/* ---------- Next class line in the hero ---------- */
const nextEl = document.querySelector("[data-next-class]");
if (nextEl) {
  for (let i = 0; i < 7; i++) {
    const d = (today + i) % 7;
    const cls = (SCHEDULE[d] || []).find((c) => i > 0 || toMin(c.time) > nowMin);
    if (cls) {
      const when = i === 0 ? "today" : i === 1 ? "tomorrow" : DAY_LONG[d];
      nextEl.textContent = `Next class: ${CLASS_TYPES[cls.type].name}, ${when} at ${pretty(cls.time)} with ${cls.teacher}`;
      break;
    }
  }
}

/* ---------- Timetable ---------- */
const tabsEl = document.querySelector("[data-day-tabs]");
const listEl = document.querySelector("[data-sessions]");
const filtersEl = document.querySelector("[data-filters]");
let selectedOffset = 0;
let filter = "all";

function renderTabs() {
  tabsEl.innerHTML = "";
  for (let i = 0; i < 7; i++) {
    const date = new Date(now); date.setDate(now.getDate() + i);
    const d = date.getDay();
    const b = document.createElement("button");
    b.type = "button"; b.className = "day-tab" + (i === 0 ? " is-today" : "");
    b.setAttribute("role", "tab");
    b.setAttribute("aria-selected", String(i === selectedOffset));
    b.setAttribute("aria-label", `${DAY_LONG[d]} ${date.getDate()}`);
    b.innerHTML = `${i === 0 ? "Today" : DAY_SHORT[d]}<span>${date.getDate()}</span>`;
    b.addEventListener("click", () => { selectedOffset = i; renderTabs(); renderList(); });
    tabsEl.appendChild(b);
  }
}

function renderList() {
  const d = (today + selectedOffset) % 7;
  const items = (SCHEDULE[d] || [])
    .map((c, idx) => ({ ...c, id: `${d}-${idx}` }))
    .filter((c) => filter === "all" || c.type === filter);
  listEl.innerHTML = "";
  if (!items.length) {
    listEl.innerHTML = `<li class="empty">No ${filter === "all" ? "" : CLASS_TYPES[filter].name + " "}classes on ${DAY_LONG[d]}. Try another day.</li>`;
    return;
  }
  items.forEach((c) => {
    const type = CLASS_TYPES[c.type];
    const past = selectedOffset === 0 && toMin(c.time) <= nowMin;
    const isBooked = booked.has(c.id);
    const full = c.spots <= 0 && !isBooked;
    const li = document.createElement("li");
    li.className = "session"; li.style.setProperty("--c", type.color);
    const spotsText = isBooked ? "You're booked" : full ? "Class full" : `${c.spots} of ${c.capacity} spaces left`;
    const label = past ? "Started" : isBooked ? "Booked" : full ? "Full" : "Book";
    li.innerHTML = `
      <p class="s-time">${pretty(c.time)}<small>${c.mins} min</small></p>
      <p class="s-name">${type.name}<small>with ${c.teacher}</small></p>
      <p class="s-spots${!isBooked && c.spots > 0 && c.spots <= 2 ? " low" : ""}">${spotsText}</p>
      <button type="button" class="btn btn-sun" ${past || full || isBooked ? "disabled" : ""}>${label}</button>`;
    li.querySelector("button").addEventListener("click", () => openBooking(c, d));
    listEl.appendChild(li);
  });
}

if (filtersEl) {
  filtersEl.addEventListener("click", (e) => {
    const chip = e.target.closest("[data-filter]");
    if (!chip) return;
    filter = chip.dataset.filter;
    filtersEl.querySelectorAll("[data-filter]").forEach((c) => {
      const on = c === chip;
      c.classList.toggle("is-on", on);
      c.setAttribute("aria-pressed", String(on));
    });
    renderList();
  });
}

/* ---------- Booking dialog (demo) ----------
   Replace openBooking() with a link to your booking system
   (Mindbody, Momence, Glofox, Calendly...) — see documentation.html */
const dlg = document.querySelector("[data-book-dialog]");
function openBooking(c, d) {
  const type = CLASS_TYPES[c.type];
  if (!dlg || typeof dlg.showModal !== "function") { booked.add(c.id); c.spots--; renderList(); return; }
  dlg.querySelector("[data-dlg-title]").textContent = `Book ${type.name}`;
  dlg.querySelector("[data-dlg-detail]").textContent =
    `${DAY_LONG[d]} at ${pretty(c.time)}, ${c.mins} minutes with ${c.teacher}.`;
  dlg.onclose = () => {
    if (dlg.returnValue === "confirm") { booked.add(c.id); c.spots--; renderList(); }
  };
  dlg.showModal();
}

if (tabsEl && listEl) { renderTabs(); renderList(); }

/* ---------- Trial form ---------- */
const form = document.querySelector("[data-trial-form]");
if (form) {
  const rules = {
    name: (v) => v.trim().length >= 1,
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
  };
  const check = (input) => {
    const ok = rules[input.name](input.value);
    input.closest(".field").classList.toggle("invalid", !ok);
    input.setAttribute("aria-invalid", String(!ok));
    return ok;
  };
  Object.keys(rules).forEach((n) => {
    const input = form.elements[n];
    input.addEventListener("blur", () => check(input));
    input.addEventListener("input", () => { if (input.closest(".field").classList.contains("invalid")) check(input); });
  });
  form.addEventListener("submit", (e) => {
    const results = Object.keys(rules).map((n) => [n, check(form.elements[n])]);
    const bad = (results.find(([, ok]) => !ok) || [])[0];
    if (bad) { e.preventDefault(); form.elements[bad].focus(); return; }
    if (!form.getAttribute("action")) {
      e.preventDefault();
      form.querySelector(".form-success").hidden = false;
      form.reset();
    }
  });
}

/* ---------- Footer year ---------- */
document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = now.getFullYear()));
