const http = require("http");
const webpush = require("web-push");
const cron = require("node-cron");

const {
  PB_URL,
  PB_ADMIN_EMAIL,
  PB_ADMIN_PASSWORD,
  VAPID_PUBLIC,
  VAPID_PRIVATE,
  VAPID_SUBJECT,
} = process.env;

if (!PB_URL || !VAPID_PUBLIC || !VAPID_PRIVATE || !PB_ADMIN_EMAIL || !PB_ADMIN_PASSWORD) {
  console.error("[push] missing required env vars");
  process.exit(1);
}

webpush.setVapidDetails(
  VAPID_SUBJECT || "mailto:admin@blindsaint.local",
  VAPID_PUBLIC,
  VAPID_PRIVATE
);

const TZ = "Europe/Madrid";
const STATUS_DONE = "done";

// ─── PocketBase access (native fetch) ─────────────────────────────────────────

let token = null;

async function auth() {
  const r = await fetch(`${PB_URL}/api/collections/_superusers/auth-with-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identity: PB_ADMIN_EMAIL, password: PB_ADMIN_PASSWORD }),
  });
  if (!r.ok) throw new Error(`auth failed ${r.status}`);
  const data = await r.json();
  token = data.token;
}

async function pbList(collection, filter) {
  const items = [];
  let page = 1;
  while (true) {
    const url = new URL(`${PB_URL}/api/collections/${collection}/records`);
    url.searchParams.set("perPage", "200");
    url.searchParams.set("page", String(page));
    if (filter) url.searchParams.set("filter", filter);
    const r = await fetch(url, { headers: { Authorization: token } });
    if (!r.ok) throw new Error(`list ${collection} -> ${r.status}`);
    const data = await r.json();
    items.push(...data.items);
    if (page >= (data.totalPages || 1)) break;
    page++;
  }
  return items;
}

async function pbDelete(collection, id) {
  try {
    await fetch(`${PB_URL}/api/collections/${collection}/records/${id}`, {
      method: "DELETE",
      headers: { Authorization: token },
    });
  } catch (e) {
    console.error("[push] delete error", e.message);
  }
}

// ─── Time helpers (container TZ = Europe/Madrid) ───────────────────────────────

function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function nowMinutes() {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

function hhmmToMinutes(hhmm) {
  const [h, m] = String(hhmm).split(":").map(Number);
  if (Number.isNaN(h)) return null;
  return h * 60 + (m || 0);
}

// ─── Sending ───────────────────────────────────────────────────────────────────

async function sendToUser(userId, payloadObj) {
  const subs = await pbList("push_subscriptions", `user="${userId}"`);
  let sent = 0;
  for (const rec of subs) {
    const subscription = {
      endpoint: rec.endpoint,
      keys: { p256dh: rec.p256dh, auth: rec.auth },
    };
    try {
      await webpush.sendNotification(subscription, JSON.stringify(payloadObj));
      sent++;
    } catch (err) {
      const code = err && err.statusCode;
      if (code === 404 || code === 410) {
        await pbDelete("push_subscriptions", rec.id);
        console.log(`[push] removed expired subscription ${rec.id}`);
      } else {
        console.error(`[push] send error (${code})`, (err && err.body) || (err && err.message));
      }
    }
  }
  return sent;
}

// ─── Daily digest ──────────────────────────────────────────────────────────────

async function runDailyDigest() {
  await auth();
  const today = todayStr();

  const [users, tasks, events] = await Promise.all([
    pbList("users"),
    pbList("tasks"),
    pbList("internal_events"),
  ]);

  const todaysEvents = events.filter((e) => String(e.date).slice(0, 10) === today);

  let totalSent = 0;
  for (const u of users) {
    const myTasks = tasks.filter((t) => t.assignee === u.id && t.status !== STATUS_DONE);
    const myBlocked = myTasks.filter((t) => t.status === "blocked");
    const myCritical = myTasks.filter((t) => t.priority === "critical");
    const myEvents = todaysEvents.filter(
      (e) => Array.isArray(e.attendees) && e.attendees.includes(u.id)
    );

    if (myTasks.length === 0 && myEvents.length === 0) continue;

    const parts = [];
    if (myTasks.length > 0) {
      let t = `${myTasks.length} tarea${myTasks.length === 1 ? "" : "s"} pendiente${myTasks.length === 1 ? "" : "s"}`;
      const flags = [];
      if (myBlocked.length) flags.push(`${myBlocked.length} bloqueada${myBlocked.length === 1 ? "" : "s"}`);
      if (myCritical.length) flags.push(`${myCritical.length} crítica${myCritical.length === 1 ? "" : "s"}`);
      if (flags.length) t += ` (${flags.join(", ")})`;
      parts.push(t);
    }
    if (myEvents.length > 0) {
      parts.push(`${myEvents.length} evento${myEvents.length === 1 ? "" : "s"} hoy`);
    }

    const payload = {
      title: "BLINDSAINT OS — Hoy",
      body: parts.join(" · "),
      url: "/dashboard",
      tag: "daily-digest",
    };
    totalSent += await sendToUser(u.id, payload);
  }
  console.log(`[digest] ${today} — notifications sent: ${totalSent}`);
  return totalSent;
}

// ─── Event reminders (~30 min before start) ────────────────────────────────────

let remindedDay = "";
let remindedSet = new Set();

async function runEventReminders() {
  await auth();
  const today = todayStr();
  if (today !== remindedDay) {
    remindedDay = today;
    remindedSet = new Set();
  }

  const events = await pbList("internal_events");
  const now = nowMinutes();
  const WINDOW = 35;

  let totalSent = 0;
  for (const e of events) {
    if (String(e.date).slice(0, 10) !== today) continue;
    if (!e.startTime) continue;
    if (remindedSet.has(e.id)) continue;

    const startM = hhmmToMinutes(e.startTime);
    if (startM === null) continue;
    const diff = startM - now;
    if (diff < 0 || diff > WINDOW) continue;

    const where = e.location ? ` · ${String(e.location).split(",").join(" / ")}` : "";
    const payload = {
      title: `⏰ ${e.title}`,
      body: `Empieza a las ${e.startTime}${where}`,
      url: "/calendar",
      tag: `event-${e.id}`,
    };

    const attendees = Array.isArray(e.attendees) ? e.attendees : [];
    for (const uid of attendees) {
      totalSent += await sendToUser(uid, payload);
    }
    remindedSet.add(e.id);
  }
  if (totalSent) console.log(`[reminders] ${today} — sent: ${totalSent}`);
  return totalSent;
}

// ─── Schedules ─────────────────────────────────────────────────────────────────

cron.schedule("0 9 * * *", () => runDailyDigest().catch((e) => console.error("[digest]", e.message)), { timezone: TZ });
cron.schedule("*/15 * * * *", () => runEventReminders().catch((e) => console.error("[reminders]", e.message)), { timezone: TZ });

// ─── Control server (localhost only — for manual triggering via docker exec) ───

const server = http.createServer(async (req, res) => {
  try {
    if (req.url === "/health") {
      res.writeHead(200);
      return res.end("ok");
    }
    if (req.url === "/run/digest") {
      const n = await runDailyDigest();
      res.writeHead(200);
      return res.end(`digest sent: ${n}\n`);
    }
    if (req.url === "/run/reminders") {
      const n = await runEventReminders();
      res.writeHead(200);
      return res.end(`reminders sent: ${n}\n`);
    }
    if (req.url === "/run/test") {
      await auth();
      const subs = await pbList("push_subscriptions");
      let sent = 0;
      for (const rec of subs) {
        const subscription = {
          endpoint: rec.endpoint,
          keys: { p256dh: rec.p256dh, auth: rec.auth },
        };
        try {
          await webpush.sendNotification(
            subscription,
            JSON.stringify({
              title: "BLINDSAINT OS",
              body: "✅ Notificaciones push activas. Esto es una prueba.",
              url: "/dashboard",
              tag: "test",
            })
          );
          sent++;
        } catch (err) {
          const code = err && err.statusCode;
          if (code === 404 || code === 410) await pbDelete("push_subscriptions", rec.id);
        }
      }
      res.writeHead(200);
      return res.end(`test sent: ${sent}\n`);
    }
    res.writeHead(404);
    res.end("not found\n");
  } catch (e) {
    res.writeHead(500);
    res.end(`${(e && e.message) || e}\n`);
  }
});
server.listen(8099, "127.0.0.1", () => console.log("[push] control server on 127.0.0.1:8099"));

// ─── Boot ──────────────────────────────────────────────────────────────────────

auth()
  .then(() => console.log(`[push] ready — PB=${PB_URL}, digest 09:00, reminders */15m (${TZ})`))
  .catch((e) => console.error("[push] initial auth failed:", e.message));
