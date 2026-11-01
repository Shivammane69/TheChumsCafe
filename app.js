/* =========================================================
   THE CHUMS - GAMING CAFE MANAGEMENT SYSTEM
========================================================= */

let soundEnabled = true;
let currentCategory = "all";
let selectedPayment = "Cash";
let sessions = [];
let reservations = [];
let billCounter = 1001;


/* =========================================================
   MENU
========================================================= */

const menu = [

  {
    id:"sp1",
    name:"Jhol Momos",
    price:170,
    category:"specials",
    icon:"🥟",
    desc:"Nepali style momos in spicy broth"
  },

  {
    id:"sp2",
    name:"Chinese Bhel",
    price:100,
    category:"specials",
    icon:"🍜",
    desc:"Crispy noodles with signature sauces"
  },

  {
    id:"sp3",
    name:"Korean BBQ Wings",
    price:250,
    category:"specials",
    icon:"🍗",
    desc:"Sweet, spicy and smoky chicken wings"
  },

  {
    id:"mo1",
    name:"Steamed Veg Momos",
    price:140,
    category:"momos",
    icon:"🥟",
    desc:"Classic steamed vegetable dumplings"
  },

  {
    id:"mo2",
    name:"Chicken Momos",
    price:150,
    category:"momos",
    icon:"🥟",
    desc:"Juicy chicken filled dumplings"
  },

  {
    id:"mo3",
    name:"Kurkure Momos",
    price:190,
    category:"momos",
    icon:"🥟",
    desc:"Crunchy coated momos"
  },

  {
    id:"b1",
    name:"Fried Chicken Burger",
    price:150,
    category:"burgers",
    icon:"🍔",
    desc:"Crispy chicken burger with mayo"
  },

  {
    id:"b2",
    name:"Smashed Chicken Burger",
    price:180,
    category:"burgers",
    icon:"🍔",
    desc:"Chicken patty with cheddar"
  },

  {
    id:"b3",
    name:"Veggie Burger",
    price:99,
    category:"burgers",
    icon:"🍔",
    desc:"Crispy potato herb patty"
  },

  {
    id:"p1",
    name:"Margherita Pizza",
    price:120,
    category:"pizza",
    icon:"🍕",
    desc:"Classic tomato and cheese pizza"
  },

  {
    id:"p2",
    name:"Paneer Peri Peri Pizza",
    price:180,
    category:"pizza",
    icon:"🍕",
    desc:"Spicy paneer and mozzarella"
  },

  {
    id:"p3",
    name:"Red Sauce Pasta",
    price:250,
    category:"pizza",
    icon:"🍝",
    desc:"Penne in spicy tomato sauce"
  },

  {
    id:"d1",
    name:"Mocktail",
    price:99,
    category:"drinks",
    icon:"🍹",
    desc:"Refreshing chilled mocktail"
  },

  {
    id:"d2",
    name:"Oreo Milkshake",
    price:150,
    category:"drinks",
    icon:"🥤",
    desc:"Thick creamy Oreo shake"
  },

  {
    id:"d3",
    name:"Biscoff Thickshake",
    price:180,
    category:"drinks",
    icon:"🧋",
    desc:"Premium Biscoff thickshake"
  },

  {
    id:"d4",
    name:"Soft Drink",
    price:70,
    category:"drinks",
    icon:"🥤",
    desc:"Chilled soft drink"
  }

];


/* =========================================================
   STATIONS
========================================================= */

const stations = [

  {
    id:"PS-01",
    name:"PS5 Pro Lounge 1",
    type:"PS5 Pro",
    rate:100
  },

  {
    id:"PS-02",
    name:"PS5 Pro Lounge 2",
    type:"PS5 Pro",
    rate:100
  },

  {
    id:"PS-03",
    name:"PS5 Pro Lounge 3",
    type:"PS5 Pro",
    rate:100
  },

  {
    id:"PS-04",
    name:"PS5 Pro Lounge 4",
    type:"PS5 Pro",
    rate:100
  },

  {
    id:"VR-01",
    name:"VR Matrix Suite",
    type:"VR Gaming",
    rate:250
  },

  {
    id:"PC-01",
    name:"RTX Gaming PC",
    type:"Gaming PC",
    rate:120
  }

];


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  loadData();

  setupDate();

  renderStations();

  renderMenu();

  renderReservations();

  populateSessionSelectors();

  renderBill();

  updateDashboard();

  startTimer();

});


