/* ============================================================
   VORTEX PH — Datos de ejemplo (100% ficticios, en memoria)
   PH demo: "PH Torre Aurora", Ciudad de Panamá
   ============================================================ */

const PH_NAME = "PH Torre Aurora";
const FLOORS = 12; // + Planta Baja (PB)

/* ---------- Usuarios / Roles ---------- */
const USERS = {
  admin: { id: "u-admin", name: "Laura Méndez", role: "admin", roleLabel: "Administradora", initials: "LM" },
  junta: { id: "u-junta", name: "Junta Directiva", role: "junta", roleLabel: "Junta Directiva · Solo lectura", initials: "JD" },
};

/* ---------- Categorías ---------- */
const CATS = {
  tarea:        { id: "tarea",        label: "Tareas",              group: "Tareas",         icon: "📋", color: "var(--amber)" },
  aseo:         { id: "aseo",         label: "Aseo",                group: "Mantenimiento",  icon: "🧹", color: "var(--green)" },
  plomeria:     { id: "plomeria",     label: "Plomería",            group: "Mantenimiento",  icon: "🔧", color: "var(--blue)" },
  electricidad: { id: "electricidad", label: "Electricidad",        group: "Mantenimiento",  icon: "💡", color: "var(--amber)" },
  lostfound:    { id: "lostfound",    label: "Lost & Found",        group: "Mantenimiento",  icon: "🎒", color: "var(--muted)" },
  mejoras:      { id: "mejoras",      label: "Mejoras",             group: "Mantenimiento",  icon: "🛠️", color: "var(--green)" },
  paqueteria:   { id: "paqueteria",   label: "Paquetería",          group: "Seguridad",      icon: "📦", color: "var(--orange)" },
  seguridad:    { id: "seguridad",    label: "Seguridad",           group: "Seguridad",      icon: "🛡️", color: "var(--red)" },
};

/* ---------- Proveedores ---------- */
const PROVIDERS = [
  { id: "pr1", name: "HidroTec Panamá",     cat: "plomeria",     rating: 4.8, phone: "+507 6xxx-1122" },
  { id: "pr2", name: "ElectroSol S.A.",     cat: "electricidad", rating: 4.6, phone: "+507 6xxx-3344" },
  { id: "pr3", name: "Ascensores Andina",   cat: "mejoras",      rating: 4.7, phone: "+507 6xxx-5566" },
  { id: "pr4", name: "CleanPro Servicios",  cat: "aseo",         rating: 4.9, phone: "+507 6xxx-7788" },
  { id: "pr5", name: "PinturasMax",         cat: "mejoras",      rating: 4.5, phone: "+507 6xxx-9900" },
  { id: "pr6", name: "SecureWatch",         cat: "seguridad",    rating: 4.4, phone: "+507 6xxx-2211" },
  { id: "pr7", name: "FumiControl",         cat: "aseo",         rating: 4.6, phone: "+507 6xxx-4433" },
];

/* ---------- Residentes (datos ficticios) ---------- */
/* ---------- Tipos de apartamento y cuota mensual ---------- */
/* El monto lo carga/edita la Administración desde la app (⚙️ en Comprobantes). */
const APT_TYPES = [
  { id: "estandar",  label: "Apartamento estándar", cuotaMensual: 185.00 },
  { id: "penthouse", label: "Penthouse",             cuotaMensual: 210.00 },
];

