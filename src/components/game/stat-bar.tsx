import { cn } from "@/lib/utils";

export function StatBar({
  label,
  value,
  max,
  tone = "accent",
}: {
  label: string;
  value: number;
  max: number;
  tone?: "accent" | "danger" | "muted";
}) {
  const pct = max <= 0 ? 0 : Math.max(0, Math.min(100, (value / max) * 100));
  const fill =
    tone === "danger"
      ? "bg-danger"
      : tone === "muted"
        ? "bg-muted"
        : "bg-accent";
  return (
    <div className="min-w-0">
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="text-xs font-medium tracking-wide text-muted">
          {label}
        </span>
        <span className="font-mono text-sm tabular-nums text-fg">
          {Math.round(value)}/{max}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-elevated">
        <div
          className={cn("h-full rounded-full transition-[width] duration-[var(--motion-fast)] ease-[var(--ease-out)]", fill)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
