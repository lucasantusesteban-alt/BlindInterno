import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  accent?: boolean;
}

export function Card({ children, className, hover, accent }: CardProps) {
  return (
    <div
      className={cn(
        "bg-[#111111] border border-[#2a2a2a] relative",
        hover && "hover:border-[#3a3a3a] transition-colors cursor-pointer",
        accent && "border-l-2 border-l-[#c8102e]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("px-4 py-3 border-b border-[#2a2a2a] flex items-center justify-between", className)}>
      {children}
    </div>
  );
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("p-4", className)}>{children}</div>;
}
