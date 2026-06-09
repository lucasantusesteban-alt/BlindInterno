"use client";

import { useState } from "react";
import { useAppStore } from "@/store";
import { TopBar } from "@/components/layout/TopBar";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Progress } from "@/components/ui/Progress";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import {
  getCampaignStatusColor, getDropChecklistProgress, formatDate, daysUntil, cn,
} from "@/lib/utils";
import type { Campaign } from "@/lib/types";
import { Zap, CheckCircle, Circle, AlertTriangle, X, ExternalLink } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  concept: "CONCEPT", preparing: "PREPARING", teasing: "TEASING",
  live: "LIVE", sold_out: "SOLD OUT", closed: "CLOSED", archived: "ARCHIVED",
};

const CHECKLIST_LABELS: Record<string, string> = {
  productDefined: "Producto definido",
  mockupsReady: "Mockups listos",
  photosReady: "Fotos listas",
  pageReady: "Página preparada",
  stockValidated: "Stock validado",
  priceValidated: "Precio validado",
  copiesReady: "Copies preparados",
  calendarClosed: "Calendario cerrado",
  emailReady: "Email preparado",
  storiesReady: "Stories preparadas",
  reelsReady: "Reels preparados",
  influencersActivated: "Influencers activados",
  paymentTested: "Pasarela revisada",
  testPurchaseDone: "Test de compra",
  finalPublicationValidated: "Publicación final",
};

function DropCard({ campaign, onClick }: { campaign: Campaign; onClick: () => void }) {
  const { users } = useAppStore();
  const lead = users.find((u) => u.id === campaign.leadId);
  const days = daysUntil(campaign.launchDate);
  const progress = getDropChecklistProgress(campaign.checklist as unknown as Record<string, boolean>);
  const isActive = campaign.status === "live" || campaign.status === "teasing" || campaign.status === "preparing";

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-[#111111] border border-[#2a2a2a] p-5 cursor-pointer hover:border-[#3a3a3a] transition-colors relative overflow-hidden",
        campaign.status === "live" && "border-[#c8102e]",
      )}
    >
      {/* Color accent top */}
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: campaign.coverColor || "#2a2a2a" }} />

      {/* Status badge */}
      <div className="flex items-start justify-between mb-4">
        <span
          className={cn("text-[9px] px-2 py-1", getCampaignStatusColor(campaign.status))}
          style={{ fontFamily: "var(--font-space-mono)" }}
        >
          {STATUS_LABELS[campaign.status]}
        </span>
        {campaign.status === "live" && (
          <Zap size={14} className="text-[#c8102e] animate-pulse" />
        )}
      </div>

      {/* Name */}
      <h2
        className="text-[#f0f0ee] mb-1 leading-none"
        style={{
          fontFamily: "var(--font-anton)",
          fontSize: "clamp(1.25rem, 3vw, 1.75rem)",
          letterSpacing: "0.02em",
          textTransform: "uppercase",
        }}
      >
        {campaign.name}
      </h2>
      <p className="text-[#8c8c8c] text-xs mb-4 line-clamp-2">{campaign.description}</p>

      {/* Key stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: "STOCK", value: campaign.stock ?? "—" },
          { label: "PRECIO", value: campaign.price ? `${campaign.price}€` : "—" },
          { label: isActive ? "DÍAS" : "VENTAS", value: isActive ? (days > 0 ? days : "HOY") : (campaign.realSales ?? 0) },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <div
              className="text-[#f0f0ee] text-xl"
              style={{ fontFamily: "var(--font-anton)", letterSpacing: "0.05em" }}
            >
              {s.value}
            </div>
            <div
              className="text-[#2a2a2a] text-[8px] tracking-[0.15em]"
              style={{ fontFamily: "var(--font-space-mono)" }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Checklist progress */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[#8c8c8c] text-[9px]" style={{ fontFamily: "var(--font-space-mono)" }}>
            LAUNCH READY
          </span>
          <span className="text-[#8c8c8c] text-[9px]" style={{ fontFamily: "var(--font-space-mono)" }}>
            {progress}%
          </span>
        </div>
        <Progress value={progress} color={progress > 80 ? "green" : progress > 50 ? "white" : "red"} />
      </div>

      {/* Lead */}
      {lead && (
        <div className="flex items-center gap-2">
          <Avatar user={lead} size="xs" />
          <span className="text-[#8c8c8c] text-[10px]">{lead.name}</span>
        </div>
      )}
    </div>
  );
}

