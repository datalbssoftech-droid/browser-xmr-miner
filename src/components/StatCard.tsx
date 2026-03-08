import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
}

export const StatCard = ({ label, value, icon: Icon, subtitle, trend }: StatCardProps) => (
  <div className="stat-card group">
    <div className="flex items-start justify-between mb-3">
      <div className="p-2 rounded-lg bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      {trend && (
        <span className={`text-xs font-mono ${trend === "up" ? "text-success" : trend === "down" ? "text-destructive" : "text-muted-foreground"}`}>
          {trend === "up" ? "▲" : trend === "down" ? "▼" : "—"}
        </span>
      )}
    </div>
    <p className="text-2xl font-bold font-mono">{value}</p>
    <p className="text-sm text-muted-foreground mt-1">{label}</p>
    {subtitle && <p className="text-xs text-muted-foreground/70 mt-0.5 font-mono">{subtitle}</p>}
  </div>
);