const RESIDENTS = [
  { id: "r1",  apt: "PH-1A",  name: "Marta Ríos",      phone: "+507 6***-**41", cedula: "8-***-**12", estado: "Al día",    tipoId: "estandar",  bitacora: ["2026-06-02 · Comprobante junio recibido", "2026-05-14 · Solicitud de llave adicional"] },
  { id: "r2",  apt: "PH-2B",  name: "Samuel Ortiz",    phone: "+507 6***-**87", cedula: "8-***-**93", estado: "Al día",    tipoId: "estandar",  bitacora: ["2026-06-05 · Comprobante junio recibido"] },
  { id: "r3",  apt: "PH-3B",  name: "Carlos Peña",     phone: "+507 6***-**23", cedula: "8-***-**77", estado: "Moroso 1m", tipoId: "estandar",  bitacora: ["2026-06-18 · Reporte de ruido (resuelto)", "2026-05-30 · Recordatorio de pago enviado"] },
  { id: "r4",  apt: "PH-5A",  name: "Lucía Fernández", phone: "+507 6***-**55", cedula: "8-***-**31", estado: "Al día",    tipoId: "estandar",  bitacora: ["2026-06-10 · Reservó Área Social (20 jun)"] },
  { id: "r5",  apt: "PH-6A",  name: "Paola Vega",      phone: "+507 6***-**19", cedula: "8-***-**02", estado: "Al día",    tipoId: "estandar",  bitacora: ["2026-06-01 · Comprobante junio recibido"] },
  { id: "r6",  apt: "PH-8B",  name: "Ana Morales",     phone: "+507 6***-**64", cedula: "8-***-**48", estado: "Al día",    tipoId: "estandar",  bitacora: ["2026-07-03 · Reportó filtración en baño", "2026-06-03 · Comprobante junio recibido"] },
  { id: "r7",  apt: "PH-9A",  name: "Jorge Sandoval",  phone: "+507 6***-**72", cedula: "8-***-**15", estado: "Moroso 2m", tipoId: "estandar",  bitacora: ["2026-06-25 · Aviso de morosidad enviado"] },
  { id: "r8",  apt: "PH-10B", name: "Elena Castro",    phone: "+507 6***-**38", cedula: "8-***-**60", estado: "Al día",    tipoId: "estandar",  bitacora: ["2026-06-28 · Reportó baja presión de agua (resuelto)"] },
  { id: "r9",  apt: "PH-11A", name: "Karina López",    phone: "+507 6***-**90", cedula: "8-***-**26", estado: "Al día",    tipoId: "estandar",  bitacora: ["2026-06-04 · Comprobante junio recibido"] },
  { id: "r10", apt: "PH-12A", name: "Roberto Díaz",    phone: "+507 6***-**07", cedula: "8-***-**84", estado: "Al día",    tipoId: "penthouse", bitacora: ["2026-07-04 · Paquete recibido en garita"] },
];

/* ---------- Comprobantes de pago ---------- */
/* estado: "Por verificar" | "Confirmado" | "Abono parcial" | "Rechazado" */
/* El monto esperado no se guarda aquí — se calcula del tipo de apartamento (APT_TYPES vía RESIDENTS.tipoId). */
const RECEIPTS = [
  { id: "c1", apt: "PH-1A",  name: "Marta Ríos",      mes: "Julio 2026", montoPagado: 185.00, fecha: "2026-07-02", estado: "Confirmado",     motivoRechazo: "", bitacora: [] },
  { id: "c2", apt: "PH-8B",  name: "Ana Morales",     mes: "Julio 2026", montoPagado: 185.00, fecha: "2026-07-03", estado: "Confirmado",     motivoRechazo: "", bitacora: [] },
  { id: "c3", apt: "PH-12A", name: "Roberto Díaz",    mes: "Julio 2026", montoPagado: 210.00, fecha: "2026-07-04", estado: "Por verificar",  motivoRechazo: "", bitacora: [] },
  { id: "c4", apt: "PH-5A",  name: "Lucía Fernández", mes: "Julio 2026", montoPagado: 185.00, fecha: "2026-07-01", estado: "Confirmado",     motivoRechazo: "", bitacora: [] },
  { id: "c5", apt: "PH-2B",  name: "Samuel Ortiz",    mes: "Junio 2026", montoPagado: 185.00, fecha: "2026-06-05", estado: "Confirmado",     motivoRechazo: "", bitacora: [] },
  { id: "c6", apt: "PH-11A", name: "Karina López",    mes: "Junio 2026", montoPagado: 185.00, fecha: "2026-06-04", estado: "Confirmado",     motivoRechazo: "", bitacora: [] },
  { id: "c7", apt: "PH-10B", name: "Elena Castro",    mes: "Junio 2026", montoPagado: 185.00, fecha: "2026-06-06", estado: "Confirmado",     motivoRechazo: "", bitacora: [] },
];