function DropDetail({ campaign, onClose }: { campaign: Campaign; onClose: () => void }) {
  const { users, tasks, contentItems } = useAppStore();
  const progress = getDropChecklistProgress(campaign.checklist as unknown as Record<string, boolean>);
  const days = daysUntil(campaign.launchDate);
  const dropTasks = tasks.filter((t) => campaign.taskIds.includes(t.id));
  const dropContent = contentItems.filter((c) => campaign.contentIds.includes(c.id));

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-[#0a0a0a] border border-[#2a2a2a] w-full md:max-w-2xl md:max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#2a2a2a] sticky top-0 bg-[#0a0a0a]">
          <div>
            <span className={cn("text-[9px] px-2 py-0.5 mr-2", getCampaignStatusColor(campaign.status))}
              style={{ fontFamily: "var(--font-space-mono)" }}>
              {STATUS_LABELS[campaign.status]}
            </span>
            <h2
              className="text-[#f0f0ee] mt-2"
              style={{ fontFamily: "var(--font-anton)", fontSize: "1.5rem", letterSpacing: "0.05em" }}
            >
              {campaign.name}
            </h2>
          </div>
          <button onClick={onClose} className="text-[#8c8c8c] hover:text-[#f0f0ee] p-1">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Countdown + key stats */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "DÍAS", value: days > 0 ? days : days === 0 ? "HOY" : "PASADO", color: days <= 3 && days >= 0 ? "#c8102e" : "#f0f0ee" },
              { label: "STOCK", value: campaign.stock ?? "—", color: "#f0f0ee" },
              { label: "PRECIO", value: campaign.price ? `${campaign.price}€` : "—", color: "#f0f0ee" },
              { label: "VENTAS", value: campaign.realSales ?? 0, color: "#f0f0ee" },
            ].map((s) => (
              <div key={s.label} className="bg-[#111111] border border-[#2a2a2a] p-3 text-center">
                <div
                  className="text-2xl"
                  style={{ fontFamily: "var(--font-anton)", color: s.color, letterSpacing: "0.05em" }}
                >
                  {s.value}
                </div>
                <div className="text-[#2a2a2a] text-[8px] mt-1" style={{ fontFamily: "var(--font-space-mono)" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            {[
              { label: "INICIO", date: campaign.startDate },
              { label: "LAUNCH", date: campaign.launchDate },
            ].map((d) => (
              <div key={d.label} className="flex items-center justify-between bg-[#111111] border border-[#2a2a2a] px-3 py-2">
                <span className="text-[#8c8c8c]" style={{ fontFamily: "var(--font-space-mono)", fontSize: "9px" }}>{d.label}</span>
                <span className="text-[#f0f0ee]">{formatDate(d.date)}</span>
              </div>
            ))}
          </div>

          {/* Launch checklist */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[#f0f0ee] text-[11px] tracking-[0.15em]"
                style={{ fontFamily: "var(--font-space-mono)" }}>
                LAUNCH CHECKLIST
              </span>
              <span className="text-[#c8102e] text-[10px]" style={{ fontFamily: "var(--font-space-mono)" }}>
                {progress}%
              </span>
            </div>
            <Progress value={progress} className="mb-3" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
              {Object.entries(campaign.checklist).map(([key, done]) => (
                <div key={key} className="flex items-center gap-2 py-1">
                  {done ? (
                    <CheckCircle size={12} className="text-green-400 flex-shrink-0" />
                  ) : (
                    <Circle size={12} className="text-[#2a2a2a] flex-shrink-0" />
                  )}
                  <span className={cn("text-xs", done ? "text-[#8c8c8c] line-through" : "text-[#f0f0ee]")}>
                    {CHECKLIST_LABELS[key] || key}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tasks */}
          {dropTasks.length > 0 && (
            <div>
              <div className="text-[#f0f0ee] text-[11px] tracking-[0.15em] mb-2"
                style={{ fontFamily: "var(--font-space-mono)" }}>
                TAREAS ASOCIADAS ({dropTasks.length})
              </div>
              <div className="space-y-1">
                {dropTasks.map((t) => (
                  <div key={t.id} className="flex items-center justify-between py-1.5 border-b border-[#1a1a1a]">
                    <span className="text-[#8c8c8c] text-xs truncate flex-1 mr-2">{t.title}</span>
                    <span className={cn("text-[9px] px-1.5 py-0.5 flex-shrink-0",
                      t.status === "blocked" ? "bg-[#3d0510] border border-[#c8102e] text-[#f0f0ee]" :
                      t.status === "done" ? "text-green-400" : "text-[#8c8c8c]")}
                      style={{ fontFamily: "var(--font-space-mono)" }}>
                      {t.status.toUpperCase().replace("_", " ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {campaign.notes && (
            <div className="bg-[#111111] border border-[#2a2a2a] p-3">
              <div className="text-[#8c8c8c] text-[9px] tracking-[0.15em] mb-2"
                style={{ fontFamily: "var(--font-space-mono)" }}>
                NOTAS ESTRATÉGICAS
              </div>
              <p className="text-[#f0f0ee] text-xs leading-relaxed">{campaign.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CampaignsPage() {
  const { campaigns } = useAppStore();
  const [selected, setSelected] = useState<Campaign | null>(null);

  const active = campaigns.filter((c) => ["teasing", "live", "preparing"].includes(c.status));
  const closed = campaigns.filter((c) => ["closed", "archived", "sold_out", "concept"].includes(c.status));

  return (
    <div className="bg-[#050505] min-h-full">
      <TopBar title="DROPS & CAMPAÑAS" />

      <div className="px-4 md:px-6 py-5">
        <div className="flex items-center justify-between mb-6">
          <h1
            className="text-[#f0f0ee] leading-none"
            style={{ fontFamily: "var(--font-anton)", fontSize: "clamp(2rem, 6vw, 3.5rem)", letterSpacing: "0.02em" }}
          >
            DROP ROOM
          </h1>
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-[#c8102e]" />
            <span className="text-[#c8102e] text-[10px]" style={{ fontFamily: "var(--font-space-mono)" }}>
              {active.length} ACTIVE
            </span>
          </div>
        </div>

        {active.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 bg-[#c8102e]" />
              <span className="text-[#c8102e] text-[10px] tracking-[0.2em]"
                style={{ fontFamily: "var(--font-space-mono)" }}>
                ACTIVE DROPS
              </span>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {active.map((c) => <DropCard key={c.id} campaign={c} onClick={() => setSelected(c)} />)}
            </div>
          </div>
        )}

        {closed.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 bg-[#2a2a2a]" />
              <span className="text-[#8c8c8c] text-[10px] tracking-[0.2em]"
                style={{ fontFamily: "var(--font-space-mono)" }}>
                CLOSED DROPS
              </span>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {closed.map((c) => <DropCard key={c.id} campaign={c} onClick={() => setSelected(c)} />)}
            </div>
          </div>
        )}
      </div>

      {selected && <DropDetail campaign={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
