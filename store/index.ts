"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Task, ContentItem, Campaign, Asset, TaskStatus, InternalEvent } from "@/lib/types";
import { USERS, TASKS, CONTENT_ITEMS, CAMPAIGNS, ASSETS, INTERNAL_EVENTS } from "@/lib/mock-data";

interface AppState {
  currentUser: User | null;
  users: User[];
  tasks: Task[];
  contentItems: ContentItem[];
  campaigns: Campaign[];
  assets: Asset[];
  internalEvents: InternalEvent[];
  sidebarOpen: boolean;

  login: (userId: string) => void;
  logout: () => void;
  setSidebarOpen: (open: boolean) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  toggleChecklistItem: (taskId: string, itemId: string) => void;
  addChecklistItem: (taskId: string, text: string) => void;
  removeChecklistItem: (taskId: string, itemId: string) => void;
  addInternalEvent: (event: InternalEvent) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentUser: null,
      users: USERS,
      tasks: TASKS,
      contentItems: CONTENT_ITEMS,
      campaigns: CAMPAIGNS,
      assets: ASSETS,
      internalEvents: INTERNAL_EVENTS,
      sidebarOpen: true,

      login: (userId) =>
        set({ currentUser: USERS.find((u) => u.id === userId) || null }),

      logout: () => set({ currentUser: null }),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      updateTaskStatus: (taskId, status) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, status, updatedAt: new Date().toISOString() } : t
          ),
        })),

      addTask: (task) =>
        set((state) => ({ tasks: [task, ...state.tasks] })),

      updateTask: (task) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === task.id ? task : t)),
        })),

      deleteTask: (taskId) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== taskId),
        })),

      toggleChecklistItem: (taskId, itemId) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  updatedAt: new Date().toISOString(),
                  checklist: t.checklist.map((c) =>
                    c.id === itemId ? { ...c, done: !c.done } : c
                  ),
                }
              : t
          ),
        })),

      addChecklistItem: (taskId, text) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  updatedAt: new Date().toISOString(),
                  checklist: [
                    ...t.checklist,
                    { id: `cl-${Date.now()}`, text, done: false },
                  ],
                }
              : t
          ),
        })),

      removeChecklistItem: (taskId, itemId) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  updatedAt: new Date().toISOString(),
                  checklist: t.checklist.filter((c) => c.id !== itemId),
                }
              : t
          ),
        })),

      addInternalEvent: (event) =>
        set((state) => ({ internalEvents: [event, ...state.internalEvents] })),
    }),
    {
      name: "blindsaint-os-store",
      partialize: (state) => ({ currentUser: state.currentUser }),
    }
  )
);
