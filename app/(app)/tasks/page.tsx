"use client";

import { useState, useCallback } from "react";
import { useAppStore } from "@/store";
import { TopBar } from "@/components/layout/TopBar";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Progress } from "@/components/ui/Progress";
import {
  getPriorityColor, getPriorityLabel, getStatusLabel, getTaskTypeLabel,
  formatDateShort, daysUntil, getChecklistProgress, cn,
} from "@/lib/utils";
import type { Task, TaskStatus, TaskPriority } from "@/lib/types";
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  useDroppable, useDraggable, type DragEndEvent, type DragStartEvent,
} from "@dnd-kit/core";
import { Plus, X, MessageCircle, CheckSquare, Flag, Calendar, Filter, Grid, List, ChevronDown, Lock, User as UserIcon, Square, CheckSquare as CheckSquareFilled, Trash2 } from "lucide-react";
import { TaskFormModal } from "@/components/TaskFormModal";

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: "backlog", label: "BACKLOG", color: "#2a2a2a" },
  { id: "todo", label: "TO DO", color: "#8c8c8c" },
  { id: "in_progress", label: "IN PROGRESS", color: "#3b82f6" },
  { id: "review", label: "REVIEW", color: "#eab308" },
  { id: "done", label: "DONE", color: "#22c55e" },
  { id: "blocked", label: "BLOCKED", color: "#c8102e" },
];

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  critical: "bg-[#c8102e]",
  high: "bg-orange-600",
  medium: "bg-yellow-600",
  low: "bg-[#2a2a2a]",
};

