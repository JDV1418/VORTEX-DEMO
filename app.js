/* ============================================================
   VORTEX PH — Lógica del prototipo (estado en memoria)
   ============================================================ */

/* ---------- Estado global ---------- */
const state = {
  user: null,
  route: "dashboard",
  reports: JSON.parse(JSON.stringify(SEED_REPORTS)),
  reservas: [],
  notifs: JSON.parse(JSON.stringify(SEED_NOTIFS)),
  audit: [...SEED_AUDIT],
  queueIdx: 0,
  ticketSeq: 1013,
  resSeq: 8,
  sessionLeft: 30 * 60,
  sessionTimer: null,
  selRole: "admin",
  revealed: {},
  theme: "night",
  themeManual: false,
  calRef: null,
};

const TABS = [
  { id: "dashboard",    label: "Dashboard",             icon: "🏠" },
  { id: "reportes",     label: "Reportes",              icon: "🎫" },
  { id: "reservas",     label: "Reservas",              icon: "📅" },
  { id: "residentes",   label: "Residentes",            icon: "👥" },
  { id: "comprobantes", label: "Comprobantes",          icon: "🧾" },
  { id: "comunicados",  label: "Comunicados",           icon: "📢" },
  { id: "votaciones",   label: "Votaciones",            icon: "🗳️" },
  { id: "areas",        label: "Áreas",                 icon: "🏛️" },
  { id: "auditoria",    label: "Auditoría y Seguridad", icon: "🛡️" },
];

