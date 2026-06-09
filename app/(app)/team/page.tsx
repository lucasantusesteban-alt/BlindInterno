"use client";

import { useAppStore } from "@/store";
import { TopBar } from "@/components/layout/TopBar";
import { cn } from "@/lib/utils";
import type { User, UserRole } from "@/lib/types";
import { Mail } from "lucide-react";

type RoleDetails = {
  title: string;
  responsibilities: string[];
};

const ROLE_DETAILS: Record<UserRole, RoleDetails> = {
  admin: {
    title: "LÍDER / DIRECCIÓN CREATIVA / DISEÑO DE PRENDAS",
    responsibilities: [
      "Liderazgo y dirección del proyecto",
      "Dirección creativa de cada drop",
      "Diseño de prendas y validación de mockups",
      "Narrativa, tono y coherencia de marca",
    ],
  },
  operations: {
    title: "CTO + CFO",
    responsibilities: [
      "Stack técnico: Shopify, web, integraciones, dominios",
      "Pasarela de pagos, checkout y procesos backend",
      "Finanzas: cashflow, costes, márgenes, reporting",
      "Proveedores, facturación, impuestos y compliance",
    ],
  },
  marketing: {
    title: "DIRECCIÓN RRSS / MARKETING / MÉTRICAS",
    responsibilities: [
      "Estrategia de redes y contenido por plataforma",
      "Campañas de pago (Meta Ads, TikTok Ads)",
      "Activación de influencers y partnerships",
      "Análisis de métricas y optimización",
    ],
  },
  content: {
    title: "COMMUNITY MANAGER / CONTENIDO",
    responsibilities: [
      "Gestión diaria de la comunidad (DMs, comentarios, menciones)",
      "Producción de reels, stories y piezas de contenido",
      "Calendario social al día",
      "Construcción del tono y la voz de marca en cada interacción",
    ],
  },
  creative: {
    title: "CREATIVE & DESIGN",
    responsibilities: [
      "Diseño de prenda y mockups",
      "Identidad visual y assets gráficos",
      "Fotografía editorial y dirección de arte",
    ],
  },
};

function MemberCard({ user }: { user: User }) {
  const details = ROLE_DETAILS[user.role];
  const stripeColor = user.color === "#f0f0ee" ? "#2a2a2a" : user.color;

  return (
    <div className="bg-[#111111] border border-[#2a2a2a] overflow-hidden">
      {/* Color stripe */}
      <div className="h-1" style={{ background: stripeColor }} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-center gap-4 mb-5">
          <span
            className="w-14 h-14 flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{
              background: stripeColor,
              color: "#f0f0ee",
              fontFamily: "var(--font-space-mono)",
            }}
          >
            {user.initials}
          </span>
          <div className="min-w-0">
            <h2
              className="text-[#f0f0ee] leading-none"
              style={{ fontFamily: "var(--font-anton)", fontSize: "1.75rem", letterSpacing: "0.04em" }}
            >
              {user.name.toUpperCase()}
            </h2>
            <div className="text-[#c8102e] text-[10px] tracking-[0.15em] mt-1"
              style={{ fontFamily: "var(--font-space-mono)" }}>
              {details.title}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Mail size={10} className="text-[#2a2a2a]" />
              <span className="text-[#8c8c8c] text-[10px]"
                style={{ fontFamily: "var(--font-space-mono)" }}>
                {user.email}
              </span>
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full inline-block ml-1",
                  user.status === "online" ? "bg-green-400" : user.status === "busy" ? "bg-yellow-400" : "bg-[#2a2a2a]"
                )}
              />
            </div>
          </div>
        </div>

        {/* Responsibilities */}
        <div>
          <div className="text-[#8c8c8c] text-[9px] tracking-[0.2em] mb-3"
            style={{ fontFamily: "var(--font-space-mono)" }}>
            // RESPONSABILIDADES
          </div>
          <ul className="space-y-2">
            {details.responsibilities.map((r, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-[#c8102e] text-xs mt-0.5 flex-shrink-0">›</span>
                <span className="text-[#f0f0ee] text-xs leading-relaxed">{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function TeamPage() {
  const { users } = useAppStore();

  return (
    <div className="bg-[#050505] min-h-full">
      <TopBar title="CREW" />

      <div className="px-4 md:px-6 py-5">
        <div className="flex items-end justify-between mb-2">
          <h1
            className="text-[#f0f0ee] leading-none"
            style={{ fontFamily: "var(--font-anton)", fontSize: "clamp(2rem, 6vw, 3.5rem)", letterSpacing: "0.02em" }}
          >
            THE CREW
          </h1>
          <span className="text-[#8c8c8c] text-[10px] tracking-[0.2em]"
            style={{ fontFamily: "var(--font-space-mono)" }}>
            {users.length} MEMBERS
          </span>
        </div>
        <p className="text-[#8c8c8c] text-xs mb-6 max-w-xl">
          Quién es quién y de qué se encarga cada uno. Sin tareas, sin métricas — solo el rol.
        </p>

        {/* Team cards */}
        <div className="grid md:grid-cols-2 gap-4">
          {users.map((user) => <MemberCard key={user.id} user={user} />)}
        </div>
      </div>
    </div>
  );
}