/* =========================================================
   LOCAL STORAGE
========================================================= */

function saveData() {

  localStorage.setItem(
    "chums_sessions",
    JSON.stringify(sessions)
  );

  localStorage.setItem(
    "chums_reservations",
    JSON.stringify(reservations)
  );

  localStorage.setItem(
    "chums_bill_counter",
    billCounter
  );

}


function loadData() {

  try {

    sessions =
      JSON.parse(
        localStorage.getItem("chums_sessions")
      ) || [];

    reservations =
      JSON.parse(
        localStorage.getItem("chums_reservations")
      ) || [];

    billCounter =
      Number(
        localStorage.getItem("chums_bill_counter")
      ) || 1001;

  } catch {

    sessions = [];
    reservations = [];

  }

}


/* =========================================================
   NAVIGATION
========================================================= */

function navigate(page) {

  document
    .querySelectorAll(".page")
    .forEach(p => p.classList.remove("active"));

  const target =
    document.getElementById(`page-${page}`);

  if(target) {
    target.classList.add("active");
  }

  document
    .querySelectorAll(".nav-btn")
    .forEach(btn => {

      btn.classList.toggle(
        "active",
        btn.dataset.page === page
      );

    });

  if(page === "stations")
    renderStations();

  if(page === "menu") {
    renderMenu();
    populateSessionSelectors();
  }

  if(page === "reservations") {
    renderReservations();
    populateReservationStations();
  }

  if(page === "billing") {
    populateSessionSelectors();
    renderBill();
  }

}


/* =========================================================
   THEME
========================================================= */

function toggleTheme() {

  const html = document.documentElement;

  const dark =
    html.getAttribute("data-theme") !== "light";

  html.setAttribute(
    "data-theme",
    dark ? "light" : "dark"
  );

  showToast(
    dark ? "☀️ Light mode enabled" : "🌙 Dark mode enabled"
  );

}


/* =========================================================
   SOUND
========================================================= */

function toggleSound() {

  soundEnabled = !soundEnabled;

  document.getElementById("sound-status").textContent =
    soundEnabled ? "ON" : "OFF";

  showToast(
    soundEnabled
      ? "🔊 Sound enabled"
      : "🔇 Sound disabled"
  );

}


function beep() {

  if(!soundEnabled) return;

  try {

    const ctx =
      new (
        window.AudioContext ||
        window.webkitAudioContext
      )();

    const osc = ctx.createOscillator();

    const gain = ctx.createGain();

    osc.frequency.value = 700;

    gain.gain.value = .025;

    osc.connect(gain);

    gain.connect(ctx.destination);

    osc.start();

    osc.stop(
      ctx.currentTime + .05
    );

  } catch(e) {}

}


/* =========================================================
   TOAST
========================================================= */

function showToast(message) {

  const container =
    document.getElementById("toast-container");

  const toast =
    document.createElement("div");

  toast.className = "toast";

  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(
    () => toast.remove(),
    2800
  );

}


/* =========================================================
   DASHBOARD
========================================================= */

function updateDashboard() {

  const active =
    sessions.filter(
      s => s.status === "active"
    ).length;

  const available =
    stations.length - active;

  const revenue =
    Number(
      localStorage.getItem("chums_revenue")
    ) || 0;

  document.getElementById("stat-active")
    .textContent = active;

  document.getElementById("stat-available")
    .textContent = available;

  document.getElementById("stat-revenue")
    .textContent = money(revenue);

  document.getElementById("stat-reservations")
    .textContent =
      reservations.filter(
        r => r.status === "Confirmed"
      ).length;

}


