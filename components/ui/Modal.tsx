"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export function Modal({ open, onClose, title, subtitle, children, size = "md" }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={cn(
          "bg-[#0a0a0a] border border-[#2a2a2a] w-full max-h-[90vh] overflow-y-auto",
          size === "sm" && "max-w-md",
          size === "md" && "max-w-lg",
          size === "lg" && "max-w-2xl"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a] sticky top-0 bg-[#0a0a0a] z-10">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-[#c8102e]" />
              <h2
                className="text-[#f0f0ee] text-[12px] tracking-[0.2em]"
                style={{ fontFamily: "var(--font-space-mono)" }}
              >
                {title}
              </h2>
            </div>
            {subtitle && (
              <p className="text-[#8c8c8c] text-[10px] mt-1 ml-3"
                style={{ fontFamily: "var(--font-space-mono)" }}>
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-[#8c8c8c] hover:text-[#c8102e] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function FormField({
  label,
  children,
  required,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label
        className="text-[#8c8c8c] text-[10px] tracking-[0.15em] flex items-center gap-1"
        style={{ fontFamily: "var(--font-space-mono)" }}
      >
        {label.toUpperCase()}
        {required && <span className="text-[#c8102e]">*</span>}
      </label>
      {children}
    </div>
  );
}

export const inputClass =
  "w-full bg-[#111111] border border-[#2a2a2a] text-[#f0f0ee] px-3 py-2 text-sm focus:border-[#c8102e] focus:outline-none transition-colors placeholder:text-[#2a2a2a]";

export const selectClass = inputClass + " appearance-none cursor-pointer";

export const textareaClass = inputClass + " min-h-[80px] resize-y";
