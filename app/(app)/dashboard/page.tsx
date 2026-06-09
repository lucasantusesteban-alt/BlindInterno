"use client";

import { useState } from "react";
import { useAppStore } from "@/store";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Progress } from "@/components/ui/Progress";
import { TopBar } from "@/components/layout/TopBar";
import { cn } from "@/lib/utils";
import { Plus, AlertTriangle, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { UserRole } from "@/lib/types";
import { TaskFormModal } from "@/components/TaskFormModal";
import { EventFormModal } from "@/components/EventFormModal";

type RoleFocus = {
  title: string;
  objective: string;
  priorities: string[];
  watch: string[];
};

const ROLE_FOCUS: Record<UserRole, RoleFocus> = {
  admin: {
    title: "LÍDER / DIRECCIÓN CREATIVA / DISEÑO",
    objective: "Llevar la dirección del proyecto, los drops y el diseño de las prendas.",
    priorities: [
      "Conceptualizar el próximo drop (mood, narrativa, prendas)",
      "Diseñar las prendas y validar mockups",
      "Marcar la dirección creativa de cada pieza visual",
      "Desbloquear al equipo y validar entregables clave",
    ],
    watch: [
      "Decisiones creativas pendientes que bloquean al equipo",
      "Coherencia de marca entre piezas",
      "Drops sin concepto cerrado a tiempo",
    ],
  },
  operations: {
    title: "CTO + CFO",
    objective: "Sostener la base técnica y financiera del proyecto.",
    priorities: [
      "Infraestructura: Shopify, web, integraciones, dominios",
      "Pasarela de pagos y checkout sin fricción",
      "Control de gastos, ingresos y márgenes por drop",
      "Reporting financiero y proyecciones",
    ],
    watch: [
      "Fallos críticos en pagos, web o stack técnico",
      "Burn rate vs runway",
      "Costes inesperados (proveedores, envíos, devoluciones)",
      "Facturas, impuestos y deadlines fiscales",
    ],
  },
  marketing: {
    title: "DIRECCIÓN RRSS / MARKETING / MÉTRICAS",
    objective: "Estrategia de redes, contenido orientado a venta y lectura de datos.",
    priorities: [
      "Estrategia de contenido por plataforma (TikTok, IG, etc.)",
      "Campañas de pago: Meta Ads, TikTok Ads",
      "Activación de influencers y partnerships",
      "Análisis semanal de métricas y ajustes",
    ],
    watch: [
      "Caída en alcance, CTR o conversión",
      "Campañas sin presupuesto o sin creatividad lista",
      "KPIs por debajo del objetivo de la semana",
      "Ventana de oportunidad de tendencias sin aprovechar",
    ],
  },
  content: {
    title: "COMMUNITY MANAGER / CONTENIDO",
    objective: "Gestionar la comunidad y la producción de contenido día a día.",
    priorities: [
      "Responder DMs, comentarios y menciones",
      "Mantener el calendario social al día",
      "Producir reels, stories y piezas de contenido",
      "Construir comunidad y tono de marca en cada interacción",
    ],
    watch: [
      "DMs o comentarios sin responder + 24h",
      "Días del calendario social sin contenido programado",
      "UGC sin repostear",
      "Crisis o feedback negativo de la comunidad",
    ],
  },
  creative: {
    title: "CREATIVE & DESIGN",
    objective: "Output visual de la marca.",
    priorities: [
      "Mockups y diseño de prendas",
      "Sesiones de foto y retoque",
      "Templates y assets gráficos",
    ],
    watch: [
      "Assets en estado draft sin aprobar",
      "Deadlines de diseño próximos",
    ],
  },
};

export default function DashboardPage() {
  const { currentUser, tasks, users } = useAppStore();
  const [activityFilter, setActivityFilter] = useState<string>(currentUser?.id ?? "all");
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const now = new Date();

  if (!currentUser) return null;

  const focus = ROLE_FOCUS[currentUser.role];

  const myTasks = tasks.filter((t) => t.assigneeId === currentUser.id);
  const myPending = myTasks.filter((t) => t.status !== "done");
  const myInProgress = myTasks.filter((t) => t.status === "in_progress");
  const myBlocked = myTasks.filter((t) => t.status === "blocked");
  const myCritical = myTasks.filter((t) => t.priority === "critical" && t.status !== "done");

  const allBlocked = tasks.filter((t) => t.status === "blocked");
  const allCritical = tasks.filter((t) => t.priority === "critical" && t.status !== "done");

  const filteredActivity = (
    activityFilter === "all"
      ? tasks
      : tasks.filter((t) => t.assigneeId === activityFilter)
  )
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 10)
    .map((t) => ({
      id: t.id,
      text: t.title,
      status: t.status,
      time: t.updatedAt,
      userId: t.assigneeId,
    }));

  const greetingHour = now.getHours();
  const greeting =
    greetingHour < 12 ? "GOOD MORNING" : greetingHour < 18 ? "WHAT'S THE MOVE" : "STILL BUILDING";

  return (
    <div className="bg-[#050505] min-h-full">
      <TopBar title="DASHBOARD" />

      <div className="px-4 md:px-6 py-5 space-y-6 max-w-[1400px]">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <div
              className="text-[#8c8c8c] text-[10px] tracking-[0.2em] mb-1"
              style={{ fontFamily: "var(--font-space-mono)" }}
            >
              {greeting},
            </div>
            <h1
              className="text-[#f0f0ee] leading-none mb-2"
              style={{
                fontFamily: "var(--font-anton)",
                fontSize: "clamp(2.5rem, 7vw, 4.5rem)",
                letterSpacing: "0.02em",
                textTransform: "uppercase",
                lineHeight: 0.9,
              }}
            >
              {currentUser.name}
            </h1>
            <div
              className="text-[#8c8c8c] text-[10px] tracking-[0.15em]"
              style={{ fontFamily: "var(--font-space-mono)" }}
            >
              {now.toLocaleDateString("es-ES", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }).toUpperCase()}
            </div>
          </div>

          {/* Role badge — replaces drop card */}
          <div className="bg-[#111111] border border-[#2a2a2a] p-4 min-w-[220px]">
            <div
              className="text-[#8c8c8c] text-[9px] tracking-[0.2em] mb-1"
              style={{ fontFamily: "var(--font-space-mono)" }}
            >
              TU ROL
            </div>
            <div
              className="text-[#f0f0ee] text-lg mb-1"
              style={{ fontFamily: "var(--font-anton)", letterSpacing: "0.05em" }}
            >
              {focus.title}
            </div>
            <div
              className="text-[#c8102e] text-[9px] tracking-[0.15em]"
              style={{ fontFamily: "var(--font-space-mono)" }}
            >
              {myPending.length} TAREAS ACTIVAS
            </div>
          </div>
        </div>

        {/* Red accent line */}
        <div className="h-px bg-[#c8102e]" />

        {/* Alerts — only for current user's blocked tasks */}
        {myBlocked.length > 0 && (
          <div className="space-y-2">
            {myBlocked.map((t) => (
              <Link href="/tasks" key={t.id}>
                <div className="flex items-center gap-3 bg-[#3d0510] border border-[#c8102e] px-4 py-3 hover:bg-[#4d0616] transition-colors">
                  <AlertTriangle size={14} className="text-[#c8102e] flex-shrink-0" />
                  <span
                    className="text-[#f0f0ee] text-[10px] tracking-[0.1em] flex-1"
                    style={{ fontFamily: "var(--font-space-mono)" }}
                  >
                    BLOQUEADO: {t.title}
                  </span>
                  <ArrowRight size={12} className="text-[#c8102e]" />
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Stats grid — 3 cards (sin contenido semanal, sin drop) */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "MIS TAREAS", value: myPending.length, sub: `${myInProgress.length} en progreso`, color: "#f0f0ee" },
            { label: "BLOQUEADAS", value: myBlocked.length, sub: "requieren atención", color: myBlocked.length > 0 ? "#c8102e" : "#8c8c8c" },
            { label: "CRÍTICAS", value: myCritical.length, sub: "prioridad máxima", color: myCritical.length > 0 ? "#c8102e" : "#8c8c8c" },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#111111] border border-[#2a2a2a] p-4">
              <div
                className="text-[#8c8c8c] text-[9px] tracking-[0.15em] mb-2"
                style={{ fontFamily: "var(--font-space-mono)" }}
              >
                {stat.label}
              </div>
              <div
                className="text-4xl leading-none mb-1"
                style={{
                  fontFamily: "var(--font-anton)",
                  color: stat.color,
                  letterSpacing: "0.02em",
                }}
              >
                {stat.value}
              </div>
              <div
                className="text-[#2a2a2a] text-[9px]"
                style={{ fontFamily: "var(--font-space-mono)" }}
              >
                {stat.sub}
              </div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* Role focus (left, 2/3) */}
          <div className="md:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-[#c8102e]" />
                  <span
                    className="text-[#f0f0ee] text-[11px] tracking-[0.2em]"
                    style={{ fontFamily: "var(--font-space-mono)" }}
                  >
                    YOUR FOCUS — {focus.title}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-[#f0f0ee] text-sm font-medium mb-4">{focus.objective}</p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div
                      className="text-[#c8102e] text-[9px] tracking-[0.2em] mb-2"
                      style={{ fontFamily: "var(--font-space-mono)" }}
                    >
                      PRIORIDADES
                    </div>
                    <ul className="space-y-1.5">
                      {focus.priorities.map((p, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[#c8102e] text-xs mt-0.5 flex-shrink-0">›</span>
                          <span className="text-[#8c8c8c] text-xs leading-relaxed">{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div
                      className="text-[#8c8c8c] text-[9px] tracking-[0.2em] mb-2"
                      style={{ fontFamily: "var(--font-space-mono)" }}
                    >
                      VIGILAR
                    </div>
                    <ul className="space-y-1.5">
                      {focus.watch.map((r, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-orange-500 text-xs mt-0.5 flex-shrink-0">⚠</span>
                          <span className="text-[#8c8c8c] text-xs leading-relaxed">{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* My active tasks list */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <span
                    className="text-[#f0f0ee] text-[11px] tracking-[0.2em]"
                    style={{ fontFamily: "var(--font-space-mono)" }}
                  >
                    MIS TAREAS ACTIVAS
                  </span>
                </div>
                <Link href="/tasks" className="text-[#8c8c8c] hover:text-[#c8102e] transition-colors">
                  <ArrowRight size={12} />
                </Link>
              </CardHeader>
              <div className="divide-y divide-[#1a1a1a]">
                {myPending.length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <span className="text-[#2a2a2a] text-[10px]" style={{ fontFamily: "var(--font-space-mono)" }}>
                      SIN TAREAS PENDIENTES
                    </span>
                  </div>
                ) : (
                  myPending.slice(0, 6).map((task) => (
                    <Link href="/tasks" key={task.id}>
                      <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#0a0a0a] transition-colors">
                        <span className={cn(
                          "w-1 h-4 flex-shrink-0",
                          task.status === "blocked" ? "bg-[#c8102e]" :
                          task.priority === "critical" ? "bg-[#c8102e]" :
                          task.priority === "high" ? "bg-orange-600" :
                          "bg-[#2a2a2a]"
                        )} />
                        <span className="text-[#f0f0ee] text-xs flex-1 truncate">{task.title}</span>
                        <span className="text-[#8c8c8c] text-[9px]" style={{ fontFamily: "var(--font-space-mono)" }}>
                          {task.status.toUpperCase().replace("_", " ")}
                        </span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Team status */}
            <Card>
              <CardHeader>
                <span
                  className="text-[#f0f0ee] text-[11px] tracking-[0.2em]"
                  style={{ fontFamily: "var(--font-space-mono)" }}
                >
                  CREW
                </span>
                <Link href="/team" className="text-[#8c8c8c] hover:text-[#c8102e] transition-colors">
                  <ArrowRight size={12} />
                </Link>
              </CardHeader>
              <CardContent className="space-y-3">
                {users.map((user) => {
                  const userTasks = tasks.filter((t) => t.assigneeId === user.id);
                  const blocked = userTasks.filter((t) => t.status === "blocked").length;
                  const inProg = userTasks.filter((t) => t.status === "in_progress").length;
                  const total = userTasks.filter((t) => t.status !== "done").length;

                  return (
                    <div key={user.id} className="flex items-center gap-3">
                      <Avatar user={user} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[#f0f0ee] text-xs">{user.name}</span>
                          <div className="flex items-center gap-1">
                            {blocked > 0 && (
                              <Badge variant="red" size="xs">{blocked} BLK</Badge>
                            )}
                            <span
                              className="text-[#8c8c8c] text-[9px]"
                              style={{ fontFamily: "var(--font-space-mono)" }}
                            >
                              {total}T
                            </span>
                          </div>
                        </div>
                        <Progress value={inProg} max={Math.max(total, 1)} size="xs" />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Recent activity — per-person filter */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Clock size={12} className="text-[#c8102e]" />
                  <span
                    className="text-[#f0f0ee] text-[11px] tracking-[0.2em]"
                    style={{ fontFamily: "var(--font-space-mono)" }}
                  >
                    ACTIVIDAD
                  </span>
                </div>
              </CardHeader>
              {/* Person filter chips */}
              <div className="px-4 py-2 border-b border-[#1a1a1a] flex flex-wrap gap-1">
                <button
                  onClick={() => setActivityFilter("all")}
                  className={cn(
                    "px-2 py-1 text-[9px] tracking-[0.1em] border transition-colors",
                    activityFilter === "all"
                      ? "bg-[#c8102e] border-[#c8102e] text-[#f0f0ee]"
                      : "border-[#2a2a2a] text-[#8c8c8c] hover:text-[#f0f0ee]"
                  )}
                  style={{ fontFamily: "var(--font-space-mono)" }}
                >
                  ALL
                </button>
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => setActivityFilter(u.id)}
                    className={cn(
                      "px-2 py-1 text-[9px] tracking-[0.1em] border transition-colors",
                      activityFilter === u.id
                        ? "bg-[#c8102e] border-[#c8102e] text-[#f0f0ee]"
                        : "border-[#2a2a2a] text-[#8c8c8c] hover:text-[#f0f0ee]"
                    )}
                    style={{ fontFamily: "var(--font-space-mono)" }}
                  >
                    {u.initials}
                  </button>
                ))}
              </div>
              <div className="divide-y divide-[#1a1a1a] max-h-[320px] overflow-y-auto">
                {filteredActivity.length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <span className="text-[#2a2a2a] text-[9px]" style={{ fontFamily: "var(--font-space-mono)" }}>
                      SIN ACTIVIDAD
                    </span>
                  </div>
                ) : (
                  filteredActivity.map((item) => {
                    const user = users.find((u) => u.id === item.userId);
                    return (
                      <div key={item.id} className="px-4 py-2.5 flex items-start gap-2">
                        {user && <Avatar user={user} size="xs" className="mt-0.5" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-[#8c8c8c] text-[10px] truncate leading-relaxed">{item.text}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span
                              className="text-[#2a2a2a] text-[9px]"
                              style={{ fontFamily: "var(--font-space-mono)" }}
                            >
                              {new Date(item.time).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}
                            </span>
                            <span
                              className="text-[#2a2a2a] text-[8px] tracking-[0.1em]"
                              style={{ fontFamily: "var(--font-space-mono)" }}
                            >
                              {item.status.toUpperCase().replace("_", " ")}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setTaskModalOpen(true)}
            className="flex items-center gap-2 bg-[#c8102e] hover:bg-[#a00d24] text-[#f0f0ee] px-4 py-2.5 text-xs tracking-[0.15em] transition-colors"
            style={{ fontFamily: "var(--font-space-mono)" }}
          >
            <Plus size={12} />
            NEW TASK
          </button>
          <button
            onClick={() => setEventModalOpen(true)}
            className="flex items-center gap-2 border border-[#2a2a2a] hover:border-[#8c8c8c] text-[#8c8c8c] hover:text-[#f0f0ee] px-4 py-2.5 text-xs tracking-[0.15em] transition-colors"
            style={{ fontFamily: "var(--font-space-mono)" }}
          >
            <Plus size={12} />
            NEW EVENT
          </button>
        </div>
      </div>

      <TaskFormModal open={taskModalOpen} onClose={() => setTaskModalOpen(false)} />
      <EventFormModal open={eventModalOpen} onClose={() => setEventModalOpen(false)} />
    </div>
  );
}