/* ---------- Áreas comunes ---------- */
const AREAS = [
  { id: "lobby",  name: "Lobby Principal", icon: "🏛️", floor: "PB" },
  { id: "garita", name: "Garita",          icon: "👮", floor: "EXT" },
  { id: "garaje", name: "Acceso Garaje",   icon: "🚗", floor: "EXT" },
  { id: "e1", name: "E1", icon: "🅿️", floor: "EXT" },
  { id: "e2", name: "E2", icon: "🅿️", floor: "EXT" },
  { id: "e3", name: "E3", icon: "🅿️", floor: "EXT" },
  { id: "e4", name: "E4", icon: "🅿️", floor: "EXT" },
  { id: "e5", name: "E5", icon: "🅿️", floor: "EXT" },
  { id: "e6", name: "E6", icon: "🅿️", floor: "EXT" },
  { id: "social", name: "Área Social",     icon: "🎉", floor: "PB" },
];

/* ---------- Espacios reservables ---------- */
const ESPACIOS = [
  { id: "social", name: "Área Social",        icon: "🎉", color: "var(--green)",  cap: "40 personas", horario: "9:00 AM – 10:00 PM" },
  { id: "bbq",    name: "Terraza BBQ",         icon: "🔥", color: "var(--orange)", cap: "15 personas", horario: "10:00 AM – 9:00 PM" },
  { id: "gym",    name: "Gimnasio",            icon: "🏋️", color: "var(--blue)",   cap: "8 personas",  horario: "5:00 AM – 10:00 PM" },
  { id: "pool",   name: "Piscina",             icon: "🏊", color: "var(--amber)",  cap: "20 personas", horario: "8:00 AM – 8:00 PM" },
  { id: "sala",   name: "Salón de Reuniones",  icon: "📊", color: "var(--muted)",  cap: "12 personas", horario: "8:00 AM – 9:00 PM" },
];

/* ---------- Reservas iniciales (off = días desde hoy, para que siempre caigan en el calendario actual) ---------- */
const SEED_RESERVAS = [
  { id: "rs1", espacio: "gym",    apt: "PH-6A",  name: "Paola Vega",      off: 0,  ini: "07:00", fin: "08:00", motivo: "Entrenador personal", estado: "confirmada" },
  { id: "rs2", espacio: "social", apt: "PH-5A",  name: "Lucía Fernández", off: 1,  ini: "15:00", fin: "20:00", motivo: "Cumpleaños infantil", estado: "confirmada" },
  { id: "rs3", espacio: "bbq",    apt: "PH-2B",  name: "Samuel Ortiz",    off: 2,  ini: "12:00", fin: "16:00", motivo: "Almuerzo familiar",   estado: "confirmada" },
  { id: "rs4", espacio: "sala",   apt: "PH-1A",  name: "Marta Ríos",      off: 4,  ini: "19:00", fin: "21:00", motivo: "Reunión de comité",   estado: "confirmada" },
  { id: "rs5", espacio: "social", apt: "PH-11A", name: "Karina López",    off: 8,  ini: "18:00", fin: "22:00", motivo: "Aniversario",         estado: "pendiente" },
  { id: "rs6", espacio: "pool",   apt: "PH-8B",  name: "Ana Morales",     off: 8,  ini: "10:00", fin: "13:00", motivo: "Reunión con amigos",  estado: "confirmada" },
  { id: "rs7", espacio: "bbq",    apt: "PH-12A", name: "Roberto Díaz",    off: 15, ini: "17:00", fin: "21:00", motivo: "Parrillada",          estado: "confirmada" },
];

/* ---------- Notificaciones iniciales ---------- */
const SEED_NOTIFS = [
  { icon: "📅", txt: "Reserva confirmada: Área Social — mañana 3:00 PM (Lucía Fernández)", t: "Hoy 9:00 AM", unread: true },
  { icon: "⏰", txt: "Recordatorio: Gimnasio reservado hoy 7:00–8:00 AM (Paola Vega)", t: "Hoy 6:30 AM", unread: true },
];