/* ---------- Utilidades ---------- */
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function nowStr() {
  const d = new Date();
  return d.toISOString().slice(0, 10) + " " + d.toTimeString().slice(0, 5);
}
function timeStr() {
  const d = new Date();
  let h = d.getHours(), m = String(d.getMinutes()).padStart(2, "0");
  const ap = h >= 12 ? "PM" : "AM"; h = h % 12 || 12;
  return `Hoy ${h}:${m} ${ap}`;
}
function isoLocal(d) {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
function dateFromOffset(off) {
  const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + off); return d;
}
function fmtFecha(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-PA", { weekday: "long", day: "numeric", month: "long" });
}
function fmtHora(hhmm) {
  let [h, m] = hhmm.split(":").map(Number);
  const ap = h >= 12 ? "PM" : "AM"; h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, "0")} ${ap}`;
}
function toast(msg, kind = "") {
  const t = document.createElement("div");
  t.className = "toast " + kind;
  t.innerHTML = msg;
  $("#toastRoot").appendChild(t);
  setTimeout(() => t.remove(), 4200);
}
function audit(action, detail) {
  state.audit.unshift({ t: nowStr(), user: state.user ? state.user.name : "Sistema", action, detail });
}
function isAdmin() { return state.user && state.user.role === "admin"; }

function pendingReports() { return state.reports.filter((r) => r.status !== "resuelto"); }
function statusChip(s) {
  const map = { nuevo: "Nuevo", proceso: "En proceso", resuelto: "Resuelto" };
  return `<span class="chip ${s}">● ${map[s]}</span>`;
}
function catChip(catId) {
  const c = CATS[catId];
  return `<span class="chip cat">${c.icon} ${c.label}</span>`;
}
function locLabel(r) {
  if (r.location.kind === "apt") return r.location.apt;
  if (r.location.kind === "area") { const a = AREAS.find((x) => x.id === r.location.areaId); return a ? a.name : "Área común"; }
  return "General";
}
function srcIcon(type) { return type === "foto" ? "📷" : type === "voz" ? "🎤" : "💬"; }

/* ---------- Inicialización de reservas ---------- */
function initReservas() {
  state.reservas = SEED_RESERVAS.map((r) => ({
    id: r.id, espacio: r.espacio, apt: r.apt, name: r.name,
    fecha: isoLocal(dateFromOffset(r.off)), ini: r.ini, fin: r.fin, motivo: r.motivo,
    estado: r.estado, origen: "App",
  }));
  const c = new Date(); c.setDate(1); c.setHours(0, 0, 0, 0);
  state.calRef = c;
}

/* ============================================================
   TEMA DÍA / NOCHE
   ============================================================ */
function themeByTime() {
  const h = new Date().getHours();
  return h >= 6 && h < 18 ? "day" : "night";
}
function applyTheme(t) {
  state.theme = t;
  document.documentElement.setAttribute("data-theme", t);
  const b = $("#btnTheme");
  if (b) { b.textContent = t === "day" ? "☀️" : "🌙"; b.title = t === "day" ? "Modo día (auto). Toca para noche" : "Modo noche (auto). Toca para día"; }
}
function toggleTheme() {
  state.themeManual = true;
  applyTheme(state.theme === "day" ? "night" : "day");
  toast(state.theme === "day" ? "☀️ Modo día activado." : "🌙 Modo noche activado.");
}

/* ============================================================
   NOTIFICACIONES
   ============================================================ */
function addNotif(icon, txt) {
  state.notifs.unshift({ icon, txt, t: timeStr(), unread: true });
  updateNotifBadge();
}
function updateNotifBadge() {
  const el = $("#notifBadge");
  if (!el) return;
  const n = state.notifs.filter((x) => x.unread).length;
  el.textContent = n;
  el.classList.toggle("hidden", n === 0);
}
function openNotifs() {
  openModal(`
    <div class="modal-head">
      <div><div class="modal-title">🔔 Notificaciones</div><div class="modal-sub">Recordatorios y avisos del PH</div></div>
      <button class="modal-x" onclick="closeModal()">✕</button>
    </div>
    ${state.notifs.length ? state.notifs.map((n) => `
      <div class="notif-row ${n.unread ? "unread" : ""}"><span class="ni">${n.icon}</span>
      <span><div>${esc(n.txt)}</div><div class="nt">${esc(n.t)}</div></span></div>`).join("")
      : `<div class="login-note">Sin notificaciones.</div>`}
  `);
  state.notifs.forEach((n) => (n.unread = false));
  updateNotifBadge();
}

/* ============================================================
   LOGIN (clave de 4 dígitos) + SESIÓN
   ============================================================ */
function renderRoleCards() {
  $("#roleCards").innerHTML = Object.values(USERS).map((u) => `
    <button class="role-card ${state.selRole === u.role ? "sel" : ""}" onclick="selRole('${u.role}')">
      <span class="role-avatar">${u.initials}</span>
      <span>
        <div class="rc-name">${u.name}</div>
        <div class="rc-desc">${u.role === "admin" ? "Control total · todos los módulos" : "Solo lectura · únicamente Dashboard"}</div>
      </span>
    </button>`).join("");
}
function selRole(r) { state.selRole = r; renderRoleCards(); }

// PIN de 4 dígitos: avance automático + Enter para entrar
document.querySelectorAll("#pinRow input").forEach((inp, i, arr) => {
  inp.addEventListener("input", () => {
    inp.value = inp.value.replace(/\D/g, "");
    if (inp.value && i < arr.length - 1) arr[i + 1].focus();
  });
  inp.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" && !inp.value && i > 0) arr[i - 1].focus();
    if (e.key === "Enter") $("#btnLogin").click();
  });
});

$("#btnLogin").addEventListener("click", () => {
  const pin = [...document.querySelectorAll("#pinRow input")].map((i) => i.value).join("");
  if (pin.length < 4) { toast("🔐 Ingresa los 4 dígitos de tu clave de acceso.", "warn"); return; }
  doLogin();
});

function doLogin() {
  state.user = USERS[state.selRole];
  state.route = "dashboard";
  state.sessionLeft = 30 * 60;
  $("#loginScreen").classList.add("hidden");
  $("#app").classList.remove("hidden");
  $("#fabSim").classList.remove("hidden");
  const rc = $("#roleChip");
  rc.className = "role-chip " + state.user.role;
  rc.innerHTML = `${state.user.role === "admin" ? "🛡️" : "👁️"} <span class="rc-txt">${state.user.roleLabel}</span>`;
  audit("LOGIN_PIN", `Sesión iniciada con clave de 4 dígitos — rol ${state.user.roleLabel}`);
  if (state.sessionTimer) clearInterval(state.sessionTimer);
  state.sessionTimer = setInterval(tickSession, 1000);
  applyTheme(state.theme);
  updateNotifBadge();
  render();
  toast(`✅ Bienvenido, <strong>${esc(state.user.name)}</strong>. Acceso verificado.`);
}
function tickSession() {
  state.sessionLeft--;
  const m = String(Math.floor(state.sessionLeft / 60)).padStart(2, "0");
  const s = String(state.sessionLeft % 60).padStart(2, "0");
  $("#sessionChip").textContent = `⏱ ${m}:${s}`;
  if (!state.themeManual) { const t = themeByTime(); if (t !== state.theme) applyTheme(t); }
  if (state.sessionLeft <= 0) logout(true);
}
function logout(expired = false) {
  audit("LOGOUT", expired ? "Sesión expirada automáticamente" : "Cierre de sesión manual");
  clearInterval(state.sessionTimer);
  state.user = null;
  closeModal();
  $("#app").classList.add("hidden");
  $("#fabSim").classList.add("hidden");
  $("#loginScreen").classList.remove("hidden");
  document.querySelectorAll("#pinRow input").forEach((i) => (i.value = ""));
  if (expired) toast("⏱ Sesión expirada por seguridad. Vuelve a iniciar sesión.", "warn");
}
$("#btnLogout").addEventListener("click", () => logout(false));

/* ============================================================
   NAVEGACIÓN + RBAC
   ============================================================ */
function go(route) {
  closeNav();
  if (!isAdmin() && route !== "dashboard") {
    toast("🔒 Rol <strong>Junta Directiva</strong>: acceso de solo lectura al Dashboard.", "warn");
    return;
  }
  state.route = route;
  if (isAdmin() && route !== "dashboard") audit("ACCESO_MÓDULO", `Módulo ${TABS.find((t) => t.id === route).label}`);
  render();
  window.scrollTo({ top: 0 });
}

function renderNav() {
  $("#navTabs").innerHTML = TABS.map((t) => {
    const locked = !isAdmin() && t.id !== "dashboard";
    return `<button class="nav-tab ${state.route === t.id ? "active" : ""} ${locked ? "locked" : ""}" onclick="go('${t.id}')">${locked ? "🔒 " : ""}${t.label}</button>`;
  }).join("");
  const cur = TABS.find((t) => t.id === state.route);
  const cm = $("#currentModule");
  if (cm) cm.textContent = cur ? cur.label : "";
  renderDrawer();
}

/* ---------- Menú móvil (drawer) ---------- */
function renderDrawer() {
  const el = $("#drawerLinks");
  if (!el) return;
  el.innerHTML = TABS.map((t) => {
    const locked = !isAdmin() && t.id !== "dashboard";
    return `<button class="drawer-link ${state.route === t.id ? "active" : ""} ${locked ? "locked" : ""}" onclick="go('${t.id}')">
      <span class="dl-ico">${locked ? "🔒" : t.icon}</span> ${t.label}</button>`;
  }).join("");
}
function openNav() {
  renderDrawer();
  $("#navDrawer").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}
function closeNav() {
  const d = $("#navDrawer");
  if (d) d.classList.add("hidden");
  document.body.style.overflow = $("#modalRoot").innerHTML ? "hidden" : "";
}

function render() {
  renderNav();
  const views = {
    dashboard: viewDashboard, reportes: viewReportes, reservas: viewReservas, residentes: viewResidentes,
    comprobantes: viewComprobantes, comunicados: viewComunicados, votaciones: viewVotaciones,
    areas: viewAreas, auditoria: viewAuditoria,
  };
  $("#view").innerHTML = views[state.route]();
}

/* ============================================================
   DASHBOARD
   ============================================================ */
function viewDashboard() {
  const pend = pendingReports();
  const nuevos = state.reports.filter((r) => r.status === "nuevo").length;
  const proceso = state.reports.filter((r) => r.status === "proceso").length;
  const resueltos = state.reports.filter((r) => r.status === "resuelto").length;
  const alDia = RESIDENTS.filter((r) => r.estado === "Al día").length;
  const pctRes = Math.round((resueltos / state.reports.length) * 100);
  const pctPagos = Math.round((alDia / RESIDENTS.length) * 100);
  const vote = VOTES.find((v) => v.status === "activa");
  const pctVote = Math.round((vote.respondidos / vote.enviados) * 100);
  const areasConRep = AREAS.filter((a) => state.reports.some((r) => r.location.areaId === a.id && r.status !== "resuelto")).length;
  const hoyIso = isoLocal(new Date());
  const resProximas = state.reservas.filter((r) => r.fecha >= hoyIso && r.estado !== "cancelada").length;
  const resPend = state.reservas.filter((r) => r.estado === "pendiente" || r.estado === "conflicto").length;
  const hour = new Date().getHours();
  const saludo = hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";

  return `
  <div class="hero">
    <div>
      <h1>${saludo},<br />${esc(state.user.name.split(" ")[0])}</h1>
      <div class="hero-sub">${PH_NAME} · ${new Date().toLocaleDateString("es-PA", { weekday: "long", day: "numeric", month: "long" })}</div>
    </div>
    <div class="pills">
      <span class="pill"><span class="dot ${pend.length === 0 ? "g" : "r"}"></span> ${pend.length === 0 ? "PH sin pendientes" : pend.length + " pendientes"}</span>
      <span class="pill"><span class="dot o"></span> ${nuevos} nuevos</span>
      <span class="pill"><span class="dot a"></span> ${proceso} en proceso</span>
      <span class="pill"><span class="dot g"></span> ${resueltos} resueltos</span>
    </div>
  </div>

  <div class="dash-grid">
    <div class="card building-card">
      <div class="building-head">
        <span class="card-title">Estado del edificio</span>
        <span class="building-legend">
          <span><span class="dot g"></span> Sano</span>
          <span><span class="dot r"></span> Con reportes</span>
        </span>
      </div>
      ${buildingSvg()}
      <div class="ext-chips">${extChips()}</div>
    </div>

    <div class="dash-col">
      <div class="kpi-grid">
        ${kpiCard("reportes", "🎫", pend.length, "Reportes pendientes", `<span class="txt-r">${nuevos} nuevos</span>`)}
        ${kpiCard("reservas", "📅", resProximas, "Reservas próximas", `<span class="txt-a">${resPend} por confirmar</span>`)}
        ${kpiCard("residentes", "👥", RESIDENTS.length, "Residentes", `<span class="txt-g">${pctPagos}% al día</span>`)}
        ${kpiCard("comprobantes", "🧾", RECEIPTS.length, "Comprobantes", `<span class="txt-a">${RECEIPTS.filter((c) => c.estado !== "Confirmado").length} por verificar</span>`)}
        ${kpiCard("votaciones", "🗳️", pctVote + "%", "Participación votación", `<span class="txt-g">${vote.respondidos}/${vote.enviados} respuestas</span>`)}
        ${kpiCard("areas", "🏛️", areasConRep, "Áreas con reportes", `<span class="txt-m">de ${AREAS.length} áreas comunes</span>`)}
      </div>

      <div class="card">
        <span class="card-title">Reportes · últimos 30 días</span>
        ${lineChart()}
        <div class="chart-legend">
          <span><i style="background:var(--green)"></i>Recibidos</span>
          <span><i style="background:var(--orange)"></i>Resueltos</span>
        </div>
      </div>

      <div class="card">
        <span class="card-title">Indicadores de gestión</span>
        <div class="gauge-row" style="margin-top:12px">
          ${gauge(pctRes, "Reportes resueltos")}
          ${gauge(82, "SLA de respuesta")}
          ${gauge(pctPagos, "Pagos al día")}
        </div>
      </div>
    </div>
  </div>`;
}

function kpiCard(route, icon, num, label, hint) {
  return `<button class="kpi" onclick="go('${route}')">
    <span class="kpi-icon">${icon}</span>
    <span class="arrow">↗</span>
    <div class="kpi-num">${num}</div>
    <div class="kpi-label">${label}</div>
    <div class="kpi-hint">${hint}</div>
  </button>`;
}

/* ---------- Edificio 3D en alzado ---------- */
function floorPending(f) {
  return state.reports.filter((r) => r.location.floor === f && r.status !== "resuelto").length;
}
function buildingSvg() {
  const fx = 74, fw = 170, fh = 34, dx = 34, dy = 15, topY = 58;
  let out = `<svg id="buildingSvg" viewBox="0 0 330 ${topY + 12 * fh + 48 + 26}" xmlns="http://www.w3.org/2000/svg">`;
  out += `<polygon points="${fx},${topY} ${fx + dx},${topY - dy} ${fx + fw + dx},${topY - dy} ${fx + fw},${topY}" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>`;
  out += `<line x1="${fx + fw / 2}" y1="${topY - dy - 16}" x2="${fx + fw / 2}" y2="${topY - dy + 2}" stroke="rgba(255,255,255,0.25)" stroke-width="1.5"/><circle cx="${fx + fw / 2}" cy="${topY - dy - 18}" r="2.5" fill="var(--red)"/>`;
  for (let i = 0; i < 12; i++) {
    const f = 12 - i;
    const y = topY + i * fh;
    const pend = floorPending(f);
    const cls = pend > 0 ? "floor-r" : "floor-g";
    out += `<g class="floor-group ${cls}" onclick="openFloor(${f})">`;
    out += `<rect class="floor-front" x="${fx}" y="${y}" width="${fw}" height="${fh - 2}" rx="3" stroke-width="1"/>`;
    out += `<polygon class="floor-side" points="${fx + fw},${y} ${fx + fw + dx},${y - dy} ${fx + fw + dx},${y + fh - 2 - dy} ${fx + fw},${y + fh - 2}" stroke-width="1"/>`;
    for (let w = 0; w < 4; w++) out += `<rect class="floor-win" x="${fx + 16 + w * 40}" y="${y + 9}" width="22" height="13" rx="2"/>`;
    out += `<text class="floor-label" x="${fx - 10}" y="${y + fh / 2 + 3}" text-anchor="end">P${f}</text>`;
    if (pend > 0) out += `<circle cx="${fx + fw + dx + 12}" cy="${y + fh / 2 - dy / 2}" r="9" fill="var(--red)"/><text class="floor-count" x="${fx + fw + dx + 12}" y="${y + fh / 2 - dy / 2 + 3.5}" text-anchor="middle" fill="#fff">${pend}</text>`;
    out += `</g>`;
  }
  const yPB = topY + 12 * fh, hPB = 46;
  const pendPB = state.reports.filter((r) => r.location.floor === "PB" && r.status !== "resuelto").length;
  const clsPB = pendPB > 0 ? "floor-r" : "floor-g";
  out += `<g class="floor-group ${clsPB}" onclick="openFloor('PB')">`;
  out += `<rect class="floor-front" x="${fx}" y="${yPB}" width="${fw}" height="${hPB}" rx="3" stroke-width="1"/>`;
  out += `<polygon class="floor-side" points="${fx + fw},${yPB} ${fx + fw + dx},${yPB - dy} ${fx + fw + dx},${yPB + hPB - dy} ${fx + fw},${yPB + hPB}" stroke-width="1"/>`;
  out += `<rect class="floor-win" x="${fx + fw / 2 - 16}" y="${yPB + 14}" width="32" height="32" rx="3"/>`;
  out += `<rect class="floor-win" x="${fx + 18}" y="${yPB + 14}" width="18" height="12" rx="2"/><rect class="floor-win" x="${fx + fw - 36}" y="${yPB + 14}" width="18" height="12" rx="2"/>`;
  out += `<text class="floor-label" x="${fx - 10}" y="${yPB + hPB / 2 + 3}" text-anchor="end">PB</text>`;
  if (pendPB > 0) out += `<circle cx="${fx + fw + dx + 12}" cy="${yPB + hPB / 2 - dy / 2}" r="9" fill="var(--red)"/><text class="floor-count" x="${fx + fw + dx + 12}" y="${yPB + hPB / 2 - dy / 2 + 3.5}" text-anchor="middle" fill="#fff">${pendPB}</text>`;
  out += `</g>`;
  out += `<line x1="30" y1="${yPB + hPB + 8}" x2="300" y2="${yPB + hPB + 8}" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/>`;
  out += `</svg>`;
  return out;
}
function extChips() {
  const ext = AREAS.filter((a) => a.floor === "EXT");
  return ext.map((a) => {
    const pend = state.reports.filter((r) => r.location.areaId === a.id && r.status !== "resuelto").length;
    return `<button class="ext-chip" onclick="openArea('${a.id}')"><span class="dot ${pend > 0 ? "r" : "g"}"></span>${a.icon} ${a.name}${pend > 0 ? ` · ${pend}` : ""}</button>`;
  }).join("");
}

/* ---------- Gráfica de líneas ---------- */
function smoothPath(data, w, h, max) {
  const stepX = w / (data.length - 1);
  const pts = data.map((v, i) => [i * stepX, h - (v / max) * (h - 14) - 6]);
  let d = `M ${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    const cx = (x0 + x1) / 2;
    d += ` C ${cx},${y0} ${cx},${y1} ${x1},${y1}`;
  }
  return d;
}
function lineChart() {
  const w = 560, h = 160, max = Math.max(...CHART_RECIBIDOS, ...CHART_RESUELTOS) + 1;
  const grid = [0.25, 0.5, 0.75].map((p) => `<line x1="0" y1="${h * p}" x2="${w}" y2="${h * p}" stroke="rgba(150,150,150,0.12)" stroke-width="1"/>`).join("");
  return `<svg viewBox="0 0 ${w} ${h}" style="width:100%;height:auto;margin-top:10px" preserveAspectRatio="none">
    <defs>
      <linearGradient id="gFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="rgba(52,211,153,0.22)"/><stop offset="100%" stop-color="rgba(52,211,153,0)"/>
      </linearGradient>
    </defs>
    ${grid}
    <path d="${smoothPath(CHART_RECIBIDOS, w, h, max)} L ${w},${h} L 0,${h} Z" fill="url(#gFill)" stroke="none"/>
    <path d="${smoothPath(CHART_RECIBIDOS, w, h, max)}" fill="none" stroke="var(--green)" stroke-width="2.5" stroke-linecap="round"/>
    <path d="${smoothPath(CHART_RESUELTOS, w, h, max)}" fill="none" stroke="var(--orange)" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="1 0"/>
  </svg>`;
}

