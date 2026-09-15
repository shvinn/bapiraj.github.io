import Link from "next/link";
import type { Metadata } from "next";
import { categories } from "@content/taxonomy/categories";
import { getCategoryCounts, getLatest } from "@/lib/content";
import { Section, SectionHeading } from "@/components/ui/section";
import { ArticleCard } from "@/components/article-card";
import { Icon } from "@/components/ui/icon";
import { pluralize } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Learn",
  description: "Browse the hundredfolds knowledge base by category.",
};

export default function LearnPage() {
  const counts = getCategoryCounts();
  const latest = getLatest(6);

  return (
    <>
      <Section>
        <SectionHeading
          eyebrow="Knowledge base"
          title="Explore by category"
          description="Five domains, each broken into focused subcategories and series."
        />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/learn/${c.slug}`}
              className="card-hover group relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
            >
              <div
                className="absolute -right-10 -top-10 size-32 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-40"
                style={{ background: c.accent }}
              />
              <span
                className="grid size-12 place-items-center rounded-[var(--radius-md)]"
                style={{ background: `color-mix(in oklab, ${c.accent} 18%, transparent)`, color: c.accent }}
              >
                <Icon name={c.icon ?? "book"} size={24} />
              </span>
              <h3 className="mt-4 font-[family-name:var(--font-display)] text-xl font-semibold group-hover:text-white">
                {c.title}
              </h3>
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">{c.description}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {c.subcategories.map((s) => (
                  <span key={s.slug} className="rounded-full bg-[var(--color-surface-2)] px-2.5 py-0.5 text-xs text-[var(--color-text-subtle)]">
                    {s.title}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-xs text-[var(--color-text-subtle)]">
                {pluralize(counts[c.slug] ?? 0, "article")}
              </p>
            </Link>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading title="Recently published" />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {latest.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      </Section>
    </>
  );
}
