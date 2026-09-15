import { readFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import type { ArticleRecord } from "./schema";
import { categories } from "@content/taxonomy/categories";
import { series } from "@content/taxonomy/series";
import generated from "./generated/registry.json";

/* ============================================================================
   CONTENT ACCESS LAYER
   The ONLY module pages import to read content. Today it reads a generated JSON
   registry + MDX files from disk; swapping in a database or CMS means changing
   only this file. Pages/components never touch the storage format directly.
   ========================================================================== */

const ARTICLES_DIR = join(process.cwd(), "content", "articles");

export const allArticles = generated as unknown as ArticleRecord[];

export function getAllArticles(): ArticleRecord[] {
  return allArticles;
}

export function getArticleBySlug(slug: string): ArticleRecord | undefined {
  return allArticles.find((a) => a.slug === slug);
}

/** Raw MDX body (frontmatter stripped) for build-time rendering. */
export function getArticleSource(slug: string): string {
  const raw = readFileSync(join(ARTICLES_DIR, `${slug}.mdx`), "utf8");
  return matter(raw).content;
}

export function getFeatured(limit = 3): ArticleRecord[] {
  const featured = allArticles.filter((a) => a.featured);
  return (featured.length ? featured : allArticles).slice(0, limit);
}

export function getByCategory(categorySlug: string): ArticleRecord[] {
  return allArticles.filter((a) => a.taxonomy.category === categorySlug);
}

export function getBySubcategory(category: string, subcategory: string): ArticleRecord[] {
  return allArticles.filter(
    (a) => a.taxonomy.category === category && a.taxonomy.subcategory === subcategory,
  );
}

export function getPlaygroundArticles(): ArticleRecord[] {
  return allArticles.filter((a) => a.hasPlayground);
}

export function getLatest(limit = 6): ArticleRecord[] {
  return allArticles.slice(0, limit);
}

/** Series resolution: ordered article records for a series slug. */
export function getSeriesArticles(seriesSlug: string): ArticleRecord[] {
  const s = series.find((x) => x.slug === seriesSlug);
  if (!s) return [];
  return s.articleSlugs
    .map((slug) => getArticleBySlug(slug))
    .filter((a): a is ArticleRecord => Boolean(a));
}

/**
 * Related articles: explicit `related` slugs first, then a lightweight
 * tag/taxonomy overlap score. This is the seam where a vector-similarity
 * recommender drops in later.
 */
export function getRelated(slug: string, limit = 3): ArticleRecord[] {
  const article = getArticleBySlug(slug);
  if (!article) return [];

  if (article.related?.length) {
    const explicit = article.related
      .map((s) => getArticleBySlug(s))
      .filter((a): a is ArticleRecord => Boolean(a));
    if (explicit.length) return explicit.slice(0, limit);
  }

  const scored = allArticles
    .filter((a) => a.slug !== slug)
    .map((a) => {
      let score = 0;
      if (a.taxonomy.category === article.taxonomy.category) score += 2;
      if (a.taxonomy.subcategory === article.taxonomy.subcategory) score += 2;
      if (a.taxonomy.series === article.taxonomy.series && article.taxonomy.series) score += 3;
      score += a.tags.filter((t) => article.tags.includes(t)).length;
      return { a, score };
    })
    .filter((x) => x.score > 0)
    .sort((x, y) => y.score - x.score);

  return scored.slice(0, limit).map((x) => x.a);
}

/** "Recommended next" — next article in the series, else top related. */
export function getNextArticle(slug: string): ArticleRecord | undefined {
  const article = getArticleBySlug(slug);
  if (article?.taxonomy.series) {
    const list = getSeriesArticles(article.taxonomy.series);
    const idx = list.findIndex((a) => a.slug === slug);
    if (idx >= 0 && idx < list.length - 1) return list[idx + 1];
  }
  return getRelated(slug, 1)[0];
}

export function getCategoryCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const c of categories) counts[c.slug] = getByCategory(c.slug).length;
  return counts;
}