/* =========================================================
   STATIONS
========================================================= */

function getSession(stationId) {

  return sessions.find(
    s =>
      s.stationId === stationId &&
      s.status === "active"
  );

}


function renderStations() {

  const container =
    document.getElementById("stations-grid");

  if(!container) return;

  container.innerHTML = "";

  let occupied = 0;

  stations.forEach(station => {

    const session =
      getSession(station.id);

    if(session) occupied++;

    const card =
      document.createElement("div");

    card.className =
      `station-card ${session ? "active" : "available"}`;

    if(session) {

      card.innerHTML = `

        <div class="station-top">

          <div class="station-icon">🎮</div>

          <span class="status active">
            ● ACTIVE
          </span>

        </div>

        <h3>${station.name}</h3>

        <div class="type">
          ${station.type} · ₹${station.rate}/hour
        </div>

        <div class="timer"
             data-start="${session.startTime}"
             data-duration="${session.duration}">
          00:00:00
        </div>

        <div class="session-customer">
          👤 ${escapeHtml(session.customer)}
        </div>

        <div class="station-actions">

          <button onclick="addFoodForSession('${session.id}')">
            🍔 Food
          </button>

          <button class="end"
                  onclick="checkoutSpecific('${session.id}')">
            End Session
          </button>

        </div>
      `;

    } else {

      card.innerHTML = `

        <div class="station-top">

          <div class="station-icon">🎮</div>

          <span class="status available">
            ● AVAILABLE
          </span>

        </div>

        <h3>${station.name}</h3>

        <div class="type">
          ${station.type} · ₹${station.rate}/hour
        </div>

        <div class="timer">
          READY
        </div>

        <div class="session-customer">
          Available for new player
        </div>

        <div class="station-actions">

          <button onclick="openStartSession('${station.id}')"
                  style="grid-column:1/3">
            ▶ Start Session
          </button>

        </div>
      `;

    }

    container.appendChild(card);

  });


  document.getElementById("gaming-count")
    .textContent = stations.length;

  document.getElementById("occupied-count")
    .textContent = occupied;

  document.getElementById("free-count")
    .textContent =
      stations.length - occupied;

}


/* =========================================================
   START SESSION
========================================================= */

function openStartSession(stationId = "") {

  const modal =
    document.getElementById("session-modal");

  const select =
    document.getElementById("session-station");

  select.innerHTML = "";

  stations.forEach(station => {

    if(!getSession(station.id)) {

      const option =
        document.createElement("option");

      option.value = station.id;

      option.textContent =
        `${station.name} — ₹${station.rate}/hr`;

      if(station.id === stationId)
        option.selected = true;

      select.appendChild(option);

    }

  });

  if(select.options.length === 0) {

    showToast("❌ No station available");

    return;

  }

  modal.classList.add("show");

}


function closeStartSession() {

  document
    .getElementById("session-modal")
    .classList.remove("show");

}


function startSession() {

  const customer =
    document.getElementById("session-name")
      .value.trim();

  const phone =
    document.getElementById("session-phone")
      .value.trim();

  const stationId =
    document.getElementById("session-station")
      .value;

  const duration =
    Number(
      document.getElementById("session-duration")
        .value
    );

  if(!customer) {

    showToast("⚠️ Enter customer name");

    return;

  }

  if(phone && !/^\d{10}$/.test(phone)) {

    showToast("⚠️ Enter valid 10 digit phone");

    return;

  }

  if(getSession(stationId)) {

    showToast("❌ Station already occupied");

    return;

  }

  const session = {

    id:
      "SES-" +
      Date.now(),

    stationId,

    customer,

    phone,

    duration,

    startTime:
      Date.now(),

    status:
      "active",

    items:[],

    billNumber:null,

    payment:"Cash"

  };

  sessions.push(session);

  saveData();

  closeStartSession();

  document.getElementById("session-name").value = "";

  document.getElementById("session-phone").value = "";

  beep();

  renderStations();

  populateSessionSelectors();

  updateDashboard();

  showToast(
    `🎮 ${customer}'s session started`
  );

}