/* ---------- Reportes iniciales ----------
   location: { kind:'apt'|'area'|'general', apt?, areaId?, floor? }  floor: 1..12 | 'PB' | 'EXT' | null
*/
const SEED_REPORTS = [
  {
    id: "t-1001", title: "Filtración en baño", cat: "plomeria", status: "nuevo",
    desc: "Filtración de agua en el techo del baño principal, aparenta venir del apto de arriba.",
    location: { kind: "apt", apt: "PH-8B", floor: 8 },
    source: { from: "Ana Morales (PH-8B)", channel: "WhatsApp", type: "texto", time: "Hoy 7:42 AM", raw: "Buenas, soy Ana del 8B. Tengo una filtración en el techo del baño, está goteando bastante 😰" },
    timeline: [{ t: "Hoy 7:42 AM", e: "Recibido por WhatsApp y clasificado por el bot → Mantenimiento · Plomería (confianza 97%)" }],
  },
  {
    id: "t-1002", title: "Bombillo quemado pasillo P5", cat: "electricidad", status: "proceso",
    desc: "Bombillo del pasillo del piso 5 quemado, zona junto al ascensor.",
    location: { kind: "apt", apt: "Pasillo P5", floor: 5 },
    source: { from: "Conserje Miguel", channel: "WhatsApp", type: "foto", time: "Ayer 6:15 PM", raw: "📷 Foto adjunta — bombillo quemado pasillo piso 5" },
    provider: "pr2",
    timeline: [
      { t: "Ayer 6:15 PM", e: "Foto recibida por WhatsApp · clasificado → Electricidad (94%)" },
      { t: "Hoy 8:05 AM", e: "Solicitud enviada a ElectroSol S.A. por WhatsApp" },
    ],
  },
  {
    id: "t-1003", title: "Derrame de café en Lobby", cat: "aseo", status: "nuevo",
    desc: "Se derramó café en el piso del lobby principal, requiere limpieza inmediata.",
    location: { kind: "area", areaId: "lobby", floor: "PB" },
    source: { from: "Seguridad Turno AM", channel: "WhatsApp", type: "texto", time: "Hoy 9:10 AM", raw: "Se derramó café en el lobby, cerca de los buzones. Necesita limpieza." },
    timeline: [{ t: "Hoy 9:10 AM", e: "Clasificado por el bot → Mantenimiento · Aseo (96%)" }],
  },
  {
    id: "t-1004", title: "Paquete para PH-12A", cat: "paqueteria", status: "nuevo",
    desc: "Paquete de mensajería recibido en garita para el apartamento 12A.",
    location: { kind: "apt", apt: "PH-12A", floor: 12 },
    source: { from: "Garita — Luis", channel: "WhatsApp", type: "voz", time: "Hoy 10:22 AM", raw: "🎤 Nota de voz (0:12) — “Llegó un paquete de Amazon para el doce A”" },
    timeline: [{ t: "Hoy 10:22 AM", e: "Nota de voz transcrita y clasificada → Seguridad · Paquetería (98%)" }],
  },
  {
    id: "t-1005", title: "Mochila olvidada en Área Social", cat: "lostfound", status: "proceso",
    desc: "Mochila azul encontrada en el Área Social después del evento del sábado.",
    location: { kind: "area", areaId: "social", floor: "PB" },
    source: { from: "Conserje Miguel", channel: "WhatsApp", type: "foto", time: "Sáb 8:40 PM", raw: "📷 Foto adjunta — mochila azul olvidada en el área social" },
    timeline: [{ t: "Sáb 8:40 PM", e: "Clasificado → Lost & Found (92%). Guardada en conserjería." }],
  },
  {
    id: "t-1006", title: "Mejorar iluminación del garaje", cat: "mejoras", status: "nuevo",
    desc: "Propuesta: cambiar luminarias del acceso al garaje por LED de mayor potencia.",
    location: { kind: "area", areaId: "garaje", floor: "EXT" },
    source: { from: "Roberto Díaz (PH-12A)", channel: "WhatsApp", type: "texto", time: "Mar 4:30 PM", raw: "Propongo mejorar la iluminación de la entrada del garaje, de noche se ve muy oscuro." },
    timeline: [{ t: "Mar 4:30 PM", e: "Clasificado → Mejoras / Renovaciones (91%)" }],
  },
  {
    id: "t-1007", title: "Cotizar pintura de pasillos", cat: "tarea", status: "proceso",
    desc: "Tarea de administración: solicitar 3 cotizaciones para pintura de pasillos P1–P12.",
    location: { kind: "general", floor: null },
    source: { from: "Laura Méndez (Admin)", channel: "WhatsApp", type: "texto", time: "Lun 9:00 AM", raw: "Recordar cotizar la pintura de los pasillos, mínimo 3 cotizaciones." },
    timeline: [
      { t: "Lun 9:00 AM", e: "Auto-tarea creada vía bot → Tareas (99%)" },
      { t: "Mié 2:00 PM", e: "Cotización 1 recibida — PinturasMax" },
    ],
  },
  {
    id: "t-1008", title: "Renovar contrato de ascensores", cat: "tarea", status: "nuevo",
    desc: "El contrato de mantenimiento de ascensores vence el 31 de julio. Negociar renovación.",
    location: { kind: "general", floor: null },
    source: { from: "Laura Méndez (Admin)", channel: "WhatsApp", type: "texto", time: "Hoy 8:00 AM", raw: "Tarea: el contrato de ascensores vence fin de mes, agendar reunión con Ascensores Andina." },
    timeline: [{ t: "Hoy 8:00 AM", e: "Auto-tarea creada vía bot → Tareas (99%)" }],
  },
  {
    id: "t-1009", title: "Ruido excesivo PH-3B (nocturno)", cat: "seguridad", status: "resuelto",
    desc: "Queja por música a alto volumen después de las 11 PM. Se conversó con el residente.",
    location: { kind: "apt", apt: "PH-3B", floor: 3 },
    source: { from: "Karina López (PH-11A)", channel: "WhatsApp", type: "voz", time: "18 jun 11:30 PM", raw: "🎤 Nota de voz (0:31) — queja por ruido en el 3B" },
    timeline: [
      { t: "18 jun 11:30 PM", e: "Clasificado → Seguridad (95%)" },
      { t: "19 jun 10:00 AM", e: "Resolución enviada al residente. Caso cerrado." },
    ],
  },
  {
    id: "t-1010", title: "Baja presión de agua P10", cat: "plomeria", status: "resuelto",
    desc: "Baja presión de agua en el piso 10. Se calibró la bomba de presión.",
    location: { kind: "apt", apt: "PH-10B", floor: 10 },
    source: { from: "Elena Castro (PH-10B)", channel: "WhatsApp", type: "texto", time: "28 jun 7:00 PM", raw: "El agua sale con muy poca presión desde la tarde." },
    provider: "pr1",
    timeline: [
      { t: "28 jun 7:00 PM", e: "Clasificado → Plomería (97%)" },
      { t: "29 jun 9:00 AM", e: "HidroTec Panamá calibró la bomba. Resuelto." },
    ],
  },
  {
    id: "t-1011", title: "Luz intermitente en Garita", cat: "electricidad", status: "nuevo",
    desc: "La luminaria de la garita parpadea de forma intermitente durante la noche.",
    location: { kind: "area", areaId: "garita", floor: "EXT" },
    source: { from: "Garita — Luis", channel: "WhatsApp", type: "texto", time: "Hoy 6:50 AM", raw: "La luz de la garita está parpadeando toda la noche, revisar por favor." },
    timeline: [{ t: "Hoy 6:50 AM", e: "Clasificado → Electricidad (95%)" }],
  },
  {
    id: "t-1012", title: "Limpieza profunda E2", cat: "aseo", status: "resuelto",
    desc: "Limpieza profunda del área E2 completada por CleanPro.",
    location: { kind: "area", areaId: "e2", floor: "EXT" },
    source: { from: "Laura Méndez (Admin)", channel: "WhatsApp", type: "texto", time: "20 jun 8:00 AM", raw: "Programar limpieza profunda del E2 esta semana." },
    provider: "pr4",
    timeline: [
      { t: "20 jun 8:00 AM", e: "Auto-tarea → Aseo (93%)" },
      { t: "22 jun 3:00 PM", e: "CleanPro completó la limpieza. Resuelto." },
    ],
  },
];

