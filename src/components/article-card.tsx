import Link from "next/link";
import type { ArticleRecord } from "@/lib/content/schema";
import { categoryBySlug } from "@content/taxonomy/categories";
import { DifficultyBadge, TypeBadge } from "@/components/ui/badges";
import { Icon } from "@/components/ui/icon";
import { cn, pluralize } from "@/lib/utils";

/** Procedural cover so the design holds even before hero images are authored. */
function Cover({ accent, icon, label }: { accent: string; icon: string; label: string }) {
  return (
    <div
      className="relative aspect-[16/9] w-full overflow-hidden"
      style={{
        background: `radial-gradient(120% 120% at 0% 0%, color-mix(in oklab, ${accent} 55%, #0a0c16), #0a0c16)`,
      }}
    >
      <div
        className="absolute -right-6 -top-6 size-32 rounded-full blur-2xl opacity-50"
        style={{ background: accent }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <Icon name={icon} size={44} style={{ color: accent }} className="opacity-80" />
      </div>
      <span className="absolute bottom-3 left-3 text-[0.7rem] font-medium uppercase tracking-wider text-white/70">
        {label}
      </span>
    </div>
  );
}

export function ArticleCard({
  article,
  variant = "default",
}: {
  article: ArticleRecord;
  variant?: "default" | "featured" | "compact";
}) {
  const cat = categoryBySlug(article.taxonomy.category);
  const accent = cat?.accent ?? "#7c5cff";
  const href = `/article/${article.slug}`;

  if (variant === "compact") {
    return (
      <Link
        href={href}
        className="card-hover group flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
      >
        <div className="mt-0.5 shrink-0 rounded-md p-2" style={{ background: `color-mix(in oklab, ${accent} 16%, transparent)` }}>
          <Icon name={cat?.icon ?? "book"} size={18} style={{ color: accent }} />
        </div>
        <div className="min-w-0">
          <p className="line-clamp-2 text-sm font-medium text-[var(--color-text)] group-hover:text-white">
            {article.title}
          </p>
          <p className="mt-1 text-xs text-[var(--color-text-subtle)]">
            {pluralize(article.readingTime, "min")} read
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "card-hover group flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]",
        variant === "featured" && "md:col-span-2",
      )}
    >
      <Cover accent={accent} icon={cat?.icon ?? "book"} label={cat?.title ?? "Article"} />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <DifficultyBadge difficulty={article.difficulty} />
          <TypeBadge type={article.type} />
          {article.hasPlayground && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[color-mix(in_oklab,var(--color-accent)_18%,transparent)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-accent-soft)]">
              <Icon name="play" size={12} /> Playground
            </span>
          )}
        </div>
        <h3
          className={cn(
            "font-[family-name:var(--font-display)] font-semibold leading-snug text-[var(--color-text)] group-hover:text-white",
            variant === "featured" ? "text-2xl" : "text-lg",
          )}
        >
          {article.title}
        </h3>
        <p className="line-clamp-2 text-sm text-[var(--color-text-muted)]">{article.description}</p>
        <div className="mt-auto flex items-center gap-3 pt-2 text-xs text-[var(--color-text-subtle)]">
          <span className="inline-flex items-center gap-1">
            <Icon name="clock" size={13} /> {pluralize(article.readingTime, "min")}
          </span>
          <span className="inline-flex items-center gap-1 text-[var(--color-accent-2)] opacity-0 transition-opacity group-hover:opacity-100">
            Read <Icon name="arrow" size={13} />
          </span>
        </div>
      </div>
    </Link>
  );
}
