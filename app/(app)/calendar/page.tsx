"use client";

import { useState } from "react";
import { useAppStore } from "@/store";
import { TopBar } from "@/components/layout/TopBar";
import { Avatar } from "@/components/ui/Avatar";
import {
  getContentStatusColor, getPlatformColor, getPlatformEmoji, cn, formatDate,
} from "@/lib/utils";
import type { ContentStatus, InternalEventType, InternalEvent, ContentItem, User } from "@/lib/types";
import { ChevronLeft, ChevronRight, List, Grid, Users as UsersIcon, Megaphone, Plus } from "lucide-react";
import { EventFormModal } from "@/components/EventFormModal";
import { addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay, parseISO, startOfDay } from "date-fns";
import { es } from "date-fns/locale";

const STATUS_LABELS: Record<ContentStatus, string> = {
  idea: "IDEA", script: "SCRIPT", in_production: "PRODUCCIÓN", ready: "LISTO",
  scheduled: "PROGRAMADO", published: "PUBLICADO", needs_changes: "CAMBIOS", cancelled: "CANCELADO",
};

const EVENT_TYPE_LABELS: Record<InternalEventType, string> = {
  meeting: "MEETING",
  review: "REVIEW",
  planning: "PLANNING",
  shoot: "SHOOT",
  deadline: "DEADLINE",
  "1to1": "1:1",
  offsite: "OFFSITE",
  other: "OTRO",
};

const EVENT_TYPE_COLORS: Record<InternalEventType, string> = {
  meeting: "bg-[#c8102e]/20 text-[#f0f0ee] border border-[#c8102e]",
  review: "bg-yellow-900/40 text-yellow-200 border border-yellow-700",
  planning: "bg-blue-900/40 text-blue-200 border border-blue-700",
  shoot: "bg-purple-900/40 text-purple-200 border border-purple-700",
  deadline: "bg-[#c8102e] text-[#f0f0ee] border border-[#c8102e]",
  "1to1": "bg-[#2a2a2a] text-[#f0f0ee] border border-[#3a3a3a]",
  offsite: "bg-green-900/40 text-green-200 border border-green-700",
  other: "bg-[#1a1a1a] text-[#8c8c8c] border border-[#2a2a2a]",
};

type CalendarMode = "internal" | "social";