/* ---------- Comunicados (plantillas prefabricadas) ---------- */
const TEMPLATES = [
  { id: "tp1", title: "Corte de agua programado",   kind: "PDF", icon: "🚱", body: "Se informa corte de agua el {fecha} de 9:00 AM a 1:00 PM por mantenimiento del tanque de reserva." },
  { id: "tp2", title: "Jornada de fumigación",      kind: "IMG", icon: "🐜", body: "Fumigación general de áreas comunes el {fecha}. Mantenga cerradas puertas y ventanas de 8–11 AM." },
  { id: "tp3", title: "Recordatorio de pago",       kind: "PDF", icon: "💳", body: "Recordatorio: la cuota de mantenimiento vence el día 10. Envíe su comprobante por este medio." },
  { id: "tp4", title: "Convocatoria a Asamblea",    kind: "PDF", icon: "🏛️", body: "Asamblea ordinaria de copropietarios el {fecha} 7:00 PM en el Área Social. Quórum requerido." },
  { id: "tp5", title: "Mantenimiento de ascensor",  kind: "IMG", icon: "🛗", body: "El ascensor estará fuera de servicio el {fecha} de 8 AM a 12 M por mantenimiento preventivo." },
  { id: "tp6", title: "Normas del Área Social",     kind: "IMG", icon: "🎉", body: "Recordatorio de normas de uso del Área Social: horario hasta 10 PM, reservar con 48h de antelación." },
];

