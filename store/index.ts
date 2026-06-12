"use client";
import { create } from "zustand";
import { pb } from "@/lib/pocketbase";
import type { User, Task, TaskStatus, InternalEvent, InternalEventType, TaskPriority, TaskType, ContentItem, Campaign, Asset } from "@/lib/types";
import type { RecordModel } from "pocketbase";

// ─── Mappers ────────────────────────────────────────────────────────────────

function pbToUser(r: RecordModel): User {
  return {
    id: r.id,
    name: r.name || r.email,
    email: r.email,
    role: r.role || "content",
    initials: r.initials || (r.name || r.email).slice(0, 2).toUpperCase(),
    color: r.color || "#c8102e",
    area: r.area || "",
    status: r.userStatus || "offline",
  };
}

function pbToTask(r: RecordModel): Task {
  return {
    id: r.id,
    title: r.title,
    description: r.description || undefined,
    assigneeId: r.assignee || "",
    priority: (r.priority as TaskPriority) || "medium",
    status: (r.status as TaskStatus) || "todo",
    dueDate: r.dueDate || undefined,
    type: (r.type as TaskType) || "other",
    tags: [],
    comments: [],
    checklist: Array.isArray(r.subtasks) ? r.subtasks : [],
    createdAt: r.created,
    updatedAt: r.updated,
  };
}

function pbToEvent(r: RecordModel): InternalEvent {
  return {
    id: r.id,
    title: r.title,
    type: (r.type as InternalEventType) || "other",
    date: r.date,
    startTime: r.startTime || undefined,
    endTime: r.endTime || undefined,
    attendeeIds: Array.isArray(r.attendees) ? r.attendees : [],
    location: r.location || undefined,
    description: r.description || undefined,
  };
}

function taskToPb(task: Omit<Task, "id" | "createdAt" | "updatedAt">) {
  return {
    title: task.title,
    description: task.description || "",
    status: task.status,
    priority: task.priority,
    type: task.type,
    assignee: task.assigneeId,
    dueDate: task.dueDate || "",
    subtasks: task.checklist,
  };
}

// ─── Store ───────────────────────────────────────────────────────────────────

interface AppState {
  currentUser: User | null;
  users: User[];
  tasks: Task[];
  internalEvents: InternalEvent[];
  contentItems: ContentItem[];
  campaigns: Campaign[];
  assets: Asset[];
  sidebarOpen: boolean;
  loading: boolean;

  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setSidebarOpen: (open: boolean) => void;

  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  updateTaskStatus: (taskId: string, status: TaskStatus) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  toggleChecklistItem: (taskId: string, itemId: string) => Promise<void>;
  addChecklistItem: (taskId: string, text: string) => Promise<void>;
  removeChecklistItem: (taskId: string, itemId: string) => Promise<void>;

  addInternalEvent: (event: Omit<InternalEvent, "id">) => Promise<void>;
}

let unsubTasks: (() => void) | null = null;
let unsubEvents: (() => void) | null = null;

export const useAppStore = create<AppState>()((set, get) => ({
  currentUser: null,
  users: [],
  tasks: [],
  internalEvents: [],
  contentItems: [],
  campaigns: [],
  assets: [],
  sidebarOpen: true,
  loading: true,

  init: async () => {
    // Restore auth from PocketBase (token saved in cookie/localStorage by SDK)
    const authUser = pb.authStore.isValid ? pb.authStore.model : null;
    if (authUser) {
      set({ currentUser: pbToUser(authUser as RecordModel) });
    }

    if (!pb.authStore.isValid) {
      set({ loading: false });
      return;
    }

    // Fetch independently: a single failing query must never blank the whole app.
    const [tasksRes, eventsRes, usersRes] = await Promise.allSettled([
      pb.collection("tasks").getFullList({ sort: "-created" }),
      pb.collection("internal_events").getFullList({ sort: "date" }),
      pb.collection("users").getFullList(),
    ]);

    if (tasksRes.status === "rejected") console.error("[store] tasks load failed", tasksRes.reason);
    if (eventsRes.status === "rejected") console.error("[store] events load failed", eventsRes.reason);
    if (usersRes.status === "rejected") console.error("[store] users load failed", usersRes.reason);

    set({
      tasks: tasksRes.status === "fulfilled" ? tasksRes.value.map(pbToTask) : [],
      internalEvents: eventsRes.status === "fulfilled" ? eventsRes.value.map(pbToEvent) : [],
      users: usersRes.status === "fulfilled" ? usersRes.value.map(pbToUser) : [],
      loading: false,
    });

    // Realtime subscriptions
    if (unsubTasks) unsubTasks();
    if (unsubEvents) unsubEvents();

    unsubTasks = await pb.collection("tasks").subscribe("*", ({ action, record }) => {
      set((state) => {
        if (action === "create") return { tasks: [pbToTask(record), ...state.tasks] };
        if (action === "update") return { tasks: state.tasks.map((t) => t.id === record.id ? pbToTask(record) : t) };
        if (action === "delete") return { tasks: state.tasks.filter((t) => t.id !== record.id) };
        return {};
      });
    });

    unsubEvents = await pb.collection("internal_events").subscribe("*", ({ action, record }) => {
      set((state) => {
        if (action === "create") return { internalEvents: [...state.internalEvents, pbToEvent(record)] };
        if (action === "update") return { internalEvents: state.internalEvents.map((e) => e.id === record.id ? pbToEvent(record) : e) };
        if (action === "delete") return { internalEvents: state.internalEvents.filter((e) => e.id !== record.id) };
        return {};
      });
    });
  },

  login: async (email, password) => {
    const auth = await pb.collection("users").authWithPassword(email, password);
    set({ currentUser: pbToUser(auth.record as RecordModel) });
    await get().init();
  },

  logout: () => {
    pb.authStore.clear();
    if (unsubTasks) { unsubTasks(); unsubTasks = null; }
    if (unsubEvents) { unsubEvents(); unsubEvents = null; }
    set({ currentUser: null, tasks: [], internalEvents: [], users: [] });
  },

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  addTask: async (task) => {
    await pb.collection("tasks").create(taskToPb(task));
    // realtime subscription updates state automatically
  },

  updateTask: async (task) => {
    await pb.collection("tasks").update(task.id, taskToPb(task));
  },

  updateTaskStatus: async (taskId, status) => {
    await pb.collection("tasks").update(taskId, { status });
  },

  deleteTask: async (taskId) => {
    await pb.collection("tasks").delete(taskId);
  },

  toggleChecklistItem: async (taskId, itemId) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task) return;
    const subtasks = task.checklist.map((c) => c.id === itemId ? { ...c, done: !c.done } : c);
    await pb.collection("tasks").update(taskId, { subtasks });
  },

  addChecklistItem: async (taskId, text) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task) return;
    const subtasks = [...task.checklist, { id: `cl-${Date.now()}`, text, done: false }];
    await pb.collection("tasks").update(taskId, { subtasks });
  },

  removeChecklistItem: async (taskId, itemId) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task) return;
    const subtasks = task.checklist.filter((c) => c.id !== itemId);
    await pb.collection("tasks").update(taskId, { subtasks });
  },

  addInternalEvent: async (event) => {
    await pb.collection("internal_events").create({
      title: event.title,
      type: event.type,
      date: event.date,
      startTime: event.startTime || "",
      endTime: event.endTime || "",
      location: event.location || "",
      attendees: event.attendeeIds,
      description: event.description || "",
    });
  },
}));
