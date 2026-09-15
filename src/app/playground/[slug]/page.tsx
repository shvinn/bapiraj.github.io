import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPlaygroundArticles, getArticleBySlug } from "@/lib/content";
import { Playground } from "@/components/playground";
import { DifficultyBadge } from "@/components/ui/badges";
import { Icon } from "@/components/ui/icon";

export function generateStaticParams() {
  return getPlaygroundArticles().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};
  return { title: `${article.title} · Playground`, description: article.description };
}

export default async function PlaygroundPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article || !article.playground) notFound();

  const { kind, params: pgParams } = article.playground;

  return (
    <div className="container-page max-w-5xl">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 pt-4 text-sm text-[var(--color-text-subtle)]">
        <Link href="/playgrounds" className="hover:text-[var(--color-text)]">Playgrounds</Link>
        <Icon name="arrow" size={13} />
        <span className="text-[var(--color-text-muted)]">{article.title}</span>
      </nav>

      <header className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[color-mix(in_oklab,var(--color-accent)_18%,transparent)] px-3 py-1 text-xs font-medium text-[var(--color-accent-soft)]">
              <Icon name="play" size={13} /> Live playground
            </span>
            <DifficultyBadge difficulty={article.difficulty} />
          </div>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight md:text-4xl">
            {article.title}
          </h1>
          <p className="mt-2 max-w-2xl text-[var(--color-text-muted)]">{article.description}</p>
        </div>
        <Link
          href={`/article/${article.slug}`}
          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium hover:border-[var(--color-accent)]"
        >
          <Icon name="book" size={16} /> Read the article
        </Link>
      </header>

      <div className="mt-8">
        <Playground kind={kind} {...(pgParams ?? {})} />
      </div>

      <p className="mt-4 text-center text-xs text-[var(--color-text-subtle)]">
        Runs client-side via the playground runtime. Model assets load from static
        storage — server inference can be added later without changing this page.
      </p>
    </div>
  );
}
