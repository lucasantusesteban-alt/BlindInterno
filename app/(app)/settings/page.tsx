"use client";

import { useAppStore } from "@/store";
import { TopBar } from "@/components/layout/TopBar";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import {
  User, Palette, Users, Plug, Database, Bell, Smartphone, ChevronRight, CheckCircle, Clock,
} from "lucide-react";

const INTEGRATIONS = [
  { name: "Shopify", icon: "SH", status: "pending", desc: "E-commerce y stock" },
  { name: "Instagram", icon: "IG", status: "pending", desc: "Analytics y posts" },
  { name: "TikTok", icon: "TK", status: "pending", desc: "Analytics y vídeos" },
  { name: "Google Analytics", icon: "GA", status: "pending", desc: "Web analytics" },
  { name: "Meta Ads", icon: "MA", status: "pending", desc: "Campañas publicitarias" },
  { name: "Notion", icon: "NO", status: "pending", desc: "Documentación" },
  { name: "Google Drive", icon: "GD", status: "pending", desc: "Archivos y assets" },
  { name: "Supabase", icon: "SB", status: "ready", desc: "Backend y base de datos" },
  { name: "Stripe", icon: "ST", status: "pending", desc: "Pagos y facturación" },
  { name: "Airtable", icon: "AT", status: "pending", desc: "Bases de datos" },
];

const SECTIONS = [
  { id: "profile", label: "PERFIL DE USUARIO", icon: User },
  { id: "brand", label: "DATOS DE MARCA", icon: Palette },
  { id: "members", label: "MIEMBROS", icon: Users },
  { id: "integrations", label: "INTEGRACIONES", icon: Plug },
  { id: "pwa", label: "PWA / APP", icon: Smartphone },
  { id: "notifications", label: "NOTIFICACIONES", icon: Bell },
];