export default function CalendarPage() {
  const { contentItems, internalEvents, users } = useAppStore();
  const [mode, setMode] = useState<CalendarMode>("internal");
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [view, setView] = useState<"month" | "list">("month");
  const [filterPlatform, setFilterPlatform] = useState("all");
  const [filterEventType, setFilterEventType] = useState<string>("all");
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [eventModalDate, setEventModalDate] = useState<string | undefined>(undefined);

  function openNewEvent(forDay?: Date) {
    setEventModalDate(forDay ? format(forDay, "yyyy-MM-dd") : undefined);
    setEventModalOpen(true);
  }

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const startWeekday = startOfMonth(currentMonth).getDay();
  const emptyCells = (startWeekday + 6) % 7;

  // Filter content / events based on mode
  const filteredContent = contentItems.filter((c) =>
    filterPlatform === "all" || c.platform === filterPlatform
  );
  const filteredEvents = internalEvents.filter((e) =>
    filterEventType === "all" || e.type === filterEventType
  );

  function getContentForDay(day: Date) {
    return filteredContent.filter((c) => isSameDay(parseISO(c.publishDate), day));
  }
  function getEventsForDay(day: Date) {
    return filteredEvents.filter((e) => isSameDay(parseISO(e.date), day));
  }

  const selectedDayContent = selectedDay
    ? filteredContent.filter((c) => isSameDay(parseISO(c.publishDate), selectedDay))
    : [];
  const selectedDayEvents = selectedDay
    ? filteredEvents.filter((e) => isSameDay(parseISO(e.date), selectedDay))
    : [];

  return (
    <div className="bg-[#050505] min-h-full">
      <TopBar title="CALENDARIO" />

      <div className="px-4 md:px-6 py-5">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <h1
            className="text-[#f0f0ee] leading-none"
            style={{ fontFamily: "var(--font-anton)", fontSize: "clamp(2rem, 6vw, 3.5rem)", letterSpacing: "0.02em" }}
          >
            CALENDAR
          </h1>

          <div className="flex items-center gap-3 flex-wrap">
            {mode === "social" ? (
              <select
                value={filterPlatform}
                onChange={(e) => setFilterPlatform(e.target.value)}
                className="bg-[#111111] border border-[#2a2a2a] text-[#8c8c8c] px-3 py-1.5 text-[10px] tracking-[0.1em] focus:border-[#c8102e] focus:outline-none"
                style={{ fontFamily: "var(--font-space-mono)" }}
              >
                <option value="all">ALL PLATFORMS</option>
                <option value="tiktok">TIKTOK</option>
                <option value="instagram_reels">IG REELS</option>
                <option value="instagram_stories">IG STORIES</option>
                <option value="instagram_feed">IG FEED</option>
                <option value="email">EMAIL</option>
                <option value="whatsapp">WHATSAPP</option>
              </select>
            ) : (
              <select
                value={filterEventType}
                onChange={(e) => setFilterEventType(e.target.value)}
                className="bg-[#111111] border border-[#2a2a2a] text-[#8c8c8c] px-3 py-1.5 text-[10px] tracking-[0.1em] focus:border-[#c8102e] focus:outline-none"
                style={{ fontFamily: "var(--font-space-mono)" }}
              >
                <option value="all">ALL EVENTS</option>
                <option value="meeting">MEETINGS</option>
                <option value="review">REVIEWS</option>
                <option value="planning">PLANNING</option>
                <option value="shoot">SHOOTS</option>
                <option value="deadline">DEADLINES</option>
                <option value="1to1">1:1</option>
                <option value="offsite">OFFSITE</option>
              </select>
            )}

            {/* View toggle */}
            <div className="flex border border-[#2a2a2a]">
              <button
                onClick={() => setView("month")}
                className={cn("px-2.5 py-1.5 transition-colors", view === "month" ? "bg-[#c8102e] text-[#f0f0ee]" : "text-[#8c8c8c] hover:text-[#f0f0ee]")}
              >
                <Grid size={13} />
              </button>
              <button
                onClick={() => setView("list")}
                className={cn("px-2.5 py-1.5 transition-colors", view === "list" ? "bg-[#c8102e] text-[#f0f0ee]" : "text-[#8c8c8c] hover:text-[#f0f0ee]")}
              >
                <List size={13} />
              </button>
            </div>

            {mode === "internal" && (
              <button
                onClick={() => openNewEvent()}
                className="flex items-center gap-1.5 bg-[#c8102e] hover:bg-[#a00d24] text-[#f0f0ee] px-3 py-1.5 text-[10px] tracking-[0.1em] transition-colors"
                style={{ fontFamily: "var(--font-space-mono)" }}
              >
                <Plus size={11} />
                NEW EVENT
              </button>
            )}
          </div>
        </div>

        {/* Mode tabs — INTERNAL vs SOCIAL */}
        <div className="flex items-center gap-0 mb-6 border-b border-[#1a1a1a]">
          <button
            onClick={() => { setMode("internal"); setSelectedDay(null); }}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-[11px] tracking-[0.15em] transition-colors border-b-2 -mb-px",
              mode === "internal"
                ? "border-[#c8102e] text-[#f0f0ee]"
                : "border-transparent text-[#8c8c8c] hover:text-[#f0f0ee]"
            )}
            style={{ fontFamily: "var(--font-space-mono)" }}
          >
            <UsersIcon size={13} />
            INTERNAL — {filteredEvents.length}
          </button>
          <button
            onClick={() => { setMode("social"); setSelectedDay(null); }}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-[11px] tracking-[0.15em] transition-colors border-b-2 -mb-px",
              mode === "social"
                ? "border-[#c8102e] text-[#f0f0ee]"
                : "border-transparent text-[#8c8c8c] hover:text-[#f0f0ee]"
            )}
            style={{ fontFamily: "var(--font-space-mono)" }}
          >
            <Megaphone size={13} />
            SOCIAL — {filteredContent.length}
          </button>
        </div>

        {view === "month" ? (
          <div>
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="text-[#8c8c8c] hover:text-[#f0f0ee] transition-colors p-1"
              >
                <ChevronLeft size={16} />
              </button>
              <h2
                className="text-[#f0f0ee] text-xl"
                style={{ fontFamily: "var(--font-anton)", letterSpacing: "0.05em", textTransform: "uppercase" }}
              >
                {format(currentMonth, "MMMM yyyy", { locale: es }).toUpperCase()}
              </h2>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="text-[#8c8c8c] hover:text-[#f0f0ee] transition-colors p-1"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
              {["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"].map((d) => (
                <div
                  key={d}
                  className="text-center text-[#2a2a2a] text-[9px] tracking-[0.15em] py-2"
                  style={{ fontFamily: "var(--font-space-mono)" }}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-px bg-[#1a1a1a]">
              {Array.from({ length: emptyCells }).map((_, i) => (
                <div key={`empty-${i}`} className="bg-[#050505] min-h-[80px] md:min-h-[100px]" />
              ))}
              {days.map((day) => {
                const dayItems = mode === "internal" ? getEventsForDay(day) : getContentForDay(day);
                const isSelected = selectedDay && isSameDay(day, selectedDay);
                const isToday = isSameDay(day, new Date());

                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => setSelectedDay(isSelected ? null : day)}
                    className={cn(
                      "bg-[#050505] p-2 min-h-[80px] md:min-h-[100px] cursor-pointer hover:bg-[#0a0a0a] transition-colors",
                      isSelected && "bg-[#111111] ring-1 ring-[#c8102e]",
                    )}
                  >
                    <div
                      className={cn(
                        "text-[10px] font-bold mb-1 w-5 h-5 flex items-center justify-center",
                        isToday ? "bg-[#c8102e] text-[#f0f0ee]" : "text-[#8c8c8c]"
                      )}
                      style={{ fontFamily: "var(--font-space-mono)" }}
                    >
                      {format(day, "d")}
                    </div>
                    <div className="space-y-0.5">
                      {mode === "internal"
                        ? (dayItems as InternalEvent[]).slice(0, 3).map((e) => (
                            <div
                              key={e.id}
                              className={cn(
                                "text-[8px] px-1 py-0.5 truncate leading-tight",
                                EVENT_TYPE_COLORS[e.type]
                              )}
                              style={{ fontFamily: "var(--font-space-mono)" }}
                            >
                              {e.startTime ? `${e.startTime} ` : ""}{e.title.substring(0, 20)}
                            </div>
                          ))
                        : (dayItems as ContentItem[]).slice(0, 3).map((c) => (
                            <div
                              key={c.id}
                              className={cn(
                                "text-[8px] px-1 py-0.5 truncate leading-tight",
                                getPlatformColor(c.platform)
                              )}
                              style={{ fontFamily: "var(--font-space-mono)" }}
                            >
                              {getPlatformEmoji(c.platform)} {c.title.substring(0, 20)}
                            </div>
                          ))}
                      {dayItems.length > 3 && (
                        <div className="text-[8px] text-[#8c8c8c]" style={{ fontFamily: "var(--font-space-mono)" }}>
                          +{dayItems.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected day detail */}
            {selectedDay && (
              <div className="mt-4 bg-[#111111] border border-[#2a2a2a] p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3
                    className="text-[#f0f0ee] text-sm"
                    style={{ fontFamily: "var(--font-anton)", letterSpacing: "0.05em" }}
                  >
                    {format(selectedDay, "EEEE d MMMM", { locale: es }).toUpperCase()}
                  </h3>
                  <div className="flex items-center gap-2">
                    {mode === "internal" && (
                      <button
                        onClick={() => openNewEvent(selectedDay)}
                        className="flex items-center gap-1 text-[#c8102e] hover:text-[#a00d24] text-[10px] tracking-[0.15em] transition-colors"
                        style={{ fontFamily: "var(--font-space-mono)" }}
                      >
                        <Plus size={11} />
                        AÑADIR EVENTO
                      </button>
                    )}
                    <button onClick={() => setSelectedDay(null)} className="text-[#8c8c8c] hover:text-[#f0f0ee]">
                      <ChevronLeft size={14} />
                    </button>
                  </div>
                </div>

                {mode === "internal" ? (
                  selectedDayEvents.length === 0 ? (
                    <p className="text-[#2a2a2a] text-[10px]" style={{ fontFamily: "var(--font-space-mono)" }}>
                      NO EVENTS
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {selectedDayEvents.map((e) => (
                        <EventRow key={e.id} event={e} users={users} />
                      ))}
                    </div>
                  )
                ) : selectedDayContent.length === 0 ? (
                  <p className="text-[#2a2a2a] text-[10px]" style={{ fontFamily: "var(--font-space-mono)" }}>
                    NO CONTENT SCHEDULED
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedDayContent.map((c) => {
                      const assignee = users.find((u) => u.id === c.assigneeId);
                      return (
                        <div key={c.id} className="flex items-start gap-3 py-2 border-b border-[#1a1a1a] last:border-0">
                          <div className={cn("px-1.5 py-1 text-[9px]", getPlatformColor(c.platform))}
                            style={{ fontFamily: "var(--font-space-mono)" }}>
                            {getPlatformEmoji(c.platform)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[#f0f0ee] text-sm">{c.title}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className={cn("text-[9px] px-1.5 py-0.5", getContentStatusColor(c.status))}
                                style={{ fontFamily: "var(--font-space-mono)" }}>
                                {STATUS_LABELS[c.status]}
                              </span>
                              {c.publishTime && (
                                <span className="text-[#8c8c8c] text-[9px]"
                                  style={{ fontFamily: "var(--font-space-mono)" }}>
                                  {c.publishTime}
                                </span>
                              )}
                            </div>
                          </div>
                          {assignee && <Avatar user={assignee} size="xs" />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* List view */
          <div className="space-y-1">
            {mode === "internal" ? (
              filteredEvents
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((e) => (
                  <EventRow key={e.id} event={e} users={users} showDate />
                ))
            ) : (
              filteredContent
                .sort((a, b) => new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime())
                .map((item) => {
                  const assignee = users.find((u) => u.id === item.assigneeId);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 bg-[#111111] border border-[#1a1a1a] px-4 py-3 hover:border-[#2a2a2a] transition-colors"
                    >
                      <div className={cn("px-1.5 py-1 text-[9px] flex-shrink-0", getPlatformColor(item.platform))}
                        style={{ fontFamily: "var(--font-space-mono)" }}>
                        {getPlatformEmoji(item.platform)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[#f0f0ee] text-sm truncate">{item.title}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-[#8c8c8c] text-[9px]" style={{ fontFamily: "var(--font-space-mono)" }}>
                            {formatDate(item.publishDate)} {item.publishTime || ""}
                          </span>
                          <span className="text-[#8c8c8c] text-[9px]" style={{ fontFamily: "var(--font-space-mono)" }}>
                            {item.format.replace(/_/g, " ").toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <span className={cn("text-[9px] px-1.5 py-0.5 hidden md:block", getContentStatusColor(item.status))}
                        style={{ fontFamily: "var(--font-space-mono)" }}>
                        {STATUS_LABELS[item.status]}
                      </span>
                      {assignee && <Avatar user={assignee} size="xs" />}
                    </div>
                  );
                })
            )}
          </div>
        )}
      </div>

      <EventFormModal
        open={eventModalOpen}
        onClose={() => setEventModalOpen(false)}
        defaultDate={eventModalDate}
      />
    </div>
  );
}

function EventRow({ event, users, showDate }: { event: InternalEvent; users: User[]; showDate?: boolean }) {
  const attendees = event.attendeeIds
    .map((id) => users.find((u) => u.id === id))
    .filter((u): u is User => !!u);

  return (
    <div className="flex items-start gap-3 bg-[#111111] border border-[#1a1a1a] px-4 py-3 hover:border-[#2a2a2a] transition-colors">
      <div className={cn("px-1.5 py-1 text-[9px] flex-shrink-0", EVENT_TYPE_COLORS[event.type])}
        style={{ fontFamily: "var(--font-space-mono)" }}>
        {EVENT_TYPE_LABELS[event.type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[#f0f0ee] text-sm leading-tight">{event.title}</p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {showDate && (
            <span className="text-[#8c8c8c] text-[9px]" style={{ fontFamily: "var(--font-space-mono)" }}>
              {formatDate(event.date)}
            </span>
          )}
          {event.startTime && (
            <span className="text-[#c8102e] text-[9px]" style={{ fontFamily: "var(--font-space-mono)" }}>
              {event.startTime}{event.endTime ? ` — ${event.endTime}` : ""}
            </span>
          )}
          {event.location && (
            <span className="text-[#8c8c8c] text-[9px]" style={{ fontFamily: "var(--font-space-mono)" }}>
              {event.location.toUpperCase()}
            </span>
          )}
        </div>
        {event.description && (
          <p className="text-[#8c8c8c] text-[10px] mt-1.5 leading-relaxed">{event.description}</p>
        )}
      </div>
      <div className="flex -space-x-1 flex-shrink-0">
        {attendees.slice(0, 4).map((u) => (
          <Avatar key={u.id} user={u} size="xs" />
        ))}
      </div>
    </div>
  );
}