/* ---------- Gauges semicirculares ---------- */
function gauge(pct, label) {
  const color = pct < 50 ? "var(--red)" : pct < 75 ? "var(--amber)" : "var(--green)";
  return `<div class="gauge-box">
    <svg viewBox="0 0 120 68">
      <path d="M 12 62 A 48 48 0 0 1 108 62" fill="none" stroke="var(--panel3)" stroke-width="10" stroke-linecap="round"/>
      <path d="M 12 62 A 48 48 0 0 1 108 62" fill="none" stroke="${color}" stroke-width="10" stroke-linecap="round"
        stroke-dasharray="${(pct / 100) * 150.8} 999"/>
    </svg>
    <div class="gauge-val" style="color:${color}">${pct}%</div>
    <div class="gauge-label">${label}</div>
  </div>`;
}

/* ============================================================
   MÓDULO REPORTES
   ============================================================ */
let repFilter = "todos";
function setRepFilter(f) { repFilter = f; render(); }

function ticketCard(r) {
  return `<button class="ticket" onclick="openTicket('${r.id}')">
    <div class="ticket-top">${catChip(r.cat)}${statusChip(r.status)}</div>
    <div class="ticket-title">${esc(r.title)}</div>
    <div class="ticket-desc">${esc(r.desc)}</div>
    <div class="ticket-meta">
      <span class="chip src">${srcIcon(r.source.type)} WhatsApp</span>
      <span>📍 ${esc(locLabel(r))}</span><span>· ${esc(r.source.time)}</span>
    </div>
  </button>`;
}

function viewReportes() {
  const groups = { Tareas: ["tarea"], Mantenimiento: ["aseo", "plomeria", "electricidad", "lostfound", "mejoras"], Seguridad: ["paqueteria", "seguridad"] };
  const filters = ["todos", "Tareas", "Mantenimiento", "Seguridad"];
  let body = "";
  for (const [gName, catIds] of Object.entries(groups)) {
    if (repFilter !== "todos" && repFilter !== gName) continue;
    for (const cid of catIds) {
      const items = state.reports.filter((r) => r.cat === cid).sort((a, b) => (a.status === "resuelto") - (b.status === "resuelto"));
      if (!items.length) continue;
      body += `<div class="group-title">${CATS[cid].icon} ${gName} · ${CATS[cid].label} (${items.length})</div>
        <div class="cat-grid">${items.map(ticketCard).join("")}</div>`;
    }
  }
  return `
  <div class="view-head">
    <div><h2>Reportes</h2><div class="crumb">Clasificados automáticamente por el bot de WhatsApp 🤖</div></div>
    <div class="seg-tabs">${filters.map((f) => `<button class="seg-tab ${repFilter === f ? "active" : ""}" onclick="setRepFilter('${f}')">${f === "todos" ? "Todos" : f}</button>`).join("")}</div>
  </div>${body}`;
}

/* ---------- Modal Ticket ---------- */
let selProv = null;
function openTicket(id, readOnly = false) {
  selProv = null;
  const r = state.reports.find((x) => x.id === id);
  if (!r) return;
  if (isAdmin()) audit("ACCESO_TICKET", `${r.id} — ${r.title}`);
  const ro = readOnly || !isAdmin();

  const waOriginal = waBubble(r.source.from, r.source);
  const providers = [...PROVIDERS].sort((a, b) => (b.cat === r.cat) - (a.cat === r.cat));

  openModal(`
    <div class="modal-head">
      <div>
        <div class="modal-title">${esc(r.title)}</div>
        <div class="modal-sub">${r.id.toUpperCase()} · 📍 ${esc(locLabel(r))} · ${esc(r.source.time)}</div>
      </div>
      <button class="modal-x" onclick="closeModal()">✕</button>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
      ${catChip(r.cat)}<span id="mStatusChip">${statusChip(r.status)}</span>
      ${ro ? "" : `<select class="status-select" id="mStatusSel" onchange="setStatus('${r.id}', this.value)">
        <option value="nuevo" ${r.status === "nuevo" ? "selected" : ""}>Nuevo</option>
        <option value="proceso" ${r.status === "proceso" ? "selected" : ""}>En proceso</option>
        <option value="resuelto" ${r.status === "resuelto" ? "selected" : ""}>Resuelto</option>
      </select>`}
    </div>

    <div class="modal-section">
      <span class="card-title">Mensaje original de WhatsApp</span>
      <div class="wa-box" id="waThread">
        ${waOriginal}
        <div class="bot-line">🤖 <strong>Bot Vortex</strong> clasificó → <span class="chip cat">${CATS[r.cat].icon} ${CATS[r.cat].group} · ${CATS[r.cat].label}</span></div>
      </div>
    </div>

    <div class="modal-section">
      <span class="card-title">Historial</span>
      <div class="timeline">${r.timeline.map((t) => `<div class="tl-item"><span class="tl-dot"></span><span class="tl-t">${esc(t.t)}</span><span class="tl-e">${esc(t.e)}</span></div>`).join("")}</div>
    </div>

    ${ro ? `<div class="modal-section"><div class="login-note">👁️ Vista de solo lectura (rol Junta Directiva). Las acciones están reservadas a la administración.</div></div>` : `
    <div class="modal-section">
      <span class="card-title">① Solicitar servicio a proveedor</span>
      <div class="prov-list" id="provList">
        ${providers.slice(0, 4).map((p) => `
          <button class="prov-row" id="prov-${p.id}" onclick="pickProv('${r.id}','${p.id}')">
            <span class="avatar">${p.name.slice(0, 2).toUpperCase()}</span>
            <span style="flex:1"><div class="pr-name">${p.name} ${p.cat === r.cat ? '<span class="chip resuelto">sugerido</span>' : ""}</div>
            <div class="pr-meta">${CATS[p.cat].label} · ⭐ ${p.rating} · ${p.phone}</div></span>
          </button>`).join("")}
      </div>
      <div id="provMsgZone"></div>
    </div>

    <div class="modal-section">
      <span class="card-title">② Enviar resolución / comprobante al residente</span>
      <textarea class="gen-msg" id="resMsg">${residentMsg(r)}</textarea>
      <div class="action-row">
        <button class="btn btn-wa btn-sm" onclick="sendResident('${r.id}')">📤 Enviar por WhatsApp al residente</button>
      </div>
      <div id="resSentZone"></div>
    </div>`}
  `);
}

