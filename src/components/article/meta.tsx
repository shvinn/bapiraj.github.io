import Link from "next/link";
import type { ArticleRecord, Citation } from "@/lib/content/schema";
import { authorById } from "@content/taxonomy/authors";
import { ArticleCard } from "@/components/article-card";
import { Icon } from "@/components/ui/icon";

export function AuthorCard({ authorId }: { authorId: string }) {
  const author = authorById(authorId);
  const handle = author.name.startsWith("@") ? author.name.slice(1) : author.name;
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-11 place-items-center rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-2)] text-white">
        <Icon name="user" size={22} />
      </span>
      <div>
        <p className="text-sm font-medium">
          <span className="text-[var(--color-text-subtle)]">@</span>
          <span className="text-[var(--color-text)]">{handle}</span>
        </p>
        {author.role && <p className="text-xs text-[var(--color-text-subtle)]">{author.role}</p>}
      </div>
    </div>
  );
}

export function Citations({ citations }: { citations: Citation[] }) {
  if (!citations.length) return null;
  return (
    <section className="mt-12 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
      <h2 className="mb-4 flex items-center gap-2 font-[family-name:var(--font-display)] text-lg font-semibold">
        <Icon name="book" size={18} className="text-[var(--color-accent-2)]" /> References
      </h2>
      <ol className="space-y-3 text-sm">
        {citations.map((c, i) => (
          <li key={i} className="flex gap-3 text-[var(--color-text-muted)]">
            <span className="text-[var(--color-text-subtle)]">[{i + 1}]</span>
            <span>
              {c.authors && <span>{c.authors}. </span>}
              {c.url ? (
                <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-[var(--color-text)] underline underline-offset-2 hover:text-[var(--color-accent-2)]">
                  {c.title}
                </a>
              ) : (
                <span className="text-[var(--color-text)]">{c.title}</span>
              )}
              {c.venue && <span> · {c.venue}</span>}
              {c.year && <span> ({c.year})</span>}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function RelatedArticles({ related, next }: { related: ArticleRecord[]; next?: ArticleRecord }) {
  return (
    <div className="mt-16 space-y-10">
      {next && (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-accent-2)]">
            Recommended next
          </p>
          <Link
            href={`/article/${next.slug}`}
            className="card-hover group flex items-center justify-between gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] p-5"
          >
            <div>
              <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold group-hover:text-white">
                {next.title}
              </h3>
              <p className="mt-1 line-clamp-1 text-sm text-[var(--color-text-muted)]">{next.description}</p>
            </div>
            <Icon name="arrow" size={22} className="shrink-0 text-[var(--color-accent-2)] transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      )}

      {related.length > 0 && (
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-subtle)]">
            Related reading
          </p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