export default function SettingsPage() {
  const { currentUser, users } = useAppStore();

  return (
    <div className="bg-[#050505] min-h-full">
      <TopBar title="CONFIGURACIÓN" />

      <div className="px-4 md:px-6 py-5 max-w-3xl">
        <h1
          className="text-[#f0f0ee] leading-none mb-6"
          style={{ fontFamily: "var(--font-anton)", fontSize: "clamp(2rem, 6vw, 3.5rem)", letterSpacing: "0.02em" }}
        >
          SETTINGS
        </h1>

        <div className="space-y-6">
          {/* Profile */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User size={13} className="text-[#c8102e]" />
                <span className="text-[#f0f0ee] text-[11px] tracking-[0.2em]"
                  style={{ fontFamily: "var(--font-space-mono)" }}>
                  PERFIL DE USUARIO
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {currentUser && (
                <div className="flex items-center gap-4">
                  <span
                    className="w-16 h-16 flex items-center justify-center text-lg font-bold"
                    style={{
                      background: currentUser.color === "#f0f0ee" ? "#2a2a2a" : currentUser.color,
                      color: "#f0f0ee",
                      fontFamily: "var(--font-space-mono)",
                    }}
                  >
                    {currentUser.initials}
                  </span>
                  <div>
                    <div className="text-[#f0f0ee] text-lg"
                      style={{ fontFamily: "var(--font-anton)", letterSpacing: "0.05em" }}>
                      {currentUser.name.toUpperCase()}
                    </div>
                    <div className="text-[#8c8c8c] text-xs">{currentUser.email}</div>
                    <div className="text-[#8c8c8c] text-[9px] mt-1"
                      style={{ fontFamily: "var(--font-space-mono)" }}>
                      {currentUser.role.toUpperCase()} — {currentUser.area}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Brand data */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette size={13} className="text-[#c8102e]" />
                <span className="text-[#f0f0ee] text-[11px] tracking-[0.2em]"
                  style={{ fontFamily: "var(--font-space-mono)" }}>
                  DATOS DE MARCA
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { label: "NOMBRE", value: "BlindSaint" },
                  { label: "TAGLINE", value: "No compramos ropa. Compramos tensión." },
                  { label: "URL", value: "blindsaint.co" },
                  { label: "INSTAGRAM", value: "@blindsaint_co" },
                  { label: "TIKTOK", value: "@blindsaint" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b border-[#1a1a1a] last:border-0">
                    <span className="text-[#8c8c8c] text-[10px]"
                      style={{ fontFamily: "var(--font-space-mono)" }}>
                      {item.label}
                    </span>
                    <span className="text-[#f0f0ee] text-xs">{item.value}</span>
                  </div>
                ))}
              </div>
              {/* Color palette */}
              <div className="mt-4">
                <div className="text-[#8c8c8c] text-[9px] tracking-[0.15em] mb-2"
                  style={{ fontFamily: "var(--font-space-mono)" }}>
                  PALETA OFICIAL
                </div>
                <div className="flex gap-2">
                  {[
                    { color: "#050505", label: "Dark" },
                    { color: "#f0f0ee", label: "White" },
                    { color: "#c8102e", label: "Red" },
                    { color: "#8c8c8c", label: "Gray" },
                    { color: "#2a2a2a", label: "Border" },
                  ].map(({ color, label }) => (
                    <div key={color} className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 border border-[#2a2a2a]" style={{ background: color }} />
                      <span className="text-[#2a2a2a] text-[7px]" style={{ fontFamily: "var(--font-space-mono)" }}>
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team members */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users size={13} className="text-[#c8102e]" />
                <span className="text-[#f0f0ee] text-[11px] tracking-[0.2em]"
                  style={{ fontFamily: "var(--font-space-mono)" }}>
                  MIEMBROS DEL EQUIPO
                </span>
              </div>
              <Badge variant="gray" size="xs">{users.length}</Badge>
            </CardHeader>
            <div className="divide-y divide-[#1a1a1a]">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar user={user} size="sm" />
                    <div>
                      <div className="text-[#f0f0ee] text-sm">{user.name}</div>
                      <div className="text-[#8c8c8c] text-[9px]"
                        style={{ fontFamily: "var(--font-space-mono)" }}>
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#8c8c8c] text-[9px]"
                      style={{ fontFamily: "var(--font-space-mono)" }}>
                      {user.role.toUpperCase()}
                    </span>
                    <span
                      className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        user.status === "online" ? "bg-green-400" : user.status === "busy" ? "bg-yellow-400" : "bg-[#2a2a2a]"
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Integrations */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Plug size={13} className="text-[#c8102e]" />
                <span className="text-[#f0f0ee] text-[11px] tracking-[0.2em]"
                  style={{ fontFamily: "var(--font-space-mono)" }}>
                  INTEGRACIONES
                </span>
              </div>
              <Badge variant="gray" size="xs">COMING SOON</Badge>
            </CardHeader>
            <div className="divide-y divide-[#1a1a1a]">
              {INTEGRATIONS.map((int) => (
                <div key={int.name} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-8 h-8 flex items-center justify-center text-[10px] font-bold bg-[#1a1a1a] text-[#8c8c8c]"
                      style={{ fontFamily: "var(--font-space-mono)" }}
                    >
                      {int.icon}
                    </span>
                    <div>
                      <div className="text-[#f0f0ee] text-xs">{int.name}</div>
                      <div className="text-[#2a2a2a] text-[9px]">{int.desc}</div>
                    </div>
                  </div>
                  {int.status === "ready" ? (
                    <Badge variant="green" size="xs">READY</Badge>
                  ) : (
                    <Badge variant="gray" size="xs">PENDING</Badge>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* PWA info */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Smartphone size={13} className="text-[#c8102e]" />
                <span className="text-[#f0f0ee] text-[11px] tracking-[0.2em]"
                  style={{ fontFamily: "var(--font-space-mono)" }}>
                  PWA — PROGRESSIVE WEB APP
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { label: "App name", value: "BLINDSAINT OS" },
                  { label: "Version", value: "1.0.0" },
                  { label: "Display", value: "Standalone" },
                  { label: "Theme color", value: "#050505" },
                  { label: "Service Worker", value: "Enabled" },
                  { label: "Offline support", value: "Basic caching" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-[#1a1a1a] last:border-0">
                    <span className="text-[#8c8c8c] text-[10px]"
                      style={{ fontFamily: "var(--font-space-mono)" }}>
                      {item.label.toUpperCase()}
                    </span>
                    <span className="text-[#f0f0ee] text-xs">{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 border border-[#c8102e] bg-[#3d0510] p-3">
                <p className="text-[#f0f0ee] text-[10px]" style={{ fontFamily: "var(--font-space-mono)" }}>
                  // Para instalar la PWA: chrome://flags o el banner nativo del navegador.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
