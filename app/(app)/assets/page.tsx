"use client";

import { useState } from "react";
import { useAppStore } from "@/store";
import { TopBar } from "@/components/layout/TopBar";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { cn, formatDate } from "@/lib/utils";
import type { AssetType, Asset, User } from "@/lib/types";
import { FolderOpen, Image, Video, FileText, Layers, Type, Palette, Film, Package, Bookmark } from "lucide-react";

const TYPE_ICONS: Record<AssetType, React.ReactNode> = {
  logo: <Bookmark size={16} className="text-[#c8102e]" />,
  mockup: <Package size={16} className="text-[#8c8c8c]" />,
  product_photo: <Image size={16} className="text-[#8c8c8c]" />,
  video: <Video size={16} className="text-[#8c8c8c]" />,
  copy: <FileText size={16} className="text-[#8c8c8c]" />,
  template: <Layers size={16} className="text-[#8c8c8c]" />,
  reference: <Image size={16} className="text-[#8c8c8c]" />,
  story_asset: <Film size={16} className="text-[#8c8c8c]" />,
  reel_asset: <Film size={16} className="text-[#8c8c8c]" />,
  document: <FileText size={16} className="text-[#8c8c8c]" />,
  brand_book: <FileText size={16} className="text-[#c8102e]" />,
  palette: <Palette size={16} className="text-[#8c8c8c]" />,
  typography: <Type size={16} className="text-[#8c8c8c]" />,
  other: <FolderOpen size={16} className="text-[#8c8c8c]" />,
};

const TYPE_LABELS: Record<AssetType, string> = {
  logo: "LOGO", mockup: "MOCKUP", product_photo: "FOTO", video: "VIDEO",
  copy: "COPY", template: "TEMPLATE", reference: "REFERENCIA", story_asset: "STORY",
  reel_asset: "REEL", document: "DOC", brand_book: "BRAND BOOK",
  palette: "PALETA", typography: "TIPOGRAFÍA", other: "OTRO",
};

const STATUS_COLORS = {
  draft: "bg-yellow-900/50 text-yellow-300",
  approved: "bg-green-900/50 text-green-300",
  archived: "bg-[#2a2a2a] text-[#8c8c8c] line-through",
};

const ALL_CATEGORIES = ["Todos", "Brand", "Drop 001", "Drop 002", "Templates"];

export default function AssetsPage() {
  const { assets, users } = useAppStore();
  const [filterCategory, setFilterCategory] = useState("Todos");
  const [filterStatus, setFilterStatus] = useState("all");

  const filtered = assets.filter((a) => {
    if (filterCategory !== "Todos" && a.category !== filterCategory) return false;
    if (filterStatus !== "all" && a.status !== filterStatus) return false;
    return true;
  });

  const grouped = filtered.reduce<Record<string, typeof filtered>>((acc, asset) => {
    const cat = asset.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(asset);
    return acc;
  }, {});

  return (
    <div className="bg-[#050505] min-h-full">
      <TopBar title="BIBLIOTECA DE ASSETS" />

      <div className="px-4 md:px-6 py-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1
            className="text-[#f0f0ee] leading-none"
            style={{ fontFamily: "var(--font-anton)", fontSize: "clamp(2rem, 6vw, 3.5rem)", letterSpacing: "0.02em" }}
          >
            ASSET VAULT
          </h1>
          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-[#111111] border border-[#2a2a2a] text-[#8c8c8c] px-3 py-1.5 text-[10px] tracking-[0.1em] focus:border-[#c8102e] focus:outline-none"
              style={{ fontFamily: "var(--font-space-mono)" }}
            >
              <option value="all">ALL STATUS</option>
              <option value="approved">APPROVED</option>
              <option value="draft">DRAFT</option>
              <option value="archived">ARCHIVED</option>
            </select>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex items-center gap-1 mb-6 flex-wrap">
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={cn(
                "px-3 py-1.5 text-[10px] tracking-[0.1em] border transition-colors",
                filterCategory === cat
                  ? "bg-[#c8102e] border-[#c8102e] text-[#f0f0ee]"
                  : "bg-transparent border-[#2a2a2a] text-[#8c8c8c] hover:border-[#8c8c8c] hover:text-[#f0f0ee]"
              )}
              style={{ fontFamily: "var(--font-space-mono)" }}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Assets by category */}
        {filterCategory === "Todos" ? (
          <div className="space-y-8">
            {Object.entries(grouped).map(([category, catAssets]) => (
              <div key={category}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-4 bg-[#2a2a2a]" />
                  <span className="text-[#8c8c8c] text-[10px] tracking-[0.2em]"
                    style={{ fontFamily: "var(--font-space-mono)" }}>
                    {category.toUpperCase()}
                  </span>
                  <span className="text-[#2a2a2a] text-[10px]" style={{ fontFamily: "var(--font-space-mono)" }}>
                    {catAssets.length}
                  </span>
                </div>
                <AssetGrid assets={catAssets} users={users} />
              </div>
            ))}
          </div>
        ) : (
          <AssetGrid assets={filtered} users={users} />
        )}

        {filtered.length === 0 && (
          <div className="flex items-center justify-center h-40 border border-dashed border-[#1a1a1a]">
            <span className="text-[#2a2a2a] text-[10px]" style={{ fontFamily: "var(--font-space-mono)" }}>
              NO ASSETS FOUND
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function AssetGrid({ assets, users }: { assets: Asset[]; users: User[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {assets.map((asset) => {
        const author = users.find((u) => u.id === asset.authorId);
        const TYPE_LABELS_TYPED = TYPE_LABELS as Record<string, string>;
        const STATUS_COLORS_TYPED = STATUS_COLORS as Record<string, string>;
        return (
          <div
            key={asset.id}
            className="bg-[#111111] border border-[#2a2a2a] p-4 hover:border-[#3a3a3a] transition-colors group"
          >
            {/* Preview area */}
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] h-20 flex items-center justify-center mb-3 group-hover:border-[#2a2a2a] transition-colors">
              {TYPE_ICONS[asset.type]}
            </div>

            {/* Info */}
            <div className="flex items-start justify-between mb-2">
              <span
                className="text-[#f0f0ee] text-xs font-medium leading-tight flex-1 mr-2 line-clamp-2"
              >
                {asset.name}
              </span>
              <span
                className={cn("text-[8px] px-1.5 py-0.5 flex-shrink-0", STATUS_COLORS_TYPED[asset.status])}
                style={{ fontFamily: "var(--font-space-mono)" }}
              >
                {asset.status.toUpperCase()}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span
                  className="text-[#8c8c8c] text-[9px] bg-[#1a1a1a] px-1.5 py-0.5"
                  style={{ fontFamily: "var(--font-space-mono)" }}
                >
                  {TYPE_LABELS_TYPED[asset.type]}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#2a2a2a] text-[9px]" style={{ fontFamily: "var(--font-space-mono)" }}>
                  {formatDate(asset.date)}
                </span>
                {author && <Avatar user={author} size="xs" />}
              </div>
            </div>

            {/* Tags */}
            {asset.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {asset.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-[#2a2a2a] text-[8px] px-1 py-0.5 border border-[#1a1a1a]"
                    style={{ fontFamily: "var(--font-space-mono)" }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
