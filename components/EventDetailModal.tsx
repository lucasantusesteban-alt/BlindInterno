"use client";

import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import { cn, formatDate } from "@/lib/utils";
import type { InternalEvent, User } from "@/lib/types";

const EVENT_TYPE_LABELS: Record<string, string> = {
  meeting: "MEETING",
  review: "REVIEW",
  planning: "PLANNING",
  shoot: "SHOOT",
  deadline: "DEADLINE",
  "1to1": "1:1",
  offsite: "OFFSITE",
  post: "POST / PUBLICACIÓN",
  recording: "GRABACIÓN",
  video_script: "SCRIPT DE VIDEO",
  other: "OTRO",
};

const EVENT_TYPE_COLORS: Record<string, string> = {
  meeting: "bg-[#c8102e]/20 text-[#f0f0ee] border border-[#c8102e]",
  review: "bg-yellow-900/40 text-yellow-200 border border-yellow-700",
  planning: "bg-blue-900/40 text-blue-200 border border-blue-700",
  shoot: "bg-purple-900/40 text-purple-200 border border-purple-700",
  deadline: "bg-[#c8102e] text-[#f0f0ee] border border-[#c8102e]",
  "1to1": "bg-[#2a2a2a] text-[#f0f0ee] border border-[#3a3a3a]",
  offsite: "bg-green-900/40 text-green-200 border border-green-700",
  post: "bg-teal-900/40 text-teal-200 border border-teal-700",
  recording: "bg-orange-900/40 text-orange-200 border border-orange-700",
  video_script: "bg-indigo-900/40 text-indigo-200 border border-indigo-700",
  other: "bg-[#1a1a1a] text-[#8c8c8c] border border-[#2a2a2a]",
};

const SOCIAL_TYPES = ["post", "recording", "video_script"];

const PLATFORM_LABELS: Record<string, string> = {
  tiktok: "TIKTOK",
  instagram_reels: "IG REELS",
  instagram_stories: "IG STORIES",
  instagram_feed: "IG FEED",
  youtube_shorts: "YT SHORTS",
  whatsapp: "WHATSAPP",
  email: "EMAIL",
};

interface EventDetailModalProps {
  event: InternalEvent | null;
  users: User[];
  onClose: () => void;
}

export function EventDetailModal({ event, users, onClose }: EventDetailModalProps) {
  if (!event) return null;

  const attendees = event.attendeeIds
    .map((id) => users.find((u) => u.id === id))
    .filter((u): u is User => !!u);

  const isSocial = SOCIAL_TYPES.includes(event.type);
  const isScript = event.type === "video_script";

  // location is repurposed as comma-separated platforms for social events
  const platforms = isSocial && event.location
    ? event.location.split(",").map((p) => p.trim()).filter(Boolean)
    : null;

  const typeLabel = EVENT_TYPE_LABELS[event.type] ?? event.type.toUpperCase();
  const typeColor = EVENT_TYPE_COLORS[event.type] ?? EVENT_TYPE_COLORS.other;

  return (
    <Modal open={!!event} onClose={onClose} title={typeLabel} subtitle="// detalle del evento" size="md">
      <div className="space-y-5">

        {/* Type badge + Title */}
        <div>
          <span
            className={cn("inline-block px-2 py-0.5 text-[9px] tracking-[0.15em] mb-3", typeColor)}
            style={{ fontFamily: "var(--font-space-mono)" }}
          >
            {typeLabel}
          </span>
          <h2
            className="text-[#f0f0ee] leading-tight"
            style={{
              fontFamily: "var(--font-anton)",
              fontSize: "clamp(1.4rem, 4vw, 2rem)",
              letterSpacing: "0.02em",
            }}
          >
            {event.title}
          </h2>
        </div>

        {/* Date / Time row */}
        <div className="flex items-start gap-6 py-3 border-y border-[#1a1a1a]">
          <div>
            <p
              className="text-[#8c8c8c] text-[9px] tracking-[0.15em] mb-1"
              style={{ fontFamily: "var(--font-space-mono)" }}
            >
              FECHA
            </p>
            <p className="text-[#f0f0ee] text-sm" style={{ fontFamily: "var(--font-space-mono)" }}>
              {formatDate(event.date)}
            </p>
          </div>
          {event.startTime && (
            <div>
              <p
                className="text-[#8c8c8c] text-[9px] tracking-[0.15em] mb-1"
                style={{ fontFamily: "var(--font-space-mono)" }}
              >
                HORA
              </p>
              <p className="text-[#c8102e] text-sm" style={{ fontFamily: "var(--font-space-mono)" }}>
                {event.startTime}
                {event.endTime ? ` — ${event.endTime}` : ""}
              </p>
            </div>
          )}
        </div>

        {/* Platforms (social) or Location (internal) */}
        {isSocial && platforms && platforms.length > 0 && (
          <div>
            <p
              className="text-[#8c8c8c] text-[9px] tracking-[0.15em] mb-2"
              style={{ fontFamily: "var(--font-space-mono)" }}
            >
              PLATAFORMAS
            </p>
            <div className="flex flex-wrap gap-1.5">
              {platforms.map((p) => (
                <span
                  key={p}
                  className="px-2 py-0.5 text-[9px] bg-[#1a1a1a] border border-[#2a2a2a] text-[#8c8c8c]"
                  style={{ fontFamily: "var(--font-space-mono)" }}
                >
                  {PLATFORM_LABELS[p] ?? p.toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        )}

        {!isSocial && event.location && (
          <div>
            <p
              className="text-[#8c8c8c] text-[9px] tracking-[0.15em] mb-1"
              style={{ fontFamily: "var(--font-space-mono)" }}
            >
              UBICACIÓN
            </p>
            <p className="text-[#f0f0ee] text-sm" style={{ fontFamily: "var(--font-space-mono)" }}>
              {event.location}
            </p>
          </div>
        )}

        {/* Attendees */}
        {attendees.length > 0 && (
          <div>
            <p
              className="text-[#8c8c8c] text-[9px] tracking-[0.15em] mb-2"
              style={{ fontFamily: "var(--font-space-mono)" }}
            >
              {isSocial ? "EQUIPO" : "ASISTENTES"}
            </p>
            <div className="flex flex-wrap gap-3">
              {attendees.map((u) => (
                <div key={u.id} className="flex items-center gap-1.5">
                  <Avatar user={u} size="xs" />
                  <span
                    className="text-[#8c8c8c] text-[9px]"
                    style={{ fontFamily: "var(--font-space-mono)" }}
                  >
                    {u.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description / Script */}
        {event.description && (
          <div>
            <p
              className="text-[#8c8c8c] text-[9px] tracking-[0.15em] mb-2"
              style={{ fontFamily: "var(--font-space-mono)" }}
            >
              {isScript ? "SCRIPT" : "DESCRIPCIÓN"}
            </p>
            <div
              className={cn(
                "text-[#f0f0ee] text-sm leading-relaxed whitespace-pre-wrap",
                isScript
                  ? "bg-[#0a0a0a] border border-[#1a1a1a] p-4 max-h-72 overflow-y-auto text-[11px]"
                  : "text-[#a0a0a0] text-[11px]"
              )}
              style={{ fontFamily: isScript ? "var(--font-space-mono)" : "inherit" }}
            >
              {event.description}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
