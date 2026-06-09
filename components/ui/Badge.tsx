import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "red" | "gray" | "white" | "border" | "green" | "yellow" | "blue" | "orange";
  size?: "xs" | "sm";
  className?: string;
  pulse?: boolean;
}

const variantClasses = {
  red: "bg-[#c8102e] text-[#f0f0ee]",
  gray: "bg-[#2a2a2a] text-[#8c8c8c]",
  white: "bg-[#f0f0ee] text-[#050505]",
  border: "border border-[#2a2a2a] text-[#8c8c8c]",
  green: "bg-green-900/50 text-green-300",
  yellow: "bg-yellow-900/50 text-yellow-300",
  blue: "bg-blue-900/50 text-blue-300",
  orange: "bg-orange-900/50 text-orange-300",
};

const sizeClasses = {
  xs: "text-[9px] px-1.5 py-0.5 tracking-[0.12em]",
  sm: "text-[10px] px-2 py-0.5 tracking-[0.1em]",
};

export function Badge({ children, variant = "gray", size = "sm", className, pulse }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-bold uppercase",
        "font-mono",
        variantClasses[variant],
        sizeClasses[size],
        pulse && "animate-pulse",
        className
      )}
      style={{ fontFamily: "var(--font-space-mono)" }}
    >
      {children}
    </span>
  );
}
