"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getSearchProvider, type SearchResult } from "@/lib/search";
import { Icon } from "@/components/ui/icon";
import { DifficultyBadge } from "@/components/ui/badges";

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 30);
      getSearchProvider().init();
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true);
    const t = setTimeout(async () => {
      const res = await getSearchProvider().search({ q, limit: 8 });
      if (active) {
        setResults(res.results);
        setLoading(false);
      }
    }, 120);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [q, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 px-4 pt-[12vh] backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <div
        className="glass w-full max-w-2xl overflow-hidden rounded-[var(--radius-lg)] shadow-[var(--shadow-glow)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-[var(--color-border)] px-4">
          <Icon name="search" size={18} className="text-[var(--color-text-subtle)]" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search articles, topics, playgrounds…"
            className="flex-1 bg-transparent py-4 text-base text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-subtle)]"
          />
          <kbd className="rounded border border-[var(--color-border)] px-1.5 py-0.5 text-[0.65rem] text-[var(--color-text-subtle)]">
            esc
          </kbd>
        </div>

        <div className="max-h-[55vh] overflow-y-auto p-2">
          {loading && <p className="px-3 py-6 text-sm text-[var(--color-text-subtle)]">Searching…</p>}
          {!loading && results.length === 0 && (
            <p className="px-3 py-6 text-sm text-[var(--color-text-subtle)]">
              {q ? "No matches found." : "Type to search the knowledge base."}
            </p>
          )}
          <ul>
            {results.map((r) => (
              <li key={r.doc.slug}>
                <Link
                  href={`/article/${r.doc.slug}`}
                  onClick={onClose}
                  className="flex items-start gap-3 rounded-[var(--radius-md)] px-3 py-2.5 hover:bg-[var(--color-surface-2)]"
                >
                  <Icon name="book" size={16} className="mt-1 text-[var(--color-accent-2)]" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium text-[var(--color-text)]">{r.doc.title}</p>
                      <DifficultyBadge difficulty={r.doc.difficulty} />
                    </div>
                    <p className="line-clamp-1 text-sm text-[var(--color-text-muted)]">
                      {r.snippet ?? r.doc.description}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between border-t border-[var(--color-border)] px-4 py-2.5 text-xs text-[var(--color-text-subtle)]">
          <span>Static index · client-side</span>
          <Link href="/search" onClick={onClose} className="hover:text-[var(--color-text)]">
            Advanced search →
          </Link>
        </div>
      </div>
    </div>
  );
}
