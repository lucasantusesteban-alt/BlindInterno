import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  max?: number;
  color?: "red" | "white" | "green";
  size?: "xs" | "sm" | "md";
  className?: string;
  showLabel?: boolean;
}

export function Progress({ value, max = 100, color = "white", size = "sm", className, showLabel }: ProgressProps) {
  const pct = Math.min(100, Math.round((value / max) * 100));

  const colorClass = {
    red: "bg-[#c8102e]",
    white: "bg-[#f0f0ee]",
    green: "bg-green-400",
  }[color];

  const heightClass = {
    xs: "h-0.5",
    sm: "h-1",
    md: "h-2",
  }[size];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("flex-1 bg-[#2a2a2a]", heightClass)}>
        <div
          className={cn("h-full transition-all duration-300", colorClass)}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span
          className="text-[#8c8c8c] text-[9px] w-7 text-right flex-shrink-0"
          style={{ fontFamily: "var(--font-space-mono)" }}
        >
          {pct}%
        </span>
      )}
    </div>
  );
}