/* =========================================================
   TIMER
========================================================= */

function startTimer() {

  setInterval(() => {

    document
      .querySelectorAll(".timer[data-start]")
      .forEach(timer => {

        const start =
          Number(timer.dataset.start);

        const elapsed =
          Math.floor(
            (Date.now() - start) / 1000
          );

        timer.textContent =
          formatDuration(elapsed);

      });

    updateDashboard();

  },1000);

}


function formatDuration(seconds) {

  const h =
    Math.floor(seconds / 3600);

  const m =
    Math.floor((seconds % 3600) / 60);

  const s =
    seconds % 60;

  return [
    String(h).padStart(2,"0"),
    String(m).padStart(2,"0"),
    String(s).padStart(2,"0")
  ].join(":");

}


/* =========================================================
   MENU
========================================================= */

function setCategory(category, button) {

  currentCategory = category;

  document
    .querySelectorAll(".category")
    .forEach(b => b.classList.remove("active"));

  button.classList.add("active");

  renderMenu();

}


function renderMenu() {

  const container =
    document.getElementById("menu-grid");

  if(!container) return;

  const search =
    (
      document.getElementById("menu-search")
        ?.value || ""
    ).toLowerCase();

  container.innerHTML = "";

  const filtered =
    menu.filter(item => {

      const categoryMatch =
        currentCategory === "all" ||
        item.category === currentCategory;

      const searchMatch =
        item.name.toLowerCase()
          .includes(search) ||
        item.desc.toLowerCase()
          .includes(search);

      return categoryMatch && searchMatch;

    });

  if(filtered.length === 0) {

    container.innerHTML =
      `<div class="panel">
        No menu items found.
      </div>`;

    return;

  }

  filtered.forEach(item => {

    const card =
      document.createElement("div");

    card.className = "menu-item";

    card.innerHTML = `

      <div class="menu-icon">
        ${item.icon}
      </div>

      <h3>
        ${escapeHtml(item.name)}
      </h3>

      <p>
        ${escapeHtml(item.desc)}
      </p>

      <div class="menu-bottom">

        <span class="menu-price">
          ₹${item.price}
        </span>

        <button
          class="add-menu"
          onclick="addMenuItem('${item.id}')">
          + Add
        </button>

      </div>
    `;

    container.appendChild(card);

  });

}


function addMenuItem(itemId) {

  const sessionId =
    document.getElementById("menu-session")
      .value;

  if(!sessionId) {

    showToast(
      "⚠️ Select an active session first"
    );

    return;

  }

  const session =
    sessions.find(
      s => s.id === sessionId
    );

  const item =
    menu.find(
      i => i.id === itemId
    );

  if(!session || !item) return;

  session.items.push({

    id:item.id,

    name:item.name,

    price:item.price

  });

  saveData();

  showToast(
    `🍔 ${item.name} added to bill`
  );

  beep();

  populateSessionSelectors();

  document.getElementById("billing-session")
    .value = session.id;

  renderBill();

}


/* =========================================================
   MENU -> SESSION
========================================================= */

function populateSessionSelectors() {

  const selectors = [

    document.getElementById("menu-session"),

    document.getElementById("billing-session")

  ];

  const active =
    sessions.filter(
      s => s.status === "active"
    );

  selectors.forEach(select => {

    if(!select) return;

    const current =
      select.value;

    select.innerHTML = "";

    if(active.length === 0) {

      select.innerHTML =
        `<option value="">No active sessions</option>`;

      return;

    }

    active.forEach(session => {

      const station =
        stations.find(
          s => s.id === session.stationId
        );

      const option =
        document.createElement("option");

      option.value =
        session.id;

      option.textContent =
        `${session.customer} — ${station?.name || session.stationId}`;

      select.appendChild(option);

    });

    if(active.some(s => s.id === current))
      select.value = current;

  });

}


