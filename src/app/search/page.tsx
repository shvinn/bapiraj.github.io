"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getSearchProvider, type SearchResponse } from "@/lib/search";
import { Icon } from "@/components/ui/icon";
import { DifficultyBadge, TypeBadge } from "@/components/ui/badges";
import { cn } from "@/lib/utils";

const DIFFICULTIES = ["beginner", "intermediate", "advanced", "expert"];
const TYPES = ["guide", "tutorial", "deep-dive", "research-summary", "playground", "reference"];

function SearchInner() {
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get("q") ?? "");
  const [difficulty, setDifficulty] = useState<string[]>([]);
  const [type, setType] = useState<string[]>([]);
  const [onlyPlayground, setOnlyPlayground] = useState(false);
  const [res, setRes] = useState<SearchResponse | null>(null);

  const initialTag = useMemo(() => sp.get("tag") ?? undefined, [sp]);

  useEffect(() => {
    let active = true;
    const run = async () => {
      const r = await getSearchProvider().search({
        q,
        filters: {
          difficulty: difficulty.length ? difficulty : undefined,
          type: type.length ? type : undefined,
          tags: initialTag ? [initialTag] : undefined,
          hasPlayground: onlyPlayground || undefined,
        },
        limit: 50,
      });
      if (active) setRes(r);
    };
    const t = setTimeout(run, 120);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [q, difficulty, type, onlyPlayground, initialTag]);

  const toggle = (arr: string[], set: (v: string[]) => void, v: string) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  return (
    <div className="container-page grid gap-10 py-8 lg:grid-cols-[260px_1fr]">
      {/* Filters */}
      <aside className="space-y-7">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">Search</h1>

        <FilterGroup title="Difficulty">
          {DIFFICULTIES.map((d) => (
            <FilterChip key={d} active={difficulty.includes(d)} onClick={() => toggle(difficulty, setDifficulty, d)}>
              <span className="capitalize">{d}</span>
              {res?.facets.difficulty[d] ? <Count n={res.facets.difficulty[d]} /> : null}
            </FilterChip>
          ))}
        </FilterGroup>

        <FilterGroup title="Type">
          {TYPES.map((t) => (
            <FilterChip key={t} active={type.includes(t)} onClick={() => toggle(type, setType, t)}>
              <span className="capitalize">{t.replace("-", " ")}</span>
              {res?.facets.type[t] ? <Count n={res.facets.type[t]} /> : null}
            </FilterChip>
          ))}
        </FilterGroup>

        <FilterGroup title="Features">
          <FilterChip active={onlyPlayground} onClick={() => setOnlyPlayground((v) => !v)}>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="play" size={13} /> Has playground
            </span>
          </FilterChip>
        </FilterGroup>
      </aside>

      {/* Results */}
      <div>
        <div className="glass flex items-center gap-3 rounded-[var(--radius-lg)] px-4">
          <Icon name="search" size={18} className="text-[var(--color-text-subtle)]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search the knowledge base…"
            className="flex-1 bg-transparent py-3.5 text-base outline-none placeholder:text-[var(--color-text-subtle)]"
            autoFocus
          />
        </div>

        {initialTag && (
          <p className="mt-3 text-sm text-[var(--color-text-muted)]">
            Filtering by tag <span className="text-[var(--color-accent-soft)]">#{initialTag}</span>
          </p>
        )}

        <p className="mt-4 text-sm text-[var(--color-text-subtle)]">
          {res ? `${res.total} result${res.total === 1 ? "" : "s"}` : "Searching…"}
        </p>

        <ul className="mt-3 space-y-3">
          {res?.results.map((r) => (
            <li key={r.doc.slug}>
              <Link
                href={`/article/${r.doc.slug}`}
                className="card-hover block rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <DifficultyBadge difficulty={r.doc.difficulty} />
                  <TypeBadge type={r.doc.type} />
                  {r.doc.hasPlayground && (
                    <span className="inline-flex items-center gap-1 text-xs text-[var(--color-accent-soft)]">
                      <Icon name="play" size={12} /> Playground
                    </span>
                  )}
                </div>
                <h3 className="mt-2 font-[family-name:var(--font-display)] text-lg font-semibold">{r.doc.title}</h3>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">{r.snippet ?? r.doc.description}</p>
              </Link>
            </li>
          ))}
        </ul>

        {res && res.total === 0 && (
          <p className="mt-10 text-center text-[var(--color-text-muted)]">
            No results. Try fewer filters or a different query.
          </p>
        )}
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-subtle)]">{title}</h2>
      <div className="flex flex-col gap-1.5">{children}</div>
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-between rounded-[var(--radius-sm)] border px-3 py-1.5 text-sm transition-colors",
        active
          ? "border-[var(--color-accent)] bg-[color-mix(in_oklab,var(--color-accent)_14%,transparent)] text-[var(--color-text)]"
          : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)]",
      )}
    >
      {children}
    </button>
  );
}

function Count({ n }: { n: number }) {
  return <span className="ml-2 rounded-full bg-[var(--color-surface-2)] px-1.5 text-xs text-[var(--color-text-subtle)]">{n}</span>;
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container-page py-12 text-[var(--color-text-muted)]">Loading search…</div>}>
      <SearchInner />
    </Suspense>
  );
}
