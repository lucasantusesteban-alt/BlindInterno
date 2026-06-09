import type { TaskPriority, TaskStatus, ContentStatus, CampaignStatus } from "./types";

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
}

export function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function getPriorityColor(p: TaskPriority): string {
  switch (p) {
    case "critical": return "bg-bs-red text-bs-white";
    case "high": return "bg-orange-700 text-bs-white";
    case "medium": return "bg-yellow-700 text-bs-white";
    case "low": return "bg-bs-border text-bs-gray";
  }
}

export function getPriorityLabel(p: TaskPriority): string {
  switch (p) {
    case "critical": return "CRITICAL";
    case "high": return "HIGH";
    case "medium": return "MEDIUM";
    case "low": return "LOW";
  }
}

export function getStatusColor(s: TaskStatus): string {
  switch (s) {
    case "blocked": return "bg-bs-red-muted border border-bs-red text-bs-white";
    case "in_progress": return "bg-blue-900/50 text-blue-300";
    case "review": return "bg-yellow-900/50 text-yellow-300";
    case "done": return "bg-green-900/50 text-green-300";
    case "todo": return "bg-bs-surface text-bs-white";
    case "backlog": return "bg-bs-border text-bs-gray";
  }
}

export function getStatusLabel(s: TaskStatus): string {
  switch (s) {
    case "blocked": return "BLOCKED";
    case "in_progress": return "IN PROGRESS";
    case "review": return "REVIEW";
    case "done": return "DONE";
    case "todo": return "TO DO";
    case "backlog": return "BACKLOG";
  }
}

export function getContentStatusColor(s: ContentStatus): string {
  switch (s) {
    case "published": return "bg-green-900/50 text-green-300";
    case "scheduled": return "bg-blue-900/50 text-blue-300";
    case "ready": return "bg-yellow-900/50 text-yellow-300";
    case "in_production": return "bg-orange-900/50 text-orange-300";
    case "script": return "bg-purple-900/50 text-purple-300";
    case "idea": return "bg-bs-border text-bs-gray";
    case "needs_changes": return "bg-bs-red-muted border border-bs-red text-bs-white";
    case "cancelled": return "bg-bs-dark text-bs-gray line-through";
  }
}

export function getCampaignStatusColor(s: CampaignStatus): string {
  switch (s) {
    case "live": return "bg-bs-red text-bs-white";
    case "teasing": return "bg-orange-700 text-bs-white";
    case "sold_out": return "bg-green-900/50 text-green-300";
    case "preparing": return "bg-yellow-900/50 text-yellow-300";
    case "concept": return "bg-bs-border text-bs-gray";
    case "closed": return "bg-bs-surface text-bs-gray";
    case "archived": return "bg-bs-dark text-bs-gray";
  }
}

export function getPlatformEmoji(p: string): string {
  const map: Record<string, string> = {
    tiktok: "TK", instagram_reels: "IG", instagram_stories: "IG",
    instagram_feed: "IG", youtube_shorts: "YT", web: "WEB",
    email: "ML", whatsapp: "WA", paid_ads: "AD", other: "—",
  };
  return map[p] || "—";
}

export function getPlatformColor(p: string): string {
  const map: Record<string, string> = {
    tiktok: "bg-white/10 text-white",
    instagram_reels: "bg-pink-900/40 text-pink-300",
    instagram_stories: "bg-pink-900/40 text-pink-300",
    instagram_feed: "bg-pink-900/40 text-pink-300",
    youtube_shorts: "bg-red-900/40 text-red-300",
    web: "bg-blue-900/40 text-blue-300",
    email: "bg-purple-900/40 text-purple-300",
    whatsapp: "bg-green-900/40 text-green-300",
    paid_ads: "bg-yellow-900/40 text-yellow-300",
    other: "bg-bs-border text-bs-gray",
  };
  return map[p] || "bg-bs-border text-bs-gray";
}

export function getTaskTypeLabel(t: string): string {
  const map: Record<string, string> = {
    design: "DISEÑO", content: "CONTENIDO", production: "PRODUCCIÓN",
    web: "WEB", shopify: "SHOPIFY", campaign: "CAMPAÑA", photo: "FOTO",
    video: "VÍDEO", paid_ads: "PAID ADS", influencers: "INFLUENCERS",
    operations: "OPS", product: "PRODUCTO", drop: "DROP",
    finance: "FINANZAS", legal: "LEGAL", other: "OTRO",
  };
  return map[t] || t.toUpperCase();
}

export function getChecklistProgress(checklist: { done: boolean }[]): number {
  if (!checklist.length) return 0;
  return Math.round((checklist.filter((c) => c.done).length / checklist.length) * 100);
}

export function getDropChecklistProgress(c: Record<string, boolean>): number {
  const items = Object.values(c);
  return Math.round((items.filter(Boolean).length / items.length) * 100);
}