function TaskCard({ task, isDragging, readOnly }: { task: Task; isDragging?: boolean; readOnly?: boolean }) {
  const { users } = useAppStore();
  const assignee = users.find((u) => u.id === task.assigneeId);
  const days = task.dueDate ? daysUntil(task.dueDate) : null;
  const progress = getChecklistProgress(task.checklist);
  const isOverdue = days !== null && days < 0;
  const isDueSoon = days !== null && days >= 0 && days <= 2;

  return (
    <div
      className={cn(
        "bg-[#111111] border border-[#2a2a2a] p-3 select-none",
        readOnly ? "cursor-not-allowed opacity-70" : "cursor-grab active:cursor-grabbing",
        task.status === "blocked" && "border-l-2 border-l-[#c8102e]",
        task.priority === "critical" && task.status !== "done" && "border-l-2 border-l-[#c8102e]",
        isDragging && "opacity-50 rotate-1 shadow-2xl",
        "hover:border-[#3a3a3a] transition-colors"
      )}
    >
      {/* Priority + type */}
      <div className="flex items-center gap-1.5 mb-2 flex-wrap">
        <span
          className={cn("w-1.5 h-1.5 flex-shrink-0", PRIORITY_COLORS[task.priority])}
        />
        <span
          className="text-[#8c8c8c] text-[9px] tracking-[0.1em]"
          style={{ fontFamily: "var(--font-space-mono)" }}
        >
          {getTaskTypeLabel(task.type)}
        </span>
        {task.priority === "critical" && (
          <Badge variant="red" size="xs" pulse>CRITICAL</Badge>
        )}
        {task.status === "blocked" && (
          <Badge size="xs" className="bg-[#3d0510] border border-[#c8102e] text-[#f0f0ee]">BLOCKED</Badge>
        )}
        {readOnly && (
          <span className="ml-auto flex items-center gap-1 text-[#2a2a2a]" title="Solo el dueño puede mover esta tarea">
            <Lock size={9} />
          </span>
        )}
      </div>

      {/* Title */}
      <p className="text-[#f0f0ee] text-sm font-medium leading-tight mb-3">{task.title}</p>

      {/* Checklist progress */}
      {task.checklist.length > 0 && (
        <div className="mb-2">
          <div className="flex items-center justify-between mb-1">
            <CheckSquare size={10} className="text-[#8c8c8c]" />
            <span className="text-[#8c8c8c] text-[9px]" style={{ fontFamily: "var(--font-space-mono)" }}>
              {task.checklist.filter((c) => c.done).length}/{task.checklist.length}
            </span>
          </div>
          <Progress value={progress} size="xs" />
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          {assignee && <Avatar user={assignee} size="xs" />}
          {task.comments.length > 0 && (
            <span className="flex items-center gap-1 text-[#2a2a2a] hover:text-[#8c8c8c]">
              <MessageCircle size={10} />
              <span className="text-[9px]" style={{ fontFamily: "var(--font-space-mono)" }}>
                {task.comments.length}
              </span>
            </span>
          )}
        </div>

        {task.dueDate && (
          <span
            className={cn(
              "text-[9px] flex items-center gap-1",
              isOverdue ? "text-[#c8102e]" : isDueSoon ? "text-orange-400" : "text-[#2a2a2a]"
            )}
            style={{ fontFamily: "var(--font-space-mono)" }}
          >
            <Calendar size={9} />
            {isOverdue ? `${Math.abs(days!)}D LATE` : days === 0 ? "TODAY" : `${days}D`}
          </span>
        )}
      </div>
    </div>
  );
}

function DraggableCard({ task, readOnly }: { task: Task; readOnly: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    disabled: readOnly,
  });
  return (
    <div
      ref={setNodeRef}
      {...(readOnly ? {} : listeners)}
      {...(readOnly ? {} : attributes)}
      style={transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined}
      className={isDragging ? "opacity-30" : ""}
    >
      <TaskCard task={task} readOnly={readOnly} />
    </div>
  );
}

function KanbanColumn({ id, label, color, tasks, currentUserId }: { id: TaskStatus; label: string; color: string; tasks: Task[]; currentUserId: string }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div className="flex flex-col min-w-[240px] md:min-w-0 w-full">
      {/* Column header */}
      <div
        className={cn(
          "flex items-center justify-between px-3 py-2 border-b mb-2",
          isOver ? "border-b-[#c8102e] bg-[#1a1a1a]" : "border-b-[#1a1a1a]"
        )}
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 flex-shrink-0" style={{ background: color }} />
          <span
            className="text-[#8c8c8c] text-[10px] tracking-[0.15em]"
            style={{ fontFamily: "var(--font-space-mono)" }}
          >
            {label}
          </span>
        </div>
        <span
          className="text-[#2a2a2a] text-[10px]"
          style={{ fontFamily: "var(--font-space-mono)" }}
        >
          {tasks.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 space-y-2 min-h-[200px] p-1 transition-colors rounded",
          isOver && "bg-[#1a1a1a]"
        )}
      >
        {tasks.map((task) => (
          <DraggableCard key={task.id} task={task} readOnly={task.assigneeId !== currentUserId} />
        ))}
        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-20 border border-dashed border-[#1a1a1a]">
            <span
              className="text-[#2a2a2a] text-[9px] tracking-[0.15em]"
              style={{ fontFamily: "var(--font-space-mono)" }}
            >
              EMPTY
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TasksPage() {
  const { tasks, updateTaskStatus, users, currentUser, toggleChecklistItem, addChecklistItem, removeChecklistItem, deleteTask } = useAppStore();
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [filterUser, setFilterUser] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [view, setView] = useState<"kanban" | "list" | "mine">("kanban");
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const currentUserId = currentUser?.id ?? "";

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const activeTask = activeTaskId ? tasks.find((t) => t.id === activeTaskId) : null;

  const filteredTasks = tasks.filter((t) => {
    if (filterUser !== "all" && t.assigneeId !== filterUser) return false;
    if (filterPriority !== "all" && t.priority !== filterPriority) return false;
    return true;
  });

  function handleDragStart({ active }: DragStartEvent) {
    setActiveTaskId(active.id as string);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveTaskId(null);
    if (!over) return;
    const targetStatus = over.id as TaskStatus;
    const task = tasks.find((t) => t.id === active.id);
    if (!task) return;
    // Ownership guard: only the assignee can move their own task
    if (task.assigneeId !== currentUserId) return;
    if (task.status !== targetStatus) {
      updateTaskStatus(task.id, targetStatus);
    }
  }

  return (
    <div className="bg-[#050505] min-h-full">
      <TopBar title="TAREAS" />

      <div className="px-4 md:px-6 py-5">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1
            className="text-[#f0f0ee] leading-none"
            style={{ fontFamily: "var(--font-anton)", fontSize: "clamp(2rem, 6vw, 3.5rem)", letterSpacing: "0.02em" }}
          >
            TASK BOARD
          </h1>

          <div className="flex items-center gap-2 flex-wrap">
            {/* User filter */}
            <div className="relative">
              <select
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className="appearance-none bg-[#111111] border border-[#2a2a2a] text-[#8c8c8c] px-3 py-1.5 text-[10px] tracking-[0.1em] pr-7 focus:border-[#c8102e] focus:outline-none"
                style={{ fontFamily: "var(--font-space-mono)" }}
              >
                <option value="all">ALL TEAM</option>
                {users.map((u) => <option key={u.id} value={u.id}>{u.name.toUpperCase()}</option>)}
              </select>
              <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8c8c8c] pointer-events-none" />
            </div>

            {/* Priority filter */}
            <div className="relative">
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="appearance-none bg-[#111111] border border-[#2a2a2a] text-[#8c8c8c] px-3 py-1.5 text-[10px] tracking-[0.1em] pr-7 focus:border-[#c8102e] focus:outline-none"
                style={{ fontFamily: "var(--font-space-mono)" }}
              >
                <option value="all">ALL PRIORITY</option>
                <option value="critical">CRITICAL</option>
                <option value="high">HIGH</option>
                <option value="medium">MEDIUM</option>
                <option value="low">LOW</option>
              </select>
              <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8c8c8c] pointer-events-none" />
            </div>

            {/* View toggle */}
            <div className="flex border border-[#2a2a2a]">
              <button
                onClick={() => setView("kanban")}
                title="Kanban"
                className={cn("px-2.5 py-1.5 transition-colors", view === "kanban" ? "bg-[#c8102e] text-[#f0f0ee]" : "text-[#8c8c8c] hover:text-[#f0f0ee]")}
              >
                <Grid size={13} />
              </button>
              <button
                onClick={() => setView("list")}
                title="Lista"
                className={cn("px-2.5 py-1.5 transition-colors", view === "list" ? "bg-[#c8102e] text-[#f0f0ee]" : "text-[#8c8c8c] hover:text-[#f0f0ee]")}
              >
                <List size={13} />
              </button>
              <button
                onClick={() => setView("mine")}
                title="Mis tasks"
                className={cn("px-2.5 py-1.5 transition-colors", view === "mine" ? "bg-[#c8102e] text-[#f0f0ee]" : "text-[#8c8c8c] hover:text-[#f0f0ee]")}
              >
                <UserIcon size={13} />
              </button>
            </div>

            {/* New task */}
            <button
              onClick={() => setTaskModalOpen(true)}
              className="flex items-center gap-1.5 bg-[#c8102e] hover:bg-[#a00d24] text-[#f0f0ee] px-3 py-1.5 text-[10px] tracking-[0.1em] transition-colors"
              style={{ fontFamily: "var(--font-space-mono)" }}
            >
              <Plus size={11} />
              NEW TASK
            </button>
          </div>
        </div>

        {view === "mine" ? (
          <MyTasksView
            tasks={tasks.filter((t) => t.assigneeId === currentUserId)}
            onToggle={toggleChecklistItem}
            onAddItem={addChecklistItem}
            onRemoveItem={removeChecklistItem}
            onUpdateStatus={updateTaskStatus}
            onDelete={deleteTask}
          />
        ) : view === "kanban" ? (
          <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0">
              {COLUMNS.map((col) => (
                <div key={col.id} className="flex-1 min-w-[240px]">
                  <KanbanColumn
                    id={col.id}
                    label={col.label}
                    color={col.color}
                    tasks={filteredTasks.filter((t) => t.status === col.id)}
                    currentUserId={currentUserId}
                  />
                </div>
              ))}
            </div>
            <DragOverlay>
              {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
            </DragOverlay>
          </DndContext>
        ) : (
          <div className="space-y-1">
            {/* List header */}
            <div
              className="grid gap-2 px-3 py-2 text-[#2a2a2a] text-[9px] tracking-[0.15em] border-b border-[#1a1a1a]"
              style={{ fontFamily: "var(--font-space-mono)", gridTemplateColumns: "2fr 1fr 1fr 1fr 80px 80px" }}
            >
              <span>TAREA</span>
              <span>ASIGNADA</span>
              <span>PRIORIDAD</span>
              <span>ESTADO</span>
              <span>TIPO</span>
              <span>FECHA</span>
            </div>

            {filteredTasks
              .sort((a, b) => {
                const pOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                return pOrder[a.priority] - pOrder[b.priority];
              })
              .map((task) => {
                const assignee = users.find((u) => u.id === task.assigneeId);
                const days = task.dueDate ? daysUntil(task.dueDate) : null;
                return (
                  <div
                    key={task.id}
                    className={cn(
                      "grid gap-2 px-3 py-3 border border-[#1a1a1a] hover:border-[#2a2a2a] hover:bg-[#0a0a0a] transition-colors items-center",
                      task.status === "blocked" && "border-l-2 border-l-[#c8102e]"
                    )}
                    style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 80px 80px" }}
                  >
                    <span className="text-[#f0f0ee] text-sm truncate">{task.title}</span>
                    {assignee ? (
                      <Avatar user={assignee} size="xs" showName />
                    ) : (
                      <span />
                    )}
                    <Badge
                      size="xs"
                      className={getPriorityColor(task.priority)}
                    >
                      {getPriorityLabel(task.priority)}
                    </Badge>
                    <span
                      className={cn(
                        "text-[9px] tracking-[0.1em] px-1.5 py-0.5 inline-flex items-center",
                        task.status === "blocked"
                          ? "bg-[#3d0510] border border-[#c8102e] text-[#f0f0ee]"
                          : task.status === "done"
                          ? "text-green-300"
                          : task.status === "in_progress"
                          ? "text-blue-300"
                          : "text-[#8c8c8c]"
                      )}
                      style={{ fontFamily: "var(--font-space-mono)" }}
                    >
                      {getStatusLabel(task.status)}
                    </span>
                    <span
                      className="text-[#8c8c8c] text-[9px] truncate"
                      style={{ fontFamily: "var(--font-space-mono)" }}
                    >
                      {getTaskTypeLabel(task.type)}
                    </span>
                    <span
                      className={cn(
                        "text-[9px]",
                        days !== null && days < 0
                          ? "text-[#c8102e]"
                          : days !== null && days <= 2
                          ? "text-orange-400"
                          : "text-[#2a2a2a]"
                      )}
                      style={{ fontFamily: "var(--font-space-mono)" }}
                    >
                      {task.dueDate ? formatDateShort(task.dueDate) : "—"}
                    </span>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      <TaskFormModal open={taskModalOpen} onClose={() => setTaskModalOpen(false)} />
    </div>
  );
}

// =============================================================
// MIS TASKS — vista individual con checklist marcable
// =============================================================

function MyTasksView({
  tasks,
  onToggle,
  onAddItem,
  onRemoveItem,
  onUpdateStatus,
  onDelete,
}: {
  tasks: Task[];
  onToggle: (taskId: string, itemId: string) => void;
  onAddItem: (taskId: string, text: string) => void;
  onRemoveItem: (taskId: string, itemId: string) => void;
  onUpdateStatus: (taskId: string, status: TaskStatus) => void;
  onDelete: (taskId: string) => void;
}) {
  const active = tasks.filter((t) => t.status !== "done");
  const done = tasks.filter((t) => t.status === "done");

  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 border border-dashed border-[#1a1a1a]">
        <span
          className="text-[#2a2a2a] text-[10px] tracking-[0.15em]"
          style={{ fontFamily: "var(--font-space-mono)" }}
        >
          NO TIENES TAREAS ASIGNADAS
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top description */}
      <div className="bg-[#0a0a0a] border-l-2 border-l-[#c8102e] px-4 py-3">
        <p className="text-[#8c8c8c] text-[10px] leading-relaxed"
          style={{ fontFamily: "var(--font-space-mono)" }}>
          // CADA TAREA GENERAL DEL KANBAN TIENE SUS SUBTASKS. MÁRCALAS A MEDIDA QUE LAS VAS COMPLETANDO.
          <br />
          // EL PROGRESO SE REFLEJA AUTOMÁTICAMENTE EN EL TABLERO.
        </p>
      </div>

      {/* Active tasks */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 bg-[#c8102e]" />
          <span className="text-[#f0f0ee] text-[11px] tracking-[0.2em]"
            style={{ fontFamily: "var(--font-space-mono)" }}>
            ACTIVAS — {active.length}
          </span>
        </div>
        {active.map((task) => (
          <MyTaskRow
            key={task.id}
            task={task}
            onToggle={onToggle}
            onAddItem={onAddItem}
            onRemoveItem={onRemoveItem}
            onUpdateStatus={onUpdateStatus}
            onDelete={onDelete}
          />
        ))}
      </div>

      {/* Completed */}
      {done.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[#2a2a2a]" />
            <span className="text-[#8c8c8c] text-[11px] tracking-[0.2em]"
              style={{ fontFamily: "var(--font-space-mono)" }}>
              COMPLETADAS — {done.length}
            </span>
          </div>
          {done.map((task) => (
            <MyTaskRow
              key={task.id}
              task={task}
              onToggle={onToggle}
              onAddItem={onAddItem}
              onRemoveItem={onRemoveItem}
              onUpdateStatus={onUpdateStatus}
              completed
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MyTaskRow({
  task,
  onToggle,
  onAddItem,
  onRemoveItem,
  onUpdateStatus,
  onDelete,
  completed,
}: {
  task: Task;
  onToggle: (taskId: string, itemId: string) => void;
  onAddItem: (taskId: string, text: string) => void;
  onRemoveItem: (taskId: string, itemId: string) => void;
  onUpdateStatus: (taskId: string, status: TaskStatus) => void;
  onDelete: (taskId: string) => void;
  completed?: boolean;
}) {
  const [draft, setDraft] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleDeleteClick() {
    if (confirmDelete) {
      onDelete(task.id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  }
  const progress = getChecklistProgress(task.checklist);
  const completedCount = task.checklist.filter((c) => c.done).length;
  const totalCount = task.checklist.length;
  const days = task.dueDate ? daysUntil(task.dueDate) : null;
  const isOverdue = days !== null && days < 0;

  function submitDraft() {
    const v = draft.trim();
    if (!v) return;
    onAddItem(task.id, v);
    setDraft("");
  }

  return (
    <div
      className={cn(
        "bg-[#111111] border border-[#2a2a2a]",
        task.status === "blocked" && "border-l-2 border-l-[#c8102e]",
        task.priority === "critical" && task.status !== "done" && "border-l-2 border-l-[#c8102e]",
        completed && "opacity-50"
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-[#1a1a1a]">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className={cn("w-1.5 h-1.5 flex-shrink-0", PRIORITY_COLORS[task.priority])}
            />
            <span
              className="text-[#8c8c8c] text-[9px] tracking-[0.1em]"
              style={{ fontFamily: "var(--font-space-mono)" }}
            >
              {getTaskTypeLabel(task.type)}
            </span>
            <Badge size="xs" className={cn(
              task.status === "blocked"
                ? "bg-[#3d0510] border border-[#c8102e] text-[#f0f0ee]"
                : task.status === "done"
                ? "bg-green-900/40 text-green-300"
                : task.status === "in_progress"
                ? "bg-blue-900/40 text-blue-300"
                : "bg-[#1a1a1a] text-[#8c8c8c]"
            )}>
              {getStatusLabel(task.status)}
            </Badge>
            {task.priority === "critical" && task.status !== "done" && (
              <Badge variant="red" size="xs" pulse>CRITICAL</Badge>
            )}
          </div>
          <h3 className={cn(
            "text-[#f0f0ee] text-base font-medium leading-snug",
            completed && "line-through text-[#8c8c8c]"
          )}>
            {task.title}
          </h3>
          {task.description && (
            <p className="text-[#8c8c8c] text-xs mt-1 leading-relaxed">{task.description}</p>
          )}
        </div>

        {/* Right meta */}
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          {totalCount > 0 && (
            <div className="text-right">
              <div className="text-[#f0f0ee] text-sm leading-none"
                style={{ fontFamily: "var(--font-anton)", letterSpacing: "0.05em" }}>
                {completedCount}/{totalCount}
              </div>
              <div className="text-[#2a2a2a] text-[8px] tracking-[0.15em]"
                style={{ fontFamily: "var(--font-space-mono)" }}>
                SUBTASKS
              </div>
            </div>
          )}
          {task.dueDate && (
            <span
              className={cn(
                "text-[9px] flex items-center gap-1",
                isOverdue ? "text-[#c8102e]" : "text-[#8c8c8c]"
              )}
              style={{ fontFamily: "var(--font-space-mono)" }}
            >
              <Calendar size={9} />
              {formatDateShort(task.dueDate)}
            </span>
          )}

          {/* Delete button */}
          <button
            onClick={handleDeleteClick}
            className={cn(
              "flex items-center gap-1 text-[9px] tracking-[0.1em] transition-colors mt-1",
              confirmDelete
                ? "text-[#c8102e] font-bold animate-pulse"
                : "text-[#2a2a2a] hover:text-[#c8102e]"
            )}
            style={{ fontFamily: "var(--font-space-mono)" }}
            title={confirmDelete ? "Pulsa de nuevo para confirmar" : "Eliminar tarea"}
          >
            <Trash2 size={11} />
            {confirmDelete ? "CONFIRMAR" : "ELIMINAR"}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="px-4 py-2 border-b border-[#1a1a1a]">
          <Progress value={progress} size="xs" />
        </div>
      )}

      {/* Checklist */}
      <div className="px-4 py-3 space-y-1.5">
        {task.checklist.length === 0 ? (
          <p className="text-[#2a2a2a] text-[10px] italic"
            style={{ fontFamily: "var(--font-space-mono)" }}>
            // sin subtasks — añade abajo
          </p>
        ) : (
          task.checklist.map((item) => (
            <div key={item.id} className="flex items-center gap-2 group">
              <button
                onClick={() => onToggle(task.id, item.id)}
                className="flex-shrink-0 text-[#8c8c8c] hover:text-[#c8102e] transition-colors"
                aria-label={item.done ? "Desmarcar" : "Marcar como hecho"}
              >
                {item.done ? <CheckSquareFilled size={14} className="text-[#c8102e]" /> : <Square size={14} />}
              </button>
              <span className={cn(
                "text-xs flex-1",
                item.done ? "text-[#2a2a2a] line-through" : "text-[#f0f0ee]"
              )}>
                {item.text}
              </span>
              <button
                onClick={() => onRemoveItem(task.id, item.id)}
                className="text-[#2a2a2a] hover:text-[#c8102e] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                aria-label="Eliminar subtask"
              >
                <X size={11} />
              </button>
            </div>
          ))
        )}

        {/* Add subtask inline */}
        {!completed && (
          <div className="flex items-center gap-2 pt-1.5">
            <Plus size={12} className="text-[#2a2a2a] flex-shrink-0" />
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  submitDraft();
                }
              }}
              placeholder="añadir subtask..."
              className="flex-1 bg-transparent text-[#8c8c8c] text-xs focus:outline-none focus:text-[#f0f0ee] placeholder:text-[#2a2a2a]"
            />
            {draft && (
              <button
                onClick={submitDraft}
                className="text-[#c8102e] text-[9px] tracking-[0.15em] hover:text-[#a00d24] transition-colors"
                style={{ fontFamily: "var(--font-space-mono)" }}
              >
                ADD
              </button>
            )}
          </div>
        )}
      </div>

      {/* Status actions */}
      {!completed && totalCount > 0 && completedCount === totalCount && task.status !== "done" && (
        <div className="px-4 py-2 border-t border-[#1a1a1a] bg-[#0a0a0a] flex items-center justify-between">
          <span className="text-green-400 text-[10px] tracking-[0.1em]"
            style={{ fontFamily: "var(--font-space-mono)" }}>
            ✓ TODAS LAS SUBTASKS COMPLETADAS
          </span>
          <button
            onClick={() => onUpdateStatus(task.id, "done")}
            className="text-[10px] tracking-[0.15em] bg-green-900/40 hover:bg-green-900/60 text-green-300 border border-green-800 px-3 py-1 transition-colors"
            style={{ fontFamily: "var(--font-space-mono)" }}
          >
            MARCAR DONE
          </button>
        </div>
      )}
    </div>
  );
}
