import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getAllArticles,
  getArticleBySlug,
  getArticleSource,
  getRelated,
  getNextArticle,
} from "@/lib/content";
import { categoryBySlug } from "@content/taxonomy/categories";
import { site } from "@/config/site";
import { formatDate, pluralize } from "@/lib/utils";
import { MDXContent } from "@/components/mdx/mdx-content";
import { TableOfContents } from "@/components/article/toc";
import { ReadingProgress } from "@/components/article/reading-progress";
import { SaveButton } from "@/components/article/save-button";
import { AuthorCard, Citations, RelatedArticles } from "@/components/article/meta";
import { DifficultyBadge, TypeBadge } from "@/components/ui/badges";
import { Icon } from "@/components/ui/icon";

export function generateStaticParams() {
  return getAllArticles().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
      publishedTime: article.publishedAt,
      url: `${site.url}/article/${article.slug}`,
    },
    alternates: { canonical: `${site.url}/article/${article.slug}` },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const source = getArticleSource(article.slug);
  const cat = categoryBySlug(article.taxonomy.category);
  const related = getRelated(article.slug, 3);
  const next = getNextArticle(article.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: article.title,
    description: article.description,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    keywords: article.tags.join(", "),
  };

  return (
    <article className="container-page">
      <ReadingProgress slug={article.slug} />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 pt-4 text-sm text-[var(--color-text-subtle)]">
        <Link href="/learn" className="hover:text-[var(--color-text)]">Learn</Link>
        <Icon name="arrow" size={13} />
        {cat && (
          <>
            <Link href={`/learn/${cat.slug}`} className="hover:text-[var(--color-text)]">{cat.title}</Link>
            <Icon name="arrow" size={13} />
          </>
        )}
        <span className="text-[var(--color-text-muted)]">{article.title}</span>
      </nav>

      {/* Header */}
      <header className="mx-auto max-w-3xl pt-8 text-center">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <DifficultyBadge difficulty={article.difficulty} />
          <TypeBadge type={article.type} />
        </div>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold leading-tight tracking-tight md:text-5xl">
          {article.title}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--color-text-muted)]">
          {article.description}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-[var(--color-text-subtle)]">
          <AuthorCard authorId={article.authorId} />
          <span className="inline-flex items-center gap-1.5">
            <Icon name="clock" size={14} /> {pluralize(article.readingTime, "min")} read
          </span>
          <span>{formatDate(article.publishedAt)}</span>
          <SaveButton slug={article.slug} />
        </div>
        {article.repoUrl && (
          <a
            href={article.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-text)] transition-colors hover:border-[var(--color-accent)]"
          >
            <Icon name="github" size={16} /> View source repository
            <Icon name="arrow" size={14} className="text-[var(--color-accent-2)]" />
          </a>
        )}
      </header>

      {/* Body + TOC */}
      <div className="mx-auto mt-12 grid max-w-6xl gap-12 lg:grid-cols-[1fr_240px]">
        <div className="min-w-0 max-w-3xl">
          <div className="prose-hf">
            <MDXContent source={source} />
          </div>
          {article.citations?.length ? <Citations citations={article.citations} /> : null}
          <RelatedArticles related={related} next={next} />
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-28">
            <TableOfContents headings={article.headings} />
          </div>
        </aside>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </article>
  );
}