/* ---------- Votaciones ---------- */
const VOTES = [
  {
    id: "v1", title: "Renovación del Área Social", status: "activa", enviados: 24, respondidos: 17,
    questions: [
      { q: "¿Aprueba invertir en la renovación del Área Social?", type: "sino", res: { "Sí": 12, "No": 4, "Nulo": 1 } },
      { q: "¿Aprueba el presupuesto de B/. 8,500?", type: "sino", res: { "Sí": 10, "No": 6, "Nulo": 1 } },
      { q: "¿Aprueba realizar la obra en agosto?", type: "sino", res: { "Sí": 14, "No": 2, "Nulo": 1 } },
    ],
  },
  {
    id: "v2", title: "Evaluación de la administración (Q2)", status: "cerrada", enviados: 24, respondidos: 20,
    questions: [
      { q: "Atención a reportes de mantenimiento", type: "cal", res: { "Excelente": 11, "Bueno": 7, "Debe Mejorar": 2 } },
      { q: "Comunicación de la administración", type: "cal", res: { "Excelente": 13, "Bueno": 5, "Debe Mejorar": 2 } },
      { q: "Limpieza de áreas comunes", type: "cal", res: { "Excelente": 9, "Bueno": 8, "Debe Mejorar": 3 } },
    ],
  },
];

