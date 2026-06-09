"use client";

import { useState, useEffect } from "react";
import { Modal, FormField, inputClass, selectClass, textareaClass } from "@/components/ui/Modal";
import { useAppStore } from "@/store";
import type { InternalEvent, InternalEventType } from "@/lib/types";

const EVENT_TYPES: { value: InternalEventType; label: string }[] = [
  { value: "meeting", label: "MEETING" },
  { value: "review", label: "REVIEW" },
  { value: "planning", label: "PLANNING" },
  { value: "shoot", label: "SHOOT" },
  { value: "deadline", label: "DEADLINE" },
  { value: "1to1", label: "1:1" },
  { value: "offsite", label: "OFFSITE" },
  { value: "other", label: "OTRO" },
];

interface EventFormModalProps {
  open: boolean;
  onClose: () => void;
  defaultDate?: string;
}

export function EventFormModal({ open, onClose, defaultDate }: EventFormModalProps) {
  const { users, currentUser, addInternalEvent } = useAppStore();

  const [title, setTitle] = useState("");
  const [type, setType] = useState<InternalEventType>("meeting");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [attendeeIds, setAttendeeIds] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      const today = new Date().toISOString().slice(0, 10);
      setTitle("");
      setType("meeting");
      setDate(defaultDate ?? today);
      setStartTime("");
      setEndTime("");
      setLocation("");
      setDescription("");
      setAttendeeIds(currentUser ? [currentUser.id] : []);
    }
  }, [open, defaultDate, currentUser]);

  function toggleAttendee(id: string) {
    setAttendeeIds((arr) =>
      arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !date) return;
    const event: InternalEvent = {
      id: `ev-${Date.now()}`,
      title: title.trim(),
      type,
      date,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      location: location.trim() || undefined,
      description: description.trim() || undefined,
      attendeeIds,
    };
    addInternalEvent(event);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="NUEVO EVENTO" subtitle="// calendario interno" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Título" required>
          <input
            autoFocus
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Weekly sync, review mockups, sesión de grabación..."
            className={inputClass}
            required
          />
        </FormField>

        <FormField label="Tipo" required>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as InternalEventType)}
            className={selectClass}
          >
            {EVENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </FormField>

        <FormField label="Fecha" required>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
            required
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Hora inicio">
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className={inputClass}
            />
          </FormField>
          <FormField label="Hora fin">
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className={inputClass}
            />
          </FormField>
        </div>

        <FormField label="Ubicación">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Online, office, warehouse, externa..."
            className={inputClass}
          />
        </FormField>

        <FormField label="Asistentes">
          <div className="flex flex-wrap gap-2">
            {users.map((u) => {
              const active = attendeeIds.includes(u.id);
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => toggleAttendee(u.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 border transition-colors text-[10px] tracking-[0.1em] ${
                    active
                      ? "bg-[#c8102e] border-[#c8102e] text-[#f0f0ee]"
                      : "border-[#2a2a2a] text-[#8c8c8c] hover:border-[#8c8c8c] hover:text-[#f0f0ee]"
                  }`}
                  style={{ fontFamily: "var(--font-space-mono)" }}
                >
                  <span
                    className="w-5 h-5 flex items-center justify-center text-[8px] font-bold"
                    style={{
                      background: active ? "#0a0a0a" : (u.color === "#f0f0ee" ? "#2a2a2a" : u.color),
                      color: "#f0f0ee",
                    }}
                  >
                    {u.initials}
                  </span>
                  {u.name.toUpperCase()}
                </button>
              );
            })}
          </div>
        </FormField>

        <FormField label="Descripción">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Agenda, contexto, link de Zoom..."
            className={textareaClass}
          />
        </FormField>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1a1a1a]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-[10px] tracking-[0.15em] border border-[#2a2a2a] text-[#8c8c8c] hover:text-[#f0f0ee] hover:border-[#8c8c8c] transition-colors"
            style={{ fontFamily: "var(--font-space-mono)" }}
          >
            CANCELAR
          </button>
          <button
            type="submit"
            disabled={!title.trim() || !date}
            className="px-4 py-2 text-[10px] tracking-[0.15em] bg-[#c8102e] hover:bg-[#a00d24] text-[#f0f0ee] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            style={{ fontFamily: "var(--font-space-mono)" }}
          >
            CREAR EVENTO
          </button>
        </div>
      </form>
    </Modal>
  );
}
