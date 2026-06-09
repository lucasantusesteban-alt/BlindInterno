"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, CheckSquare, Calendar, BarChart2, Users,
} from "lucide-react";

const MOBILE_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "Tareas", icon: CheckSquare },
  { href: "/calendar", label: "Calendario", icon: Calendar },
  { href: "/analytics", label: "Data", icon: BarChart2 },
  { href: "/team", label: "Crew", icon: Users },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-[#1a1a1a] z-50 flex">
      {MOBILE_NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors",
              active ? "text-[#f0f0ee]" : "text-[#2a2a2a]"
            )}
          >
            <Icon size={18} className={active ? "text-[#c8102e]" : ""} />
            <span
              className="text-[8px] tracking-[0.1em] uppercase"
              style={{ fontFamily: "var(--font-space-mono)" }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
