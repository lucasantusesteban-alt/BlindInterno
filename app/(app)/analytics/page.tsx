"use client";

import { TopBar } from "@/components/layout/TopBar";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { METRICS, SOCIAL_WEEKLY_DATA, BRAND_HEALTH } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis,
} from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

const BRAND_HEALTH_DATA = Object.entries(BRAND_HEALTH).map(([key, value]) => ({
  label: key.replace(/([A-Z])/g, " $1").toUpperCase().trim(),
  value,
}));

const PLATFORM_DATA = [
  { platform: "TikTok", followers: 2340, reach: 32000, engagement: 8.4 },
  { platform: "Instagram", followers: 4820, reach: 48000, engagement: 6.8 },
  { platform: "Email", followers: 840, reach: 840, engagement: 24.5 },
];

const SALES_DATA = [
  { month: "MAR", sales: 0, revenue: 0 },
  { month: "ABR", sales: 12, revenue: 1020 },
  { month: "MAY", sales: 47, revenue: 3995 },
  { month: "JUN", sales: 0, revenue: 0 },
];

const CONTENT_TYPES = [
  { name: "Reel", value: 35, fill: "#c8102e" },
  { name: "Story", value: 28, fill: "#8c8c8c" },
  { name: "TikTok", value: 22, fill: "#f0f0ee" },
  { name: "Email", value: 8, fill: "#2a2a2a" },
  { name: "Otro", value: 7, fill: "#1a1a1a" },
];