function waBubble(from, src) {
  let media = "";
  if (src.type === "foto") media = `<div class="wa-media">🖼️</div>`;
  if (src.type === "voz") media = `<div class="wa-voice"><button class="wv-play">▶</button><span class="wv-wave">${[6, 12, 18, 10, 16, 8, 14, 19, 9, 15, 7, 12, 17, 10, 6].map((h) => `<i style="height:${h}px"></i>`).join("")}</span></div>`;
  return `<div class="wa-bubble"><div class="wa-from">${esc(from)}</div>${media}<div>${esc(src.raw)}</div><div class="wa-time">${esc(src.time)} ✓✓</div></div>`;
}
function waMeBubble(to, inner, time = timeStr()) {
  return `<div class="wa-bubble me"><div class="wa-from">Vortex PH → ${esc(to)}</div>${inner}<div class="wa-time">${esc(time)} ✓✓</div></div>`;
}

function refreshTicketStatusUI(r) {
  const c = $("#mStatusChip"); if (c) c.innerHTML = statusChip(r.status);
  const s = $("#mStatusSel"); if (s) s.value = r.status;
}

function setStatus(id, status) {
  const r = state.reports.find((x) => x.id === id);
  r.status = status;
  r.timeline.push({ t: timeStr(), e: `Estado cambiado a "${status === "proceso" ? "En proceso" : status[0].toUpperCase() + status.slice(1)}" por ${state.user.name}` });
  audit("CAMBIO_ESTADO", `${id} → ${status}`);
  toast(`Estado de <strong>${esc(r.title)}</strong> → ${status === "proceso" ? "En proceso" : status}.`);
  render();
  openTicket(id);
}

function providerMsg(r, p) {
  return `Hola ${p.name} 👋, le escribe la administración de ${PH_NAME}.\n\nTenemos un reporte de ${CATS[r.cat].label.toUpperCase()} en ${locLabel(r)}:\n“${r.desc}”\n\n¿Podría indicarnos disponibilidad y cotización para atenderlo? Quedamos atentos. Gracias.`;
}
function residentMsg(r) {
  const who = r.source.from.split(" (")[0];
  return `Hola ${who} 👋, le informa la administración de ${PH_NAME}.\n\nSobre su reporte “${r.title}”: ya fue atendido y gestionado. Adjuntamos constancia/comprobante de la gestión. ✅\n\nGracias por reportarlo por este medio.`;
}

function pickProv(rid, pid) {
  selProv = pid;
  const r = state.reports.find((x) => x.id === rid);
  const p = PROVIDERS.find((x) => x.id === pid);
  document.querySelectorAll(".prov-row").forEach((el) => el.classList.remove("sel"));
  $("#prov-" + pid).classList.add("sel");
  $("#provMsgZone").innerHTML = `
    <div style="margin-top:12px">
      <span class="card-title">Mensaje generado automáticamente</span>
      <textarea class="gen-msg" id="provMsg" style="margin-top:8px">${providerMsg(r, p)}</textarea>
      <div class="action-row"><button class="btn btn-wa btn-sm" onclick="sendProvider('${rid}','${pid}')">📤 Enviar por WhatsApp a ${p.name}</button></div>
      <div id="provSentZone"></div>
    </div>`;
}

function sendProvider(rid, pid) {
  const r = state.reports.find((x) => x.id === rid);
  const p = PROVIDERS.find((x) => x.id === pid);
  const msg = $("#provMsg").value;
  r.provider = pid;
  if (r.status === "nuevo") r.status = "proceso";
  r.timeline.push({ t: timeStr(), e: `Solicitud enviada por WhatsApp a ${p.name}` });
  audit("ENVÍO_WHATSAPP", `Solicitud a ${p.name} — ticket ${rid}`);
  refreshTicketStatusUI(r);
  $("#provSentZone").innerHTML = `
    <div class="wa-box" style="margin-top:10px">
      ${waMeBubble(p.name, `<div style="white-space:pre-wrap">${esc(msg)}</div>`)}
      <div class="bot-line"><span class="spinner"></span> Esperando respuesta del proveedor…</div>
    </div>`;
  toast(`📤 Solicitud enviada a <strong>${esc(p.name)}</strong>. Ticket en proceso.`);
  setTimeout(() => {
    const zone = $("#provSentZone");
    if (!zone) return;
    zone.querySelector(".bot-line").outerHTML = waBubble(p.name, { type: "texto", raw: "Recibido 👍 Puedo pasar mañana a las 9:00 AM a revisar. Le confirmo la cotización en sitio.", time: timeStr() });
    r.timeline.push({ t: timeStr(), e: `${p.name} confirmó visita para mañana 9:00 AM` });
    render();
  }, 1600);
  render();
}

function sendResident(rid) {
  const r = state.reports.find((x) => x.id === rid);
  const msg = $("#resMsg").value;
  const who = r.source.from.split(" (")[0];
  r.status = "resuelto";
  r.timeline.push({ t: timeStr(), e: `Resolución/comprobante enviado por WhatsApp a ${who}. Ticket resuelto.` });
  audit("ENVÍO_WHATSAPP", `Resolución a residente (${who}) — ticket ${rid}`);
  refreshTicketStatusUI(r);
  $("#resSentZone").innerHTML = `
    <div class="wa-box" style="margin-top:10px">
      ${waMeBubble(who, `<div class="wa-media">📎 constancia.pdf 🔒</div><div style="white-space:pre-wrap">${esc(msg)}</div>`)}
    </div>`;
  toast(`✅ Resolución enviada a <strong>${esc(who)}</strong>. Ticket marcado como Resuelto.`);
  render();
}

/* ---------- Piso / Área (desde el edificio) ---------- */
function openFloor(f) {
  const items = state.reports.filter((r) => r.location.floor === f).sort((a, b) => (a.status === "resuelto") - (b.status === "resuelto"));
  const label = f === "PB" ? "Planta Baja" : "Piso " + f;
  openModal(`
    <div class="modal-head">
      <div><div class="modal-title">${label}</div>
      <div class="modal-sub">${items.filter((r) => r.status !== "resuelto").length} pendientes · ${items.length} reportes en total</div></div>
      <button class="modal-x" onclick="closeModal()">✕</button>
    </div>
    ${items.length ? `<div class="list-col" style="margin-top:8px">${items.map(ticketCard).join("")}</div>`
      : `<div class="login-note" style="margin-top:8px">✅ Este piso está sano: sin reportes registrados.</div>`}
  `);
}
function openArea(aid) {
  const a = AREAS.find((x) => x.id === aid);
  const items = state.reports.filter((r) => r.location.areaId === aid).sort((x, y) => (x.status === "resuelto") - (y.status === "resuelto"));
  openModal(`
    <div class="modal-head">
      <div><div class="modal-title">${a.icon} ${a.name}</div>
      <div class="modal-sub">${items.filter((r) => r.status !== "resuelto").length} pendientes · ${items.length} reportes</div></div>
      <button class="modal-x" onclick="closeModal()">✕</button>
    </div>
    ${items.length ? `<div class="list-col" style="margin-top:8px">${items.map(ticketCard).join("")}</div>`
      : `<div class="login-note" style="margin-top:8px">✅ Sin reportes registrados en esta área.</div>`}
  `);
}

/* ============================================================
   MÓDULO RESERVAS (calendario)
   ============================================================ */