/* =========================================================
   BILLING
========================================================= */

function calculateBill(session) {

  if(!session) {

    return {

      gaming:0,

      food:0,

      subtotal:0,

      gst:0,

      total:0

    };

  }

  const station =
    stations.find(
      s => s.id === session.stationId
    );

  const elapsedHours =
    Math.max(
      1,
      Math.ceil(
        (Date.now() - session.startTime)
        / 3600000
      )
    );

  const gaming =
    station
      ? station.rate * elapsedHours
      : 0;

  const food =
    session.items.reduce(
      (sum,item) =>
        sum + Number(item.price),
      0
    );

  const subtotal =
    gaming + food;

  const gst =
    Math.round(
      subtotal * .05
    );

  const total =
    subtotal + gst;

  return {
    gaming,
    food,
    subtotal,
    gst,
    total,
    elapsedHours
  };

}


function renderBill() {

  const select =
    document.getElementById("billing-session");

  if(!select) return;

  const sessionId =
    select.value;

  const session =
    sessions.find(
      s => s.id === sessionId
    );

  if(!session) {

    clearBill();

    return;

  }

  const station =
    stations.find(
      s => s.id === session.stationId
    );

  const bill =
    calculateBill(session);

  document.getElementById("bill-number")
    .textContent =
      session.billNumber || "DRAFT";

  document.getElementById("bill-date")
    .textContent =
      new Date().toLocaleString("en-IN");

  document.getElementById("bill-customer")
    .textContent =
      session.customer;

  document.getElementById("bill-station")
    .textContent =
      station?.name || session.stationId;


  const items =
    document.getElementById("receipt-items");

  items.innerHTML = "";

  const gamingRow =
    document.createElement("div");

  gamingRow.className =
    "receipt-items-row";

  gamingRow.innerHTML = `
    <span>
      Gaming (${bill.elapsedHours} hr)
    </span>

    <strong>
      ₹${bill.gaming}
    </strong>
  `;

  items.appendChild(gamingRow);


  session.items.forEach((item,index) => {

    const row =
      document.createElement("div");

    row.className =
      "receipt-items-row";

    row.innerHTML = `

      <span>
        ${escapeHtml(item.name)}

        <button
          onclick="removeBillItem('${session.id}',${index})">
          ×
        </button>
      </span>

      <strong>
        ₹${item.price}
      </strong>

    `;

    items.appendChild(row);

  });


  document.getElementById("bill-subtotal")
    .textContent =
      money(bill.subtotal);

  document.getElementById("bill-gst")
    .textContent =
      money(bill.gst);

  document.getElementById("bill-total")
    .textContent =
      money(bill.total);

  document.getElementById("bill-payment")
    .textContent =
      session.payment || selectedPayment;

}


function clearBill() {

  [
    "bill-number",
    "bill-date",
    "bill-customer",
    "bill-station"
  ].forEach(id => {

    const el =
      document.getElementById(id);

    if(el)
      el.textContent = "--";

  });

  document.getElementById("receipt-items")
    .innerHTML =
      `<div style="text-align:center;color:#777">
        No active session selected
      </div>`;

  document.getElementById("bill-subtotal")
    .textContent = "₹0";

  document.getElementById("bill-gst")
    .textContent = "₹0";

  document.getElementById("bill-total")
    .textContent = "₹0";

}


function removeBillItem(sessionId,index) {

  const session =
    sessions.find(
      s => s.id === sessionId
    );

  if(!session) return;

  session.items.splice(index,1);

  saveData();

  renderBill();

  showToast("Item removed");

}


/* =========================================================
   MANUAL ITEM
========================================================= */