/* ---------- Cola de mensajes WhatsApp simulados (botón FAB) ---------- */
const INCOMING_QUEUE = [
  { from: "Paola Vega (PH-6A)", type: "texto", raw: "Hola, en el 6A el lavamanos está tapado y se rebosa el agua 🙏", cat: "plomeria", title: "Lavamanos tapado", desc: "Lavamanos del baño de visitas tapado, el agua se rebosa.", location: { kind: "apt", apt: "PH-6A", floor: 6 }, conf: 97 },
  { from: "Elena Castro (PH-10B)", type: "texto", raw: "Buenas, quiero reservar el Área Social para dentro de 3 semanas, un sábado de 4pm a 9pm, es un baby shower 🎈", kind: "reserva", reserva: { espacio: "social", off: 22, ini: "16:00", fin: "21:00", motivo: "Baby shower", apt: "PH-10B", name: "Elena Castro" }, conf: 96 },
  { from: "Conserje Miguel", type: "foto", raw: "📷 Foto adjunta — tomacorriente suelto en pasillo del piso 7", cat: "electricidad", title: "Tomacorriente suelto P7", desc: "Tomacorriente del pasillo del piso 7 suelto y con cables expuestos.", location: { kind: "apt", apt: "Pasillo P7", floor: 7 }, conf: 93 },
  { from: "Garita — Luis", type: "voz", raw: "🎤 Nota de voz (0:09) — “Paquete de Panafoto para el nueve A”", cat: "paqueteria", title: "Paquete para PH-9A", desc: "Paquete recibido en garita para el apartamento 9A.", location: { kind: "apt", apt: "PH-9A", floor: 9 }, conf: 98 },
  { from: "Laura Méndez (Admin)", type: "texto", raw: "Tarea: llamar al banco para actualizar la firma de la cuenta del PH", cat: "tarea", title: "Actualizar firma bancaria", desc: "Llamar al banco y agendar actualización de firmas de la cuenta del PH.", location: { kind: "general", floor: null }, conf: 99 },
  { from: "Lucía Fernández (PH-5A)", type: "foto", raw: "📷 Foto adjunta — unas llaves olvidadas en el gimnasio del Área Social", cat: "lostfound", title: "Llaves olvidadas en Área Social", desc: "Juego de llaves con llavero rojo encontrado en el Área Social.", location: { kind: "area", areaId: "social", floor: "PB" }, conf: 90 },
  { from: "Seguridad Turno PM", type: "texto", raw: "Un carro desconocido lleva 2 días estacionado en visitantes, placa AB1234", cat: "seguridad", title: "Vehículo desconocido en visitantes", desc: "Vehículo placa AB1234 estacionado 2 días en zona de visitantes sin registro.", location: { kind: "area", areaId: "garaje", floor: "EXT" }, conf: 94 },
  { from: "Marta Ríos (PH-1A)", type: "voz", raw: "🎤 Nota de voz (0:18) — “El pasillo del piso uno huele a basura, creo que dejaron bolsas afuera del shut”", cat: "aseo", title: "Bolsas fuera del shut P1", desc: "Bolsas de basura dejadas fuera del shut en el piso 1, mal olor en el pasillo.", location: { kind: "apt", apt: "Pasillo P1", floor: 1 }, conf: 95 },
  { from: "Jorge Sandoval (PH-9A)", type: "texto", raw: "Sería bueno poner un espejo en la curva del sótano del garaje, es peligrosa", cat: "mejoras", title: "Espejo convexo en garaje", desc: "Propuesta: instalar espejo convexo en la curva ciega del sótano del garaje.", location: { kind: "area", areaId: "garaje", floor: "EXT" }, conf: 92 },
  { from: "Jorge Sandoval (PH-9A)", type: "voz", raw: "🎤 Nota de voz (0:14) — “Quiero apartar la terraza BBQ dentro de dos semanas y media, en la tarde, para una parrillada”", kind: "reserva", reserva: { espacio: "bbq", off: 16, ini: "15:00", fin: "19:00", motivo: "Parrillada familiar", apt: "PH-9A", name: "Jorge Sandoval" }, conf: 93 },
  { from: "Carlos Peña (PH-3B)", type: "texto", raw: "Quiero reservar el gimnasio hoy de 7 a 8 am para entrenar 🏋️", kind: "reserva", reserva: { espacio: "gym", off: 0, ini: "07:00", fin: "08:00", motivo: "Rutina matutina", apt: "PH-3B", name: "Carlos Peña" }, conf: 90 },
];

/* ---------- Serie para gráfica (reportes últimos 30 días) ---------- */
const CHART_RECIBIDOS = [3, 5, 2, 6, 4, 7, 5, 8, 6, 4];
const CHART_RESUELTOS = [2, 4, 2, 5, 3, 6, 4, 6, 5, 3];

/* ---------- Bitácora de auditoría inicial ---------- */
const SEED_AUDIT = [
  { t: "2026-07-04 08:05", user: "Laura Méndez", action: "ENVÍO_WHATSAPP", detail: "Solicitud a ElectroSol S.A. — ticket t-1002" },
  { t: "2026-07-04 07:42", user: "Bot Vortex", action: "AUTO_CLASIFICACIÓN", detail: "t-1001 → Mantenimiento · Plomería (97%)" },
  { t: "2026-07-03 18:20", user: "Laura Méndez", action: "CAMBIO_ESTADO", detail: "t-1010 → Resuelto" },
  { t: "2026-07-03 09:12", user: "Junta Directiva", action: "ACCESO_DASHBOARD", detail: "Sesión de solo lectura iniciada" },
  { t: "2026-07-02 16:44", user: "Laura Méndez", action: "ACCESO_DATO_CIFRADO", detail: "Ficha PH-3B — teléfono revelado (motivo: gestión de cobro)" },
];