function reservaChip(estado) {
  const map = { confirmada: "Confirmada", pendiente: "Pendiente", conflicto: "⚠ Conflicto", cancelada: "Cancelada" };
  return `<span class="chip ${estado}">● ${map[estado]}</span>`;
}
function calNav(d) {
  state.calRef = new Date(state.calRef.getFullYear(), state.calRef.getMonth() + d, 1);
  render();
}
function calendarHtml() {
  const ref = state.calRef;
  const y = ref.getFullYear(), m = ref.getMonth();
  const startDow = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();
  const todayIso = isoLocal(new Date());
  const dows = ["D", "L", "M", "M", "J", "V", "S"];
  let cells = dows.map((d) => `<div class="cal-dow">${d}</div>`).join("");
  for (let i = 0; i < startDow; i++) cells += `<div class="cal-cell empty"></div>`;
  for (let day = 1; day <= days; day++) {
    const iso = isoLocal(new Date(y, m, day));
    const res = state.reservas.filter((r) => r.fecha === iso && r.estado !== "cancelada");
    const dots = res.slice(0, 4).map((r) => { const e = ESPACIOS.find((x) => x.id === r.espacio); return `<span class="cal-dot" style="background:${e.color}"></span>`; }).join("");
    cells += `<div class="cal-cell ${res.length ? "has" : ""} ${iso === todayIso ? "today" : ""}" onclick="openDay('${iso}')">
      <span class="cal-day">${day}</span><div class="cal-dots">${dots}</div></div>`;
  }
  const monthName = ref.toLocaleDateString("es-PA", { month: "long", year: "numeric" });
  return `<div class="card">
    <div class="cal-head">
      <span class="card-title">${monthName}</span>
      <div style="display:flex;gap:6px">
        <button class="icon-btn" onclick="calNav(-1)">‹</button>
        <button class="icon-btn" onclick="calNav(1)">›</button>
      </div>
    </div>
    <div class="cal-grid">${cells}</div>
    <div class="cal-legend">${ESPACIOS.map((e) => `<span><span class="cal-dot" style="background:${e.color}"></span>${e.name}</span>`).join("")}</div>
  </div>`;
}
function reservaRow(r) {
  const e = ESPACIOS.find((x) => x.id === r.espacio);
  return `<button class="list-row" onclick="openReserva('${r.id}')">
    <span class="res-time">${fmtHora(r.ini).replace(" ", "")}<small>${fmtHora(r.fin).replace(" ", "")}</small></span>
    <span class="res-space-ico">${e.icon}</span>
    <span class="lr-main"><div class="lr-title">${esc(e.name)}</div><div class="lr-sub">${esc(r.name)} · ${esc(r.apt)} · ${esc(r.motivo)}</div></span>
    <span class="lr-end">${reservaChip(r.estado)}<div class="lr-sub" style="margin-top:4px">${fmtFecha(r.fecha).split(",")[0]}</div></span>
  </button>`;
}
function viewReservas() {
  const hoyIso = isoLocal(new Date());
  const prox = state.reservas.filter((r) => r.fecha >= hoyIso && r.estado !== "cancelada")
    .sort((a, b) => (a.fecha + a.ini).localeCompare(b.fecha + b.ini));
  const pend = state.reservas.filter((r) => r.estado === "pendiente" || r.estado === "conflicto");
  return `
  <div class="view-head">
    <div><h2>Reservas</h2><div class="crumb">Espacios reservables por el bot de WhatsApp 🤖 · calendario y confirmaciones</div></div>
    ${isAdmin() ? `<button class="btn btn-ghost btn-sm" onclick="openNewReserva()">＋ Reserva manual</button>` : ""}
  </div>
  ${pend.length ? `<div class="login-note" style="margin-bottom:16px;border-color:rgba(245,184,75,.4)">🔔 <strong>${pend.length} reserva(s)</strong> esperan tu confirmación. ${pend.some((r) => r.estado === "conflicto") ? "Hay un <strong>conflicto de horario</strong> por revisar." : ""}</div>` : ""}
  <div class="res-grid">
    ${calendarHtml()}
    <div class="card">
      <span class="card-title">Próximas reservas</span>
      <div class="list-col" style="margin-top:10px">
        ${prox.length ? prox.map(reservaRow).join("") : `<div class="login-note">Sin reservas próximas.</div>`}
      </div>
    </div>
  </div>`;
}
function openDay(iso) {
  const res = state.reservas.filter((r) => r.fecha === iso && r.estado !== "cancelada")
    .sort((a, b) => a.ini.localeCompare(b.ini));
  openModal(`
    <div class="modal-head">
      <div><div class="modal-title" style="text-transform:capitalize">${fmtFecha(iso)}</div>
      <div class="modal-sub">${res.length} reserva(s) en el día</div></div>
      <button class="modal-x" onclick="closeModal()">✕</button>
    </div>
    ${res.length ? `<div class="list-col" style="margin-top:8px">${res.map(reservaRow).join("")}</div>`
      : `<div class="login-note" style="margin-top:8px">📅 Día libre: sin reservas. Los espacios están disponibles.</div>`}
    ${isAdmin() ? `<div class="action-row"><button class="btn btn-ghost btn-sm" onclick="openNewReserva('${iso}')">＋ Reservar un espacio este día</button></div>` : ""}
  `);
}
function openReserva(id) {
  const r = state.reservas.find((x) => x.id === id);
  if (!r) return;
  const e = ESPACIOS.find((x) => x.id === r.espacio);
  if (isAdmin()) audit("ACCESO_RESERVA", `${id} — ${e.name} (${r.name})`);
  const ro = !isAdmin();
  const thread = r.raw
    ? waBubble(r.from || r.name, { type: r.type || "texto", raw: r.raw, time: "solicitud" })
    : `<div class="wa-bubble"><div class="wa-from">${esc(r.name)} (${esc(r.apt)})</div><div>Solicita ${esc(e.name)} · ${esc(fmtFecha(r.fecha))} · ${fmtHora(r.ini)}–${fmtHora(r.fin)}</div><div class="wa-time">por WhatsApp ✓✓</div></div>`;
  openModal(`
    <div class="modal-head">
      <div><div class="modal-title">${e.icon} ${esc(e.name)}</div>
      <div class="modal-sub">${id.toUpperCase()} · ${esc(r.name)} · ${esc(r.apt)}</div></div>
      <button class="modal-x" onclick="closeModal()">✕</button>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap"><span id="resvStatusChip">${reservaChip(r.estado)}</span><span class="chip cat">🕐 ${fmtHora(r.ini)} – ${fmtHora(r.fin)}</span><span class="chip cat">👥 ${e.cap}</span></div>

    <div class="modal-section">
      <span class="card-title">Detalle</span>
      <div class="sec-grid" style="margin-top:8px">
        <div class="sec-item"><div class="si-t">📅 Fecha</div><div class="si-d" style="text-transform:capitalize">${fmtFecha(r.fecha)}</div></div>
        <div class="sec-item"><div class="si-t">📝 Motivo</div><div class="si-d">${esc(r.motivo)}</div></div>
      </div>
      ${r.estado === "conflicto" ? `<div class="login-note" style="margin-top:10px;border-color:rgba(242,109,109,.4)">⚠️ <strong>Conflicto:</strong> este espacio ya tiene otra reserva que se solapa en el horario. Revisa antes de confirmar.</div>` : ""}
    </div>

    <div class="modal-section">
      <span class="card-title">Solicitud recibida</span>
      <div class="wa-box" style="margin-top:6px">${thread}
        <div class="bot-line">🤖 <strong>Bot Vortex</strong> registró → <span class="chip cat">📅 Reserva · ${e.name}</span></div>
      </div>
    </div>

    ${ro ? `<div class="modal-section"><div class="login-note">👁️ Vista de solo lectura (Junta Directiva).</div></div>` : `
    <div class="modal-section">
      <span class="card-title">Confirmación al residente</span>
      <textarea class="gen-msg" id="resvMsg">${reservaMsg(r)}</textarea>
      <div class="action-row" id="resvActionRow">
        ${r.estado !== "cancelada" ? `<button class="btn btn-wa btn-sm" onclick="confirmReserva('${id}')">✅ Confirmar y avisar por WhatsApp</button>` : ""}
        ${r.estado !== "cancelada" ? `<button class="btn btn-danger btn-sm" onclick="cancelReserva('${id}')">✖ Cancelar reserva</button>` : `<button class="btn btn-ghost btn-sm" onclick="closeModal()">Cerrar</button>`}
      </div>
      <div id="resvSentZone"></div>
    </div>`}
  `);
}
function reservaMsg(r) {
  const e = ESPACIOS.find((x) => x.id === r.espacio);
  return `Hola ${r.name.split(" ")[0]} 👋, le confirma la administración de ${PH_NAME}.\n\nSu reserva quedó CONFIRMADA ✅\n📍 ${e.name}\n📅 ${fmtFecha(r.fecha)}\n🕐 ${fmtHora(r.ini)} – ${fmtHora(r.fin)}\n📝 ${r.motivo}\n\nRecuerde las normas de uso del área. ¡Gracias!`;
}
function confirmReserva(id) {
  const r = state.reservas.find((x) => x.id === id);
  const e = ESPACIOS.find((x) => x.id === r.espacio);
  const msg = $("#resvMsg").value;
  r.estado = "confirmada";
  audit("ENVÍO_WHATSAPP", `Confirmación de reserva a ${r.name} — ${id} (${e.name})`);
  addNotif("✅", `Reserva confirmada: ${e.name} — ${fmtFecha(r.fecha)} (${r.name})`);
  const chip = $("#resvStatusChip"); if (chip) chip.innerHTML = reservaChip(r.estado);
  const ar = $("#resvActionRow"); if (ar) ar.innerHTML = `<button class="btn btn-ghost btn-sm" onclick="closeModal()">Cerrar</button>`;
  $("#resvSentZone").innerHTML = `<div class="wa-box" style="margin-top:10px">${waMeBubble(r.name, `<div style="white-space:pre-wrap">${esc(msg)}</div>`)}</div>`;
  toast(`✅ Reserva confirmada y avisada a <strong>${esc(r.name)}</strong>.`);
  render();
}
function cancelReserva(id) {
  const r = state.reservas.find((x) => x.id === id);
  const e = ESPACIOS.find((x) => x.id === r.espacio);
  r.estado = "cancelada";
  audit("RESERVA_CANCELADA", `${id} — ${e.name} (${r.name})`);
  addNotif("✖️", `Reserva cancelada: ${e.name} — ${fmtFecha(r.fecha)} (${r.name})`);
  toast(`Reserva de <strong>${esc(e.name)}</strong> cancelada.`, "warn");
  render();
  closeModal();
}
function openNewReserva(iso) {
  const today = isoLocal(new Date());
  openModal(`
    <div class="modal-head">
      <div><div class="modal-title">Nueva reserva</div><div class="modal-sub">Registro manual · en producción también entra por WhatsApp</div></div>
      <button class="modal-x" onclick="closeModal()">✕</button>
    </div>
    <div class="res-form">
      <div><label>Espacio</label><select id="nrEspacio">${ESPACIOS.map((e) => `<option value="${e.id}">${e.icon} ${e.name} (${e.horario})</option>`).join("")}</select></div>
      <div><label>Residente</label><select id="nrRes">${RESIDENTS.map((r) => `<option value="${r.id}">${r.name} · ${r.apt}</option>`).join("")}</select></div>
      <div><label>Fecha</label><input type="date" id="nrFecha" value="${iso || today}" min="${today}" /></div>
      <div class="two">
        <div><label>Desde</label><input type="time" id="nrIni" value="15:00" /></div>
        <div><label>Hasta</label><input type="time" id="nrFin" value="19:00" /></div>
      </div>
      <div><label>Motivo</label><input type="text" id="nrMotivo" placeholder="Ej. Cumpleaños, reunión…" /></div>
    </div>
    <div class="action-row"><button class="btn btn-primary btn-sm" onclick="createManualReserva()">Crear reserva</button><button class="btn btn-ghost btn-sm" onclick="closeModal()">Cancelar</button></div>
  `);
}
function reservaConflict(res, ignoreId) {
  return state.reservas.some((r) => r.id !== ignoreId && r.espacio === res.espacio && r.fecha === res.fecha
    && r.estado !== "cancelada" && !(res.fin <= r.ini || res.ini >= r.fin));
}
function createManualReserva() {
  const espacio = $("#nrEspacio").value;
  const res = RESIDENTS.find((x) => x.id === $("#nrRes").value);
  const fecha = $("#nrFecha").value, ini = $("#nrIni").value, fin = $("#nrFin").value;
  const motivo = $("#nrMotivo").value.trim() || "Reserva de espacio";
  if (!fecha || !ini || !fin || fin <= ini) { toast("⚠️ Revisa fecha y horario (la salida debe ser posterior a la entrada).", "warn"); return; }
  const cand = { espacio, fecha, ini, fin };
  const conflict = reservaConflict(cand, null);
  const id = "rs-" + state.resSeq++;
  const e = ESPACIOS.find((x) => x.id === espacio);
  state.reservas.push({ id, espacio, apt: res.apt, name: res.name, fecha, ini, fin, motivo, estado: conflict ? "conflicto" : "confirmada", origen: "App" });
  audit("RESERVA_CREADA", `${id} — ${e.name} ${fecha} ${ini}-${fin} (${res.name})`);
  addNotif("📅", `Nueva reserva: ${e.name} — ${fmtFecha(fecha)} (${res.name})`);
  if (conflict) toast(`⚠️ Reserva creada con <strong>conflicto</strong> de horario en ${esc(e.name)}.`, "warn");
  else toast(`📅 Reserva de <strong>${esc(e.name)}</strong> confirmada para ${esc(res.name)}.`);
  render();
  openReserva(id);
}