function addManualItem() {

  const name =
    document.getElementById("manual-name")
      .value.trim();

  const price =
    Number(
      document.getElementById("manual-price")
        .value
    );

  const sessionId =
    document.getElementById("billing-session")
      .value;

  if(!sessionId) {

    showToast("⚠️ Select active session");

    return;

  }

  if(!name || !price || price <= 0) {

    showToast("⚠️ Enter valid item and price");

    return;

  }

  const session =
    sessions.find(
      s => s.id === sessionId
    );

  session.items.push({

    id:"manual-" + Date.now(),

    name,

    price

  });

  document.getElementById("manual-name")
    .value = "";

  document.getElementById("manual-price")
    .value = "";

  saveData();

  renderBill();

  showToast(
    `✅ ${name} added`
  );

}


/* =========================================================
   PAYMENT
========================================================= */

function selectPayment(method,button) {

  selectedPayment = method;

  document
    .querySelectorAll(".payment")
    .forEach(b =>
      b.classList.remove("active")
    );

  button.classList.add("active");

  const sessionId =
    document.getElementById("billing-session")
      .value;

  const session =
    sessions.find(
      s => s.id === sessionId
    );

  if(session) {

    session.payment =
      method;

    saveData();

  }

  document.getElementById("bill-payment")
    .textContent = method;

}


/* =========================================================
   CHECKOUT
========================================================= */

function checkoutSession() {

  const sessionId =
    document.getElementById("billing-session")
      .value;

  checkoutSpecific(sessionId);

}


function checkoutSpecific(sessionId) {

  const session =
    sessions.find(
      s => s.id === sessionId
    );

  if(!session) {

    showToast("⚠️ No active session");

    return;

  }

  const bill =
    calculateBill(session);

  if(!session.billNumber) {

    session.billNumber =
      "CH-" +
      new Date().getFullYear() +
      "-" +
      billCounter++;

  }

  session.finalAmount =
    bill.total;

  session.status =
    "completed";

  session.endTime =
    Date.now();

  const oldRevenue =
    Number(
      localStorage.getItem("chums_revenue")
    ) || 0;

  localStorage.setItem(
    "chums_revenue",
    oldRevenue + bill.total
  );

  saveData();

  showToast(
    `💳 Checkout completed — ${money(bill.total)}`
  );

  populateSessionSelectors();

  renderStations();

  renderBill();

  updateDashboard();

}


/* =========================================================
   QUICK FOOD FROM STATION
========================================================= */

function addFoodForSession(sessionId) {

  navigate("menu");

  setTimeout(() => {

    document.getElementById("menu-session")
      .value = sessionId;

    showToast(
      "🍔 Select an item to add"
    );

  },100);

}


/* =========================================================
   RESERVATIONS
========================================================= */

function setupDate() {

  const date =
    new Date();

  const local =
    new Date(
      date.getTime() -
      date.getTimezoneOffset()*60000
    )
    .toISOString()
    .split("T")[0];

  const resDate =
    document.getElementById("res-date");

  if(resDate) {

    resDate.value =
      local;

    resDate.min =
      local;

  }

}


function populateReservationStations() {

  const select =
    document.getElementById("res-station");

  if(!select) return;

  select.innerHTML = "";

  stations.forEach(station => {

    const option =
      document.createElement("option");

    option.value =
      station.id;

    option.textContent =
      `${station.name} — ₹${station.rate}/hr`;

    select.appendChild(option);

  });

  updateReservationPrice();

}


document.addEventListener(
  "change",
  e => {

    if(
      e.target.id === "res-hours" ||
      e.target.id === "res-station"
    ) {

      updateReservationPrice();

    }

  }
);


function updateReservationPrice() {

  const station =
    stations.find(
      s =>
        s.id ===
        document.getElementById("res-station")?.value
    );

  const hours =
    Number(
      document.getElementById("res-hours")?.value
    ) || 1;

  if(station) {

    document.getElementById("reservation-total")
      .textContent =
        money(
          station.rate * hours
        );

  }

}


