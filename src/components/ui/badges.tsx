import { cn, difficultyColor } from "@/lib/utils";

export function DifficultyBadge({ difficulty, className }: { difficulty: string; className?: string }) {
  const color = difficultyColor(difficulty);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        className,
      )}
      style={{ color, background: `color-mix(in oklab, ${color} 14%, transparent)` }}
    >
      <span className="size-1.5 rounded-full" style={{ background: color }} />
      {difficulty}
    </span>
  );
}

export function TypeBadge({ type, className }: { type: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-text-muted)] capitalize",
        className,
      )}
    >
      {type.replace("-", " ")}
    </span>
  );
}

export function Pill({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-xs text-[var(--color-text-muted)]",
        className,
      )}
    >
      {children}
    </span>
  );
}