/* ============================================================
   MÓDULO RESIDENTES
   ============================================================ */
function viewResidentes() {
  return `
  <div class="view-head"><div><h2>Residentes</h2><div class="crumb">Ficha, comprobantes y bitácora · datos sensibles cifrados 🔒</div></div></div>
  <div class="list-col">
    ${RESIDENTS.map((r) => `
      <button class="list-row" onclick="openResident('${r.id}')">
        <span class="avatar">${esc(r.apt.replace("PH-", ""))}</span>
        <span class="lr-main"><div class="lr-title">${esc(r.name)}</div><div class="lr-sub">${esc(r.apt)} · ${esc(r.phone)} 🔒</div></span>
        <span class="lr-end"><span class="chip ${r.estado === "Al día" ? "resuelto" : "nuevo"}">${esc(r.estado)}</span></span>
      </button>`).join("")}
  </div>`;
}

function openResident(id) {
  const r = RESIDENTS.find((x) => x.id === id);
  const recs = RECEIPTS.filter((c) => c.apt === r.apt);
  const reps = state.reports.filter((x) => x.location.apt === r.apt);
  const resvs = state.reservas.filter((x) => x.apt === r.apt && x.estado !== "cancelada");
  const revealed = state.revealed[id];
  audit("ACCESO_FICHA", `Ficha de residente ${r.apt}`);
  openModal(`
    <div class="modal-head">
      <div><div class="modal-title">${esc(r.name)}</div><div class="modal-sub">${esc(r.apt)} · ${PH_NAME}</div></div>
      <button class="modal-x" onclick="closeModal()">✕</button>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap"><span class="chip ${r.estado === "Al día" ? "resuelto" : "nuevo"}">${esc(r.estado)}</span><span class="chip lock">🔒 Datos cifrados AES-256</span></div>

    <div class="modal-section">
      <span class="card-title">Información general</span>
      <div class="sec-grid" style="margin-top:8px">
        <div class="sec-item"><div class="si-t">📞 Teléfono ${revealed ? "" : "🔒"}</div><div class="si-d">${revealed ? "+507 6842-" + (1000 + parseInt(r.id.slice(1)) * 137) % 9000 : esc(r.phone)}</div></div>
        <div class="sec-item"><div class="si-t">🪪 Cédula ${revealed ? "" : "🔒"}</div><div class="si-d">${revealed ? "8-" + (700 + parseInt(r.id.slice(1))) + "-" + (1200 + parseInt(r.id.slice(1)) * 41) : esc(r.cedula)}</div></div>
      </div>
      ${!revealed ? `<div class="action-row"><button class="btn btn-ghost btn-sm" onclick="revealData('${id}')">🔓 Revelar datos cifrados (queda en auditoría)</button></div>` : `<div class="login-note" style="margin-top:10px">🔓 Datos revelados en esta sesión — acceso registrado en la bitácora de auditoría.</div>`}
    </div>

    <div class="modal-section">
      <span class="card-title">Comprobantes de pago</span>
      <div class="list-col" style="margin-top:8px">
        ${recs.length ? recs.map((c) => `
          <div class="list-row"><span class="lr-main"><div class="lr-title">${esc(c.mes)}</div><div class="lr-sub">${esc(c.fecha)} · 🔒 cifrado</div></span>
          <span class="lr-end"><div class="money">B/. ${c.monto.toFixed(2)}</div><span class="chip ${c.estado === "Confirmado" ? "resuelto" : "proceso"}">${esc(c.estado)}</span></span></div>`).join("")
        : `<div class="login-note">Sin comprobantes registrados este período.</div>`}
      </div>
    </div>

    ${resvs.length ? `<div class="modal-section">
      <span class="card-title">Reservas</span>
      <div class="list-col" style="margin-top:8px">${resvs.map(reservaRow).join("")}</div>
    </div>` : ""}

    <div class="modal-section">
      <span class="card-title">Bitácora / historial</span>
      <div class="timeline" style="margin-top:6px">
        ${r.bitacora.map((b) => `<div class="tl-item"><span class="tl-dot"></span><span class="tl-e">${esc(b)}</span></div>`).join("")}
        ${reps.map((x) => `<div class="tl-item"><span class="tl-dot" style="background:var(--amber)"></span><span class="tl-e">Reporte: ${esc(x.title)} — ${x.status === "proceso" ? "en proceso" : x.status}</span></div>`).join("")}
      </div>
    </div>
  `);
}
function revealData(id) {
  state.revealed[id] = true;
  const r = RESIDENTS.find((x) => x.id === id);
  audit("ACCESO_DATO_CIFRADO", `Ficha ${r.apt} — datos personales revelados por ${state.user.name}`);
  toast("🔓 Acceso a datos cifrados registrado en auditoría.", "warn");
  openResident(id);
}

/* ============================================================
   MÓDULO COMPROBANTES
   ============================================================ */