function createReservation(event) {

  event.preventDefault();

  const name =
    document.getElementById("res-name")
      .value.trim();

  const phone =
    document.getElementById("res-phone")
      .value.trim();

  const stationId =
    document.getElementById("res-station")
      .value;

  const date =
    document.getElementById("res-date")
      .value;

  const hours =
    Number(
      document.getElementById("res-hours")
        .value
    );

  const time =
    document.getElementById("res-time")
      .value;


  if(!/^\d{10}$/.test(phone)) {

    showToast(
      "⚠️ Enter valid 10 digit phone"
    );

    return;

  }


  const conflict =
    reservations.some(r =>

      r.status === "Confirmed" &&

      r.stationId === stationId &&

      r.date === date &&

      r.time === time

    );

  if(conflict) {

    showToast(
      "❌ This station is already reserved for that slot"
    );

    return;

  }


  reservations.push({

    id:
      "RES-" +
      Date.now(),

    customer:name,

    phone,

    stationId,

    date,

    time,

    hours,

    status:"Confirmed"

  });

  saveData();

  event.target.reset();

  setupDate();

  renderReservations();

  updateDashboard();

  showToast(
    `📅 Reservation confirmed for ${name}`
  );

}


function renderReservations() {

  const tbody =
    document.getElementById("reservation-table");

  if(!tbody) return;

  tbody.innerHTML = "";

  if(reservations.length === 0) {

    tbody.innerHTML =
      `<tr>
        <td colspan="6"
            style="text-align:center;color:#888">
          No reservations
        </td>
      </tr>`;

    return;

  }


  reservations
    .slice()
    .reverse()
    .forEach(res => {

      const station =
        stations.find(
          s => s.id === res.stationId
        );

      const tr =
        document.createElement("tr");

      tr.innerHTML = `

        <td>
          <strong>
            ${escapeHtml(res.customer)}
          </strong>
          <br>
          <small>${res.phone}</small>
        </td>

        <td>
          ${station?.name || res.stationId}
        </td>

        <td>
          ${res.date}
        </td>

        <td>
          ${res.time}
          <br>
          ${res.hours} hr
        </td>

        <td>
          <span class="badge">
            ${res.status}
          </span>
        </td>

        <td>
          <button
            class="danger-btn"
            style="padding:7px 10px"
            onclick="cancelReservation('${res.id}')">
            Cancel
          </button>
        </td>

      `;

      tbody.appendChild(tr);

    });

}


function cancelReservation(id) {

  const reservation =
    reservations.find(
      r => r.id === id
    );

  if(!reservation) return;

  reservation.status =
    "Cancelled";

  saveData();

  renderReservations();

  updateDashboard();

  showToast(
    "Reservation cancelled"
  );

}


/* =========================================================
   PRINT
========================================================= */

function printReceipt() {

  const sessionId =
    document.getElementById("billing-session")
      .value;

  const session =
    sessions.find(
      s => s.id === sessionId
    );

  if(!session) {

    showToast(
      "⚠️ Select a session first"
    );

    return;

  }

  if(!session.billNumber) {

    session.billNumber =
      "CH-" +
      new Date().getFullYear() +
      "-" +
      billCounter++;

    saveData();

    renderBill();

  }

  window.print();

}


/* =========================================================
   UTILITY
========================================================= */

function money(amount) {

  return "₹" +
    Number(amount || 0)
      .toLocaleString("en-IN");

}


function escapeHtml(value) {

  return String(value)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");

}


/* =========================================================
   SCROLL BAR
========================================================= */

window.addEventListener(
  "scroll",
  () => {

    const scroll =
      document.documentElement.scrollTop;

    const height =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;

    const percentage =
      height
        ? (scroll / height) * 100
        : 0;

    document.getElementById("scroll-bar")
      .style.width =
        percentage + "%";

  }
);


/* =========================================================
   MODAL
========================================================= */

function openModal(title,content) {

  document.getElementById("modal-title")
    .textContent = title;

  document.getElementById("modal-content")
    .innerHTML = content;

  document.getElementById("modal")
    .classList.add("show");

}


function closeModal() {

  document.getElementById("modal")
    .classList.remove("show");

}