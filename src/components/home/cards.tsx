import Link from "next/link";
import type { ArticleRecord } from "@/lib/content/schema";
import { Icon } from "@/components/ui/icon";

export function TrendingTopic({ label, count, href }: { label: string; count: number; href: string }) {
  return (
    <Link
      href={href}
      className="card-hover group flex items-center justify-between gap-3 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] py-2 pl-4 pr-2 text-sm"
    >
      <span className="font-medium text-[var(--color-text)] group-hover:text-white">#{label}</span>
      <span className="grid size-6 place-items-center rounded-full bg-[var(--color-surface-2)] text-xs text-[var(--color-text-subtle)]">
        {count}
      </span>
    </Link>
  );
}

export function PlaygroundShowcaseCard({ article }: { article: ArticleRecord }) {
  return (
    <Link
      href={`/playground/${article.slug}`}
      className="card-hover group relative flex flex-col gap-3 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
    >
      <div className="absolute -right-8 -top-8 size-28 rounded-full bg-[var(--color-accent)]/20 blur-2xl transition-opacity group-hover:opacity-80" />
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[color-mix(in_oklab,var(--color-accent)_18%,transparent)] px-3 py-1 text-xs font-medium text-[var(--color-accent-soft)]">
        <Icon name="play" size={13} /> Live in browser
      </span>
      <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold group-hover:text-white">
        {article.title}
      </h3>
      <p className="line-clamp-2 text-sm text-[var(--color-text-muted)]">{article.description}</p>
      <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-accent-2)]">
        Open playground <Icon name="arrow" size={15} />
      </span>
    </Link>
  );
}
