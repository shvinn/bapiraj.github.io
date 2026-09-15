import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind-aware className combiner. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Prefix internal asset URLs with the configured basePath (GitHub Pages). */
export function withBasePath(path: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  if (!path.startsWith("/")) return path;
  return `${base}${path}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function difficultyColor(d: string): string {
  return (
    {
      beginner: "var(--color-beginner)",
      intermediate: "var(--color-intermediate)",
      advanced: "var(--color-advanced)",
      expert: "var(--color-expert)",
    }[d] ?? "var(--color-text-muted)"
  );
}

export function pluralize(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}
