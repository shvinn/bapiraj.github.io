/**
 * CONTENT BUILD PIPELINE (the "content layer" → "data layer" bridge).
 *
 * Reads every MDX article, validates frontmatter against the Zod schema, derives
 * reading time / word count / headings, and emits two artifacts:
 *
 *   1. src/lib/content/generated/registry.json  — typed registry for the app
 *   2. public/search-index.json                 — the static search index
 *
 * This is intentionally decoupled from rendering: when the platform goes
 * dynamic, this same script can write to PostgreSQL / a vector store instead of
 * JSON without touching any component.
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, basename } from "node:path";
import matter from "gray-matter";
import { ArticleFrontmatterSchema } from "../src/lib/content/schema";

const ROOT = process.cwd();
const ARTICLES_DIR = join(ROOT, "content", "articles");
const GEN_DIR = join(ROOT, "src", "lib", "content", "generated");
const PUBLIC_DIR = join(ROOT, "public");

const WORDS_PER_MINUTE = 220;

/** github-slugger-compatible heading id (matches rehype-slug for simple text). */
function slugifyHeading(text: string, seen: Map<string, number>): string {
  const base = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
  const count = seen.get(base) ?? 0;
  seen.set(base, count + 1);
  return count === 0 ? base : `${base}-${count}`;
}

function extractHeadings(markdown: string) {
  const seen = new Map<string, number>();
  const headings: { depth: number; text: string; id: string }[] = [];
  // Only top-level (## / ###) headings power the table of contents.
  const re = /^(#{2,3})\s+(.+?)\s*#*$/gm;
  let m: RegExpExecArray | null;
  // Strip fenced code blocks so '#' comments inside code aren't treated as headings.
  const noCode = markdown.replace(/```[\s\S]*?```/g, "");
  while ((m = re.exec(noCode)) !== null) {
    const depth = m[1].length;
    const text = m[2].replace(/[`*_]/g, "").trim();
    headings.push({ depth, text, id: slugifyHeading(text, seen) });
  }
  return headings;
}

function toPlainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_~|-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function build() {
  if (!existsSync(ARTICLES_DIR)) {
    console.warn(`[content] no articles dir at ${ARTICLES_DIR}; emitting empty registry.`);
  }
  const files = existsSync(ARTICLES_DIR)
    ? readdirSync(ARTICLES_DIR).filter((f) => f.endsWith(".mdx"))
    : [];

  const records: unknown[] = [];
  const searchDocs: unknown[] = [];
  let warnings = 0;

  for (const file of files) {
    const slug = basename(file, ".mdx");
    const raw = readFileSync(join(ARTICLES_DIR, file), "utf8");
    const { data, content } = matter(raw);

    const parsed = ArticleFrontmatterSchema.safeParse(data);
    if (!parsed.success) {
      warnings++;
      console.error(`[content] ✗ ${file} failed validation:\n${parsed.error.toString()}`);
      continue;
    }
    const fm = parsed.data;
    if (fm.draft && process.env.NODE_ENV === "production") {
      console.log(`[content] – skipping draft ${file}`);
      continue;
    }

    const plain = toPlainText(content);
    const wordCount = plain.split(/\s+/).filter(Boolean).length;
    const readingTime = fm.readingTime ?? Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE));
    const headings = extractHeadings(content);

    records.push({
      ...fm,
      slug,
      readingTime,
      wordCount,
      headings,
      hasPlayground: Boolean(fm.playground),
    });

    searchDocs.push({
      slug,
      title: fm.title,
      description: fm.description,
      body: plain.slice(0, 4000),
      category: fm.taxonomy.category,
      subcategory: fm.taxonomy.subcategory,
      series: fm.taxonomy.series,
      tags: fm.tags,
      difficulty: fm.difficulty,
      type: fm.type,
      publishedAt: fm.publishedAt,
      hasPlayground: Boolean(fm.playground),
    });
  }

  // Newest first as the default registry order.
  records.sort((a: any, b: any) => (a.publishedAt < b.publishedAt ? 1 : -1));

  mkdirSync(GEN_DIR, { recursive: true });
  mkdirSync(PUBLIC_DIR, { recursive: true });
  writeFileSync(join(GEN_DIR, "registry.json"), JSON.stringify(records, null, 2));
  writeFileSync(join(PUBLIC_DIR, "search-index.json"), JSON.stringify(searchDocs));

  console.log(
    `[content] ✓ ${records.length} articles → registry.json + search-index.json` +
      (warnings ? ` (${warnings} warning(s))` : ""),
  );
}

build();
