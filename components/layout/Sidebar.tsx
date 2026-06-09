"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppStore } from "@/store";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import {
  LayoutDashboard, CheckSquare, Calendar, BarChart2,
  Users, FolderOpen, Settings, ChevronLeft, ChevronRight, LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "Tareas", icon: CheckSquare },
  { href: "/calendar", label: "Calendario", icon: Calendar },
  { href: "/analytics", label: "Data Room", icon: BarChart2 },
  { href: "/team", label: "Crew", icon: Users },
  { href: "/assets", label: "Assets", icon: FolderOpen },
  { href: "/settings", label: "Config", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, sidebarOpen, setSidebarOpen, logout } = useAppStore();

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col h-full bg-[#0a0a0a] border-r border-[#1a1a1a] transition-all duration-200 flex-shrink-0",
        sidebarOpen ? "w-52" : "w-14"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-3 py-4 border-b border-[#1a1a1a]">
        {sidebarOpen ? (
          <div>
            <div
              className="text-[#f0f0ee] leading-none"
              style={{ fontFamily: "var(--font-anton)", fontSize: "20px", letterSpacing: "0.05em" }}
            >
              BLIND
              <span className="text-[#c8102e]">SAINT</span>
            </div>
            <div
              className="text-[#2a2a2a] text-[8px] tracking-[0.2em] mt-0.5"
              style={{ fontFamily: "var(--font-space-mono)" }}
            >
              OS — CONTROL ROOM
            </div>
          </div>
        ) : (
          <div
            className="w-8 h-8 bg-[#c8102e] flex items-center justify-center text-[#f0f0ee] text-xs font-bold flex-shrink-0"
            style={{ fontFamily: "var(--font-space-mono)" }}
          >
            BS
          </div>
        )}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-[#2a2a2a] hover:text-[#8c8c8c] transition-colors p-1 flex-shrink-0"
        >
          {sidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 space-y-0.5 px-2 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-2 py-2.5 transition-colors group relative",
                active
                  ? "bg-[#1a1a1a] text-[#f0f0ee]"
                  : "text-[#8c8c8c] hover:text-[#f0f0ee] hover:bg-[#161616]"
              )}
            >
              {active && (
                <span className="absolute left-0 top-0 h-full w-0.5 bg-[#c8102e]" />
              )}
              <Icon
                size={15}
                className={cn("flex-shrink-0", active ? "text-[#c8102e]" : "")}
              />
              {sidebarOpen && (
                <span
                  className="text-[11px] tracking-[0.1em] uppercase font-medium truncate"
                  style={{ fontFamily: "var(--font-space-mono)" }}
                >
                  {label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      {currentUser && (
        <div className="border-t border-[#1a1a1a] p-2">
          <div className={cn("flex items-center gap-2 px-1 py-1", sidebarOpen ? "justify-between" : "justify-center")}>
            {sidebarOpen ? (
              <>
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar user={currentUser} size="sm" />
                  <div className="min-w-0">
                    <div className="text-[#f0f0ee] text-[11px] font-medium truncate">{currentUser.name}</div>
                    <div className="text-[#8c8c8c] text-[9px] truncate" style={{ fontFamily: "var(--font-space-mono)" }}>
                      {currentUser.role.toUpperCase()}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-[#2a2a2a] hover:text-[#c8102e] transition-colors p-1 flex-shrink-0"
                  title="Logout"
                >
                  <LogOut size={13} />
                </button>
              </>
            ) : (
              <button onClick={handleLogout} title="Logout" className="text-[#2a2a2a] hover:text-[#c8102e] transition-colors">
                <LogOut size={14} />
              </button>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
