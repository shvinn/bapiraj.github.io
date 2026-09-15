import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { categories, categoryBySlug } from "@content/taxonomy/categories";
import { getByCategory, getBySubcategory } from "@/lib/content";
import { ArticleCard } from "@/components/article-card";
import { Section } from "@/components/ui/section";
import { Icon } from "@/components/ui/icon";
import { pluralize } from "@/lib/utils";

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const cat = categoryBySlug(category);
  if (!cat) return {};
  return { title: cat.title, description: cat.description };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = categoryBySlug(category);
  if (!cat) notFound();

  const articles = getByCategory(cat.slug);

  return (
    <>
      {/* Category hero */}
      <section className="container-page pt-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-[var(--color-text-subtle)]">
          <Link href="/learn" className="hover:text-[var(--color-text)]">Learn</Link>
          <Icon name="arrow" size={13} />
          <span className="text-[var(--color-text-muted)]">{cat.title}</span>
        </nav>

        <div
          className="relative mt-5 overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] p-8 md:p-12"
          style={{ background: `radial-gradient(120% 140% at 0% 0%, color-mix(in oklab, ${cat.accent} 30%, var(--color-surface)), var(--color-surface))` }}
        >
          <span
            className="grid size-14 place-items-center rounded-[var(--radius-lg)]"
            style={{ background: `color-mix(in oklab, ${cat.accent} 22%, transparent)`, color: cat.accent }}
          >
            <Icon name={cat.icon ?? "book"} size={28} />
          </span>
          <h1 className="mt-5 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight md:text-5xl">
            {cat.title}
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-[var(--color-text-muted)]">{cat.description}</p>
          <p className="mt-4 text-sm text-[var(--color-text-subtle)]">{pluralize(articles.length, "article")}</p>
        </div>
      </section>

      {/* Subcategory navigation */}
      <Section className="!pb-0">
        <div className="flex flex-wrap gap-2">
          {cat.subcategories.map((s) => (
            <a
              key={s.slug}
              href={`#${s.slug}`}
              className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)]"
            >
              {s.title}
            </a>
          ))}
        </div>
      </Section>

      {/* Articles by subcategory */}
      {cat.subcategories.map((sub) => {
        const subArticles = getBySubcategory(cat.slug, sub.slug);
        if (subArticles.length === 0) return null;
        return (
          <Section key={sub.slug}>
            <div id={sub.slug} className="mb-6 scroll-mt-28">
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold">{sub.title}</h2>
              {sub.description && <p className="mt-1 text-[var(--color-text-muted)]">{sub.description}</p>}
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {subArticles.map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>
          </Section>
        );
      })}
    </>
  );
}