function MetricCard({ label, value, change, unit }: { label: string; value: number | string; change?: number; unit?: string }) {
  const isPositive = (change ?? 0) >= 0;
  return (
    <div className="bg-[#111111] border border-[#2a2a2a] p-4">
      <div className="text-[#8c8c8c] text-[9px] tracking-[0.15em] mb-2"
        style={{ fontFamily: "var(--font-space-mono)" }}>
        {label}
      </div>
      <div className="text-3xl text-[#f0f0ee] mb-1"
        style={{ fontFamily: "var(--font-anton)", letterSpacing: "0.02em" }}>
        {typeof value === "number" ? value.toLocaleString() : value}
        {unit && <span className="text-base ml-1 text-[#8c8c8c]">{unit}</span>}
      </div>
      {change !== undefined && (
        <div className={cn("flex items-center gap-1 text-[9px]", isPositive ? "text-green-400" : "text-[#c8102e]")}
          style={{ fontFamily: "var(--font-space-mono)" }}>
          {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {isPositive ? "+" : ""}{change}%
        </div>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <div className="bg-[#050505] min-h-full">
      <TopBar title="ANALYTICS" />

      <div className="px-4 md:px-6 py-5 space-y-6 max-w-[1400px]">
        <h1
          className="text-[#f0f0ee] leading-none"
          style={{ fontFamily: "var(--font-anton)", fontSize: "clamp(2rem, 6vw, 3.5rem)", letterSpacing: "0.02em" }}
        >
          DATA ROOM
        </h1>

        {/* KPI Grid */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-[#c8102e]" />
            <span className="text-[#f0f0ee] text-[11px] tracking-[0.2em]"
              style={{ fontFamily: "var(--font-space-mono)" }}>
              MÉTRICAS CLAVE
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard label="FOLLOWERS IG" value={4820} change={12.4} />
            <MetricCard label="FOLLOWERS TK" value={2340} change={28.7} />
            <MetricCard label="ENGAGEMENT IG" value="6.8" unit="%" change={1.2} />
            <MetricCard label="ALCANCE SEMANA" value={48000} change={34.2} />
            <MetricCard label="VENTAS TOTALES" value={47} unit="unds" />
            <MetricCard label="INGRESOS" value={3995} unit="€" />
            <MetricCard label="TICKET MEDIO" value={85} unit="€" />
            <MetricCard label="CONVERSIÓN" value="5.6" unit="%" change={0.8} />
          </div>
        </div>

        {/* Charts grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Social reach */}
          <Card>
            <CardHeader>
              <span className="text-[#f0f0ee] text-[11px] tracking-[0.2em]"
                style={{ fontFamily: "var(--font-space-mono)" }}>
                ALCANCE SEMANAL
              </span>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={SOCIAL_WEEKLY_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                  <XAxis dataKey="day" tick={{ fontSize: 9, fill: "#8c8c8c" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "#8c8c8c" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#111111", border: "1px solid #2a2a2a", borderRadius: 0, fontSize: 10 }}
                    labelStyle={{ color: "#8c8c8c" }} itemStyle={{ color: "#c8102e" }} />
                  <Line type="monotone" dataKey="reach" stroke="#c8102e" strokeWidth={1.5} dot={false} name="Alcance" />
                  <Line type="monotone" dataKey="engagement" stroke="#f0f0ee" strokeWidth={1} dot={false} name="Engagement" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Sales */}
          <Card>
            <CardHeader>
              <span className="text-[#f0f0ee] text-[11px] tracking-[0.2em]"
                style={{ fontFamily: "var(--font-space-mono)" }}>
                VENTAS POR MES
              </span>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={SALES_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 9, fill: "#8c8c8c" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "#8c8c8c" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#111111", border: "1px solid #2a2a2a", borderRadius: 0, fontSize: 10 }}
                    labelStyle={{ color: "#8c8c8c" }} itemStyle={{ color: "#c8102e" }} />
                  <Bar dataKey="revenue" fill="#c8102e" radius={0} name="Ingresos (€)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Content mix */}
          <Card>
            <CardHeader>
              <span className="text-[#f0f0ee] text-[11px] tracking-[0.2em]"
                style={{ fontFamily: "var(--font-space-mono)" }}>
                MIX DE CONTENIDO
              </span>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <div className="w-32 h-32 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={CONTENT_TYPES} cx="50%" cy="50%" innerRadius={30} outerRadius={55}
                      dataKey="value" strokeWidth={0}>
                      {CONTENT_TYPES.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 flex-1">
                {CONTENT_TYPES.map((t) => (
                  <div key={t.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 flex-shrink-0" style={{ background: t.fill }} />
                      <span className="text-[#8c8c8c] text-[10px]">{t.name}</span>
                    </div>
                    <span className="text-[#f0f0ee] text-[10px]">{t.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Platform comparison */}
          <Card>
            <CardHeader>
              <span className="text-[#f0f0ee] text-[11px] tracking-[0.2em]"
                style={{ fontFamily: "var(--font-space-mono)" }}>
                PLATAFORMAS
              </span>
            </CardHeader>
            <CardContent className="space-y-4">
              {PLATFORM_DATA.map((p) => (
                <div key={p.platform}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[#f0f0ee] text-xs">{p.platform}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[#8c8c8c] text-[9px]" style={{ fontFamily: "var(--font-space-mono)" }}>
                        {p.followers.toLocaleString()} seg
                      </span>
                      <span className="text-[#c8102e] text-[9px]" style={{ fontFamily: "var(--font-space-mono)" }}>
                        {p.engagement}% eng
                      </span>
                    </div>
                  </div>
                  <Progress value={p.engagement} max={30} size="xs" color="red" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Brand Health */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-[#c8102e]" />
              <span className="text-[#f0f0ee] text-[11px] tracking-[0.2em]"
                style={{ fontFamily: "var(--font-space-mono)" }}>
                BRAND HEALTH
              </span>
            </div>
            <span className="text-[#8c8c8c] text-[9px]" style={{ fontFamily: "var(--font-space-mono)" }}>
              JUNE 2025
            </span>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                {BRAND_HEALTH_DATA.map(({ label, value }) => (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[#8c8c8c] text-[10px]" style={{ fontFamily: "var(--font-space-mono)" }}>
                        {label}
                      </span>
                      <span
                        className={cn("text-[10px]", value >= 70 ? "text-green-400" : value >= 50 ? "text-yellow-400" : "text-[#c8102e]")}
                        style={{ fontFamily: "var(--font-space-mono)" }}
                      >
                        {value}/100
                      </span>
                    </div>
                    <Progress value={value} color={value >= 70 ? "green" : value >= 50 ? "white" : "red"} size="sm" />
                  </div>
                ))}
              </div>

              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={BRAND_HEALTH_DATA}>
                    <PolarGrid stroke="#2a2a2a" />
                    <PolarAngleAxis dataKey="label" tick={{ fontSize: 8, fill: "#8c8c8c" }} />
                    <Radar dataKey="value" stroke="#c8102e" fill="#c8102e" fillOpacity={0.15} strokeWidth={1.5} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