function viewComprobantes() {
  const total = RECEIPTS.reduce((s, c) => s + c.monto, 0);
  return `
  <div class="view-head">
    <div><h2>Comprobantes</h2><div class="crumb">Bitácora contable · recibidos por WhatsApp y clasificados por el bot</div></div>
    <span class="pill"><span class="dot g"></span> B/. ${total.toFixed(2)} este período</span>
  </div>
  <div class="list-col">
    ${RECEIPTS.map((c) => `
      <button class="list-row" onclick="openReceipt('${c.id}')">
        <span class="avatar">🧾</span>
        <span class="lr-main"><div class="lr-title">${esc(c.name)} · ${esc(c.apt)}</div><div class="lr-sub">${esc(c.mes)} · recibido ${esc(c.fecha)} · 🔒 cifrado en reposo</div></span>
        <span class="lr-end"><div class="money">B/. ${c.monto.toFixed(2)}</div><span class="chip ${c.estado === "Confirmado" ? "resuelto" : "proceso"}">${esc(c.estado)}</span></span>
      </button>`).join("")}
  </div>`;
}
function openReceipt(id) {
  const c = RECEIPTS.find((x) => x.id === id);
  const msg = `Hola ${c.name} 👋, le confirma la administración de ${PH_NAME}.\n\nRecibimos y verificamos su comprobante de pago de ${c.mes} por B/. ${c.monto.toFixed(2)}. ✅\n\nAdjuntamos su constancia de paz y salvo del período. ¡Gracias!`;
  openModal(`
    <div class="modal-head">
      <div><div class="modal-title">Comprobante · ${esc(c.apt)}</div><div class="modal-sub">${esc(c.mes)} · ${esc(c.fecha)} · <span class="chip lock">🔒 AES-256</span></div></div>
      <button class="modal-x" onclick="closeModal()">✕</button>
    </div>
    <div class="wa-box" style="margin-top:8px">${waBubble(c.name + " (" + c.apt + ")", { type: "foto", raw: "📷 Comprobante de transferencia — " + c.mes, time: c.fecha })}
      <div class="bot-line">🤖 <strong>Bot Vortex</strong> clasificó → <span class="chip cat">🧾 Comprobantes · B/. ${c.monto.toFixed(2)}</span></div>
    </div>
    ${isAdmin() ? `
    <div class="modal-section">
      <span class="card-title">Enviar constancia al residente</span>
      <textarea class="gen-msg" id="rcMsg">${msg}</textarea>
      <div class="action-row"><button class="btn btn-wa btn-sm" onclick="sendReceipt('${c.id}')">📤 Enviar por WhatsApp</button></div>
      <div id="rcSentZone"></div>
    </div>` : ""}
  `);
}
function sendReceipt(id) {
  const c = RECEIPTS.find((x) => x.id === id);
  c.estado = "Confirmado";
  audit("ENVÍO_WHATSAPP", `Constancia de pago a ${c.name} (${c.apt}) — ${c.mes}`);
  $("#rcSentZone").innerHTML = `<div class="wa-box" style="margin-top:10px">${waMeBubble(c.name, `<div class="wa-media">📎 paz-y-salvo.pdf 🔒</div><div style="white-space:pre-wrap">${esc($("#rcMsg").value)}</div>`)}</div>`;
  toast(`✅ Constancia enviada a <strong>${esc(c.name)}</strong>.`);
  render();
}

/* ============================================================
   MÓDULO COMUNICADOS
   ============================================================ */
function viewComunicados() {
  return `
  <div class="view-head"><div><h2>Comunicados</h2><div class="crumb">Plantillas prefabricadas · envío automático a todos los residentes</div></div></div>
  <div class="tpl-grid">
    ${TEMPLATES.map((t) => `
      <div class="tpl-card">
        <div class="tpl-thumb">${t.icon}</div>
        <span class="chip cat tpl-kind">${t.kind === "PDF" ? "📄 PDF" : "🖼️ Imagen"}</span>
        <div class="tpl-title">${esc(t.title)}</div>
        <div class="tpl-body">${esc(t.body)}</div>
        ${isAdmin() ? `<button class="btn btn-wa btn-sm" onclick="openBroadcast('${t.id}')">📤 Enviar a todos</button>` : ""}
      </div>`).join("")}
  </div>`;
}
function openBroadcast(id) {
  const t = TEMPLATES.find((x) => x.id === id);
  const fecha = new Date(Date.now() + 3 * 864e5).toLocaleDateString("es-PA", { weekday: "long", day: "numeric", month: "long" });
  const body = t.body.replace("{fecha}", fecha);
  openModal(`
    <div class="modal-head">
      <div><div class="modal-title">${t.icon} ${esc(t.title)}</div><div class="modal-sub">Difusión por WhatsApp a los 24 residentes de ${PH_NAME}</div></div>
      <button class="modal-x" onclick="closeModal()">✕</button>
    </div>
    <div class="wa-box" style="margin-top:8px">
      ${waMeBubble("Todos los residentes", `<div class="wa-media">${t.kind === "PDF" ? "📄" : "🖼️"} ${esc(t.title.toLowerCase().replace(/ /g, "-"))}.${t.kind.toLowerCase()}</div><div style="white-space:pre-wrap">📢 <strong>COMUNICADO — ${esc(t.title.toUpperCase())}</strong>\n\n${esc(body)}\n\n— Administración ${PH_NAME}</div>`)}
    </div>
    <div class="action-row">
      <button class="btn btn-wa" onclick="sendBroadcast('${t.id}')">📤 Confirmar envío a 24 residentes</button>
      <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
    </div>
    <div id="bcZone"></div>
  `);
}
function sendBroadcast(id) {
  const t = TEMPLATES.find((x) => x.id === id);
  audit("DIFUSIÓN_WHATSAPP", `Comunicado "${t.title}" enviado a 24 residentes`);
  addNotif("📢", `Comunicado "${t.title}" difundido a 24 residentes`);
  $("#bcZone").innerHTML = `<div class="login-note" style="margin-top:14px">✅ Comunicado en cola de difusión — entregado a <strong>24/24 residentes</strong> por WhatsApp. Registrado en auditoría.</div>`;
  toast(`📢 Comunicado <strong>${esc(t.title)}</strong> enviado a todos los residentes.`);
}

/* ============================================================
   MÓDULO VOTACIONES
   ============================================================ */
function voteBarColor(k) {
  if (k === "Sí" || k === "Excelente") return "var(--green)";
  if (k === "Bueno") return "var(--amber)";
  if (k === "No" || k === "Debe Mejorar") return "var(--red)";
  return "var(--muted2)";
}
function viewVotaciones() {
  return `
  <div class="view-head">
    <div><h2>Votaciones</h2><div class="crumb">Cuestionarios enviados por el bot de WhatsApp · máx. 5 preguntas</div></div>
    ${isAdmin() ? `<button class="btn btn-ghost btn-sm" onclick="openNewVote()">＋ Nueva votación</button>` : ""}
  </div>
  <div class="list-col">
    ${VOTES.map((v) => `
      <div class="card">
        <div class="ticket-top" style="margin-bottom:12px">
          <div><div class="ticket-title" style="font-size:16px">${esc(v.title)}</div>
          <div class="lr-sub">${v.respondidos}/${v.enviados} respuestas (${Math.round((v.respondidos / v.enviados) * 100)}%)</div></div>
          <span class="chip ${v.status === "activa" ? "proceso" : "resuelto"}">${v.status === "activa" ? "● Activa" : "● Cerrada"}</span>
        </div>
        ${v.questions.map((q) => `
          <div class="vote-q"><div class="q">${esc(q.q)}</div>
            ${Object.entries(q.res).map(([k, n]) => {
              const pct = Math.round((n / v.respondidos) * 100);
              return `<div class="bar-row"><span class="bar-label">${k}</span><span class="bar-track"><span class="bar-fill" style="width:${pct}%;background:${voteBarColor(k)}"></span></span><span class="bar-val">${n}</span></div>`;
            }).join("")}
          </div>`).join("")}
      </div>`).join("")}
  </div>`;
}
function openNewVote() {
  openModal(`
    <div class="modal-head">
      <div><div class="modal-title">Nueva votación</div><div class="modal-sub">El bot la enviará por WhatsApp a los 24 residentes</div></div>
      <button class="modal-x" onclick="closeModal()">✕</button>
    </div>
    <div class="wa-box" style="margin-top:8px">
      ${waMeBubble("Todos los residentes", `<div style="white-space:pre-wrap">🗳️ <strong>VOTACIÓN — ${PH_NAME}</strong>\n\n1️⃣ ¿Aprueba instalar cámaras adicionales en el garaje? (Sí / No)\n2️⃣ ¿Aprueba el presupuesto de B/. 3,200? (Sí / No)\n\nResponda con el número de pregunta y su voto. Ej: "1 Sí, 2 No"</div>`)}
    </div>
    <div class="action-row">
      <button class="btn btn-wa" onclick="audit('VOTACIÓN_ENVIADA','Cuestionario de 2 preguntas a 24 residentes');addNotif('🗳️','Votación enviada a 24 residentes');toast('🗳️ Votación enviada por WhatsApp a 24 residentes.');closeModal()">📤 Enviar votación</button>
      <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
    </div>
  `);
}

/* ============================================================
   MÓDULO ÁREAS
   ============================================================ */
