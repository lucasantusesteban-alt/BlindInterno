import { cn } from "@/lib/utils";
import type { User } from "@/lib/types";

interface AvatarProps {
  user: User;
  size?: "xs" | "sm" | "md" | "lg";
  showName?: boolean;
  className?: string;
}

const sizeClasses = {
  xs: "w-5 h-5 text-[8px]",
  sm: "w-7 h-7 text-[10px]",
  md: "w-9 h-9 text-xs",
  lg: "w-12 h-12 text-sm",
};

export function Avatar({ user, size = "sm", showName, className }: AvatarProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        className={cn(
          "flex items-center justify-center flex-shrink-0 font-bold",
          sizeClasses[size]
        )}
        style={{
          background: user.color === "#f0f0ee" ? "#2a2a2a" : user.color,
          color: "#f0f0ee",
          fontFamily: "var(--font-space-mono)",
        }}
        title={user.name}
      >
        {user.initials}
      </span>
      {showName && (
        <span className="text-[#f0f0ee] text-sm font-medium">{user.name}</span>
      )}
    </div>
  );
}
