"use client";

import { useAppStore } from "@/store";
import { Bell, Menu } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { NOTIFICATIONS } from "@/lib/mock-data";

interface TopBarProps {
  title: string;
}

export function TopBar({ title }: TopBarProps) {
  const { currentUser, setSidebarOpen, sidebarOpen } = useAppStore();
  const unread = NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <header className="h-12 border-b border-[#1a1a1a] flex items-center justify-between px-4 bg-[#050505] flex-shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden text-[#8c8c8c] hover:text-[#f0f0ee] transition-colors"
        >
          <Menu size={18} />
        </button>
        <span
          className="text-[#8c8c8c] text-[10px] tracking-[0.2em] uppercase hidden md:block"
          style={{ fontFamily: "var(--font-space-mono)" }}
        >
          {title}
        </span>
        <span
          className="text-[#f0f0ee] text-sm font-medium md:hidden"
        >
          {title}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative text-[#8c8c8c] hover:text-[#f0f0ee] transition-colors">
          <Bell size={16} />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#c8102e] text-[#f0f0ee] text-[7px] flex items-center justify-center font-bold">
              {unread}
            </span>
          )}
        </button>
        {currentUser && <Avatar user={currentUser} size="xs" />}
      </div>
    </header>
  );
}