function viewAreas() {
  return `
  <div class="view-head"><div><h2>Áreas comunes</h2><div class="crumb">${AREAS.length} áreas registradas · reportes asociados por el bot</div></div></div>
  <div class="cat-grid">
    ${AREAS.map((a) => {
      const items = state.reports.filter((r) => r.location.areaId === a.id);
      const pend = items.filter((r) => r.status !== "resuelto").length;
      return `<button class="ticket" onclick="openArea('${a.id}')">
        <div class="ticket-top"><span style="font-size:22px">${a.icon}</span><span class="chip ${pend > 0 ? "nuevo" : "resuelto"}">${pend > 0 ? pend + " pendientes" : "Sana"}</span></div>
        <div class="ticket-title">${esc(a.name)}</div>
        <div class="ticket-desc">${items.length ? items.length + " reporte(s) en historial" : "Sin reportes registrados"}</div>
      </button>`;
    }).join("")}
  </div>`;
}

/* ============================================================
   MÓDULO AUDITORÍA Y SEGURIDAD
   ============================================================ */
function viewAuditoria() {
  const SEC = [
    { i: "🧑‍⚖️", t: "RBAC por rol", d: "Junta = solo lectura · Admin = control total. Nadie ve más de lo que le corresponde." },
    { i: "🔑", t: "Acceso con clave", d: "Clave de acceso en la demo; en producción se recomienda 2FA + política de expiración. Sesiones expiran a los 30 min." },
    { i: "🔒", t: "Cifrado extremo a extremo", d: "TLS 1.3 en tránsito · AES-256 en reposo · cifrado por campo en datos sensibles." },
    { i: "📜", t: "Bitácora inmutable", d: "Todo acceso, envío y cambio de estado queda registrado. Solo-agregar (append-only)." },
    { i: "🏢", t: "Aislamiento por PH", d: "Mínimo privilegio y separación total de datos entre condominios." },
    { i: "🇪🇺", t: "Protección de datos", d: "Cumplimiento tipo GDPR / Ley 81 de Panamá: consentimiento y derecho a eliminación." },
    { i: "💾", t: "Respaldos cifrados", d: "Backups automáticos diarios cifrados + plan de recuperación ante desastres." },
    { i: "📎", t: "Adjuntos seguros", d: "Fotos, PDFs y notas de voz en almacenamiento cifrado con URLs firmadas y acceso controlado." },
  ];
  return `
  <div class="view-head"><div><h2>Auditoría y Seguridad</h2><div class="crumb">Arquitectura de seguridad + bitácora inmutable de acciones</div></div>
  <span class="pill"><span class="dot g"></span> Sistema íntegro</span></div>

  <div class="sec-grid" style="margin-bottom:22px">
    ${SEC.map((s) => `<div class="sec-item"><div class="si-t">${s.i} ${s.t}</div><div class="si-d">${s.d}</div></div>`).join("")}
  </div>

  <div class="card" style="padding:8px 6px">
    <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 14px 6px">
      <span class="card-title">Bitácora de auditoría</span><span class="chip lock">📜 Inmutable · append-only</span>
    </div>
    ${state.audit.slice(0, 40).map((a) => `
      <div class="audit-row">
        <span class="audit-t">${esc(a.t)}</span>
        <span class="audit-a">${esc(a.action)}</span>
        <span class="audit-d"><strong>${esc(a.user)}</strong> — ${esc(a.detail)}</span>
      </div>`).join("")}
  </div>`;
}

/* ============================================================
   SIMULADOR DE WHATSAPP (FAB)
   ============================================================ */
$("#fabSim").addEventListener("click", simulateIncoming);

function simulateIncoming() {
  const q = INCOMING_QUEUE[state.queueIdx % INCOMING_QUEUE.length];
  state.queueIdx++;
  const time = timeStr();
  const esReserva = q.kind === "reserva";
  openModal(`
    <div class="modal-head">
      <div><div class="modal-title">💬 Nuevo mensaje de WhatsApp</div><div class="modal-sub">Bot Vortex · línea del PH +507 6900-0000</div></div>
      <button class="modal-x" onclick="closeModal()">✕</button>
    </div>
    <div class="wa-box" style="margin-top:8px" id="simThread">
      ${waBubble(q.from, { type: q.type, raw: q.raw, time })}
      <div class="bot-line" id="simBotLine"><span class="spinner"></span> 🤖 Bot Vortex analizando el mensaje…</div>
    </div>
    <div id="simActions"></div>
  `);
  setTimeout(() => (esReserva ? classifyReserva(q, time) : classifyIncoming(q, time)), 1500);
}

function classifyIncoming(q, time) {
  const line = $("#simBotLine");
  if (!line) return;
  const id = "t-" + state.ticketSeq++;
  const report = {
    id, title: q.title, cat: q.cat, status: "nuevo", desc: q.desc, location: q.location,
    source: { from: q.from, channel: "WhatsApp", type: q.type, time, raw: q.raw },
    timeline: [{ t: time, e: `Recibido por WhatsApp y clasificado por el bot → ${CATS[q.cat].group} · ${CATS[q.cat].label} (confianza ${q.conf}%)` }],
  };
  state.reports.unshift(report);
  audit("AUTO_CLASIFICACIÓN", `${id} → ${CATS[q.cat].group} · ${CATS[q.cat].label} (${q.conf}%)`);
  line.innerHTML = `🤖 <strong>Bot Vortex</strong> clasificó → <span class="chip cat">${CATS[q.cat].icon} ${CATS[q.cat].group} · ${CATS[q.cat].label}</span> <span class="chip resuelto">confianza ${q.conf}%</span>`;
  $("#simActions").innerHTML = `
    <div class="login-note" style="margin-top:14px">✅ Ticket <strong>${id.toUpperCase()}</strong> creado automáticamente en <strong>${CATS[q.cat].group} · ${CATS[q.cat].label}</strong>. El Dashboard y el edificio ya se actualizaron.</div>
    <div class="action-row">
      ${isAdmin() ? `<button class="btn btn-primary" onclick="openTicket('${id}')">Ver ticket →</button>` : ""}
      <button class="btn btn-ghost" onclick="closeModal()">Cerrar</button>
    </div>`;
  render();
  toast(`🎫 Nuevo reporte clasificado: <strong>${esc(q.title)}</strong> (${CATS[q.cat].label}).`);
}

function classifyReserva(q, time) {
  const line = $("#simBotLine");
  if (!line) return;
  const rv = q.reserva;
  const e = ESPACIOS.find((x) => x.id === rv.espacio);
  const fecha = isoLocal(dateFromOffset(rv.off));
  const id = "rs-" + state.resSeq++;
  const conflict = reservaConflict({ espacio: rv.espacio, fecha, ini: rv.ini, fin: rv.fin }, null);
  state.reservas.push({
    id, espacio: rv.espacio, apt: rv.apt, name: rv.name, fecha, ini: rv.ini, fin: rv.fin,
    motivo: rv.motivo, estado: conflict ? "conflicto" : "pendiente", origen: "WhatsApp",
    from: q.from, raw: q.raw, type: q.type,
  });
  addNotif("📅", `Nueva reserva por WhatsApp: ${e.name} — ${fmtFecha(fecha)} (${rv.name})`);
  audit("RESERVA_CREADA", `${id} — ${e.name} ${fecha} ${rv.ini}-${rv.fin} (${rv.name}) [${conflict ? "conflicto" : "pendiente"}]`);
  line.innerHTML = `🤖 <strong>Bot Vortex</strong> detectó una <span class="chip cat">📅 Solicitud de reserva</span> → <span class="chip cat">${e.icon} ${e.name}</span> <span class="chip resuelto">confianza ${q.conf}%</span>`;
  const note = conflict
    ? `<div class="login-note" style="margin-top:14px;border-color:rgba(242,109,109,.4)">⚠️ <strong>Conflicto de horario:</strong> ${e.name} ya tiene una reserva que se solapa el ${fmtFecha(fecha)} (${fmtHora(rv.ini)}–${fmtHora(rv.fin)}). Marcada como <strong>conflicto</strong> para revisión del administrador.</div>`
    : `<div class="login-note" style="margin-top:14px">✅ Reserva <strong>${id.toUpperCase()}</strong> registrada como <strong>pendiente</strong> en el calendario · ${fmtFecha(fecha)} · ${fmtHora(rv.ini)}–${fmtHora(rv.fin)}. Notificación creada.</div>`;
  $("#simActions").innerHTML = note + `
    <div class="action-row">
      ${isAdmin() ? `<button class="btn btn-primary" onclick="openReserva('${id}')">Ver reserva →</button>` : ""}
      <button class="btn btn-ghost" onclick="closeModal()">Cerrar</button>
    </div>`;
  render();
  toast(`📅 Nueva reserva ${conflict ? "con conflicto" : "pendiente"}: <strong>${esc(e.name)}</strong> (${esc(rv.name)}).`, conflict ? "warn" : "");
}

/* ============================================================
   MODALES
   ============================================================ */
function openModal(html) {
  $("#modalRoot").innerHTML = `<div class="modal-backdrop" onclick="if(event.target===this)closeModal()"><div class="modal">${html}</div></div>`;
  document.body.style.overflow = "hidden";
}
function closeModal() {
  $("#modalRoot").innerHTML = "";
  document.body.style.overflow = "";
}
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

/* ---------- Init ---------- */
initReservas();
applyTheme(themeByTime());
updateNotifBadge();
renderRoleCards();
