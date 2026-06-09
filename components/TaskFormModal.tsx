"use client";

import { useState, useEffect } from "react";
import { Modal, FormField, inputClass, selectClass, textareaClass } from "@/components/ui/Modal";
import { useAppStore } from "@/store";
import type { Task, TaskType, TaskPriority, TaskStatus } from "@/lib/types";
import { Plus, X } from "lucide-react";

const TASK_TYPES: { value: TaskType; label: string }[] = [
  { value: "design", label: "DISEÑO" },
  { value: "content", label: "CONTENIDO" },
  { value: "production", label: "PRODUCCIÓN" },
  { value: "web", label: "WEB" },
  { value: "shopify", label: "SHOPIFY" },
  { value: "campaign", label: "CAMPAÑA" },
  { value: "photo", label: "FOTO" },
  { value: "video", label: "VÍDEO" },
  { value: "paid_ads", label: "PAID ADS" },
  { value: "influencers", label: "INFLUENCERS" },
  { value: "operations", label: "OPERACIONES" },
  { value: "product", label: "PRODUCTO" },
  { value: "drop", label: "DROP" },
  { value: "finance", label: "FINANZAS" },
  { value: "legal", label: "LEGAL" },
  { value: "other", label: "OTRO" },
];

const PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: "low", label: "LOW" },
  { value: "medium", label: "MEDIUM" },
  { value: "high", label: "HIGH" },
  { value: "critical", label: "CRITICAL" },
];

const STATUSES: { value: TaskStatus; label: string }[] = [
  { value: "backlog", label: "BACKLOG" },
  { value: "todo", label: "TO DO" },
  { value: "in_progress", label: "IN PROGRESS" },
  { value: "review", label: "REVIEW" },
];

interface TaskFormModalProps {
  open: boolean;
  onClose: () => void;
}

export function TaskFormModal({ open, onClose }: TaskFormModalProps) {
  const { currentUser, users, addTask } = useAppStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<TaskType>("other");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [assigneeId, setAssigneeId] = useState<string>(currentUser?.id ?? "");
  const [dueDate, setDueDate] = useState("");
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [subtaskDraft, setSubtaskDraft] = useState("");

  useEffect(() => {
    if (open) {
      setTitle("");
      setDescription("");
      setType("other");
      setPriority("medium");
      setStatus("todo");
      setAssigneeId(currentUser?.id ?? "");
      setDueDate("");
      setSubtasks([]);
      setSubtaskDraft("");
    }
  }, [open, currentUser]);

  function addSubtask() {
    const v = subtaskDraft.trim();
    if (!v) return;
    setSubtasks((s) => [...s, v]);
    setSubtaskDraft("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !assigneeId) return;
    const now = new Date().toISOString();
    const task: Task = {
      id: `t-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || undefined,
      assigneeId,
      priority,
      status,
      dueDate: dueDate || undefined,
      type,
      tags: [],
      comments: [],
      checklist: subtasks.map((s, i) => ({
        id: `cl-${Date.now()}-${i}`,
        text: s,
        done: false,
      })),
      createdAt: now,
      updatedAt: now,
    };
    addTask(task);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="NUEVA TAREA" subtitle="// añadir al tablero" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Título" required>
          <input
            autoFocus
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Diseñar mockups Drop 003..."
            className={inputClass}
            required
          />
        </FormField>

        <FormField label="Descripción">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detalles, contexto, referencias..."
            className={textareaClass}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Tipo" required>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as TaskType)}
              className={selectClass}
            >
              {TASK_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Prioridad" required>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className={selectClass}
            >
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Asignar a" required>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className={selectClass}
              required
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name.toUpperCase()}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Estado inicial">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className={selectClass}
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField label="Fecha límite">
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={inputClass}
          />
        </FormField>

        {/* Subtasks (initial checklist) */}
        <FormField label="Subtasks (checklist)">
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={subtaskDraft}
                onChange={(e) => setSubtaskDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSubtask();
                  }
                }}
                placeholder="Añadir subtask y pulsa Enter..."
                className={inputClass}
              />
              <button
                type="button"
                onClick={addSubtask}
                className="bg-[#c8102e] hover:bg-[#a00d24] text-[#f0f0ee] px-3 transition-colors flex-shrink-0"
              >
                <Plus size={14} />
              </button>
            </div>
            {subtasks.length > 0 && (
              <ul className="space-y-1 border border-[#1a1a1a] bg-[#0a0a0a] p-2">
                {subtasks.map((s, i) => (
                  <li key={i} className="flex items-center gap-2 group">
                    <span className="text-[#2a2a2a] text-xs">›</span>
                    <span className="text-[#f0f0ee] text-xs flex-1">{s}</span>
                    <button
                      type="button"
                      onClick={() => setSubtasks((arr) => arr.filter((_, j) => j !== i))}
                      className="text-[#2a2a2a] hover:text-[#c8102e] opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={11} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
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
            disabled={!title.trim() || !assigneeId}
            className="px-4 py-2 text-[10px] tracking-[0.15em] bg-[#c8102e] hover:bg-[#a00d24] text-[#f0f0ee] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            style={{ fontFamily: "var(--font-space-mono)" }}
          >
            CREAR TAREA
          </button>
        </div>
      </form>
    </Modal>
  );
}
