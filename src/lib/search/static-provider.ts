import type { SearchDoc } from "@/lib/content/schema";
import type {
  SearchFacets,
  SearchProvider,
  SearchQuery,
  SearchResponse,
  SearchResult,
} from "./types";
import { withBasePath } from "@/lib/utils";

/**
 * v1 search: fetch the static JSON index once, score in-memory with a simple
 * field-weighted token match. Good enough for thousands of docs; swap for a
 * hosted engine via the same SearchProvider interface when the corpus grows.
 */
export class StaticJsonSearchProvider implements SearchProvider {
  private docs: SearchDoc[] | null = null;
  private loading: Promise<void> | null = null;

  constructor(private indexUrl = withBasePath("/search-index.json")) {}

  init(): Promise<void> {
    if (this.docs) return Promise.resolve();
    if (this.loading) return this.loading;
    this.loading = fetch(this.indexUrl)
      .then((r) => r.json())
      .then((data: SearchDoc[]) => {
        this.docs = data;
      });
    return this.loading;
  }

  async search(query: SearchQuery): Promise<SearchResponse> {
    await this.init();
    const docs = this.docs ?? [];
    const { q, filters, limit = 20 } = query;

    const filtered = docs.filter((d) => matchesFilters(d, filters));
    const facets = computeFacets(filtered);

    const terms = tokenize(q);
    let results: SearchResult[];

    if (terms.length === 0) {
      // No query → recency-ordered browse of the filtered set.
      results = filtered
        .slice()
        .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
        .map((doc) => ({ doc, score: 0 }));
    } else {
      results = filtered
        .map((doc) => scoreDoc(doc, terms))
        .filter((r): r is SearchResult => r !== null)
        .sort((a, b) => b.score - a.score);
    }

    return { results: results.slice(0, limit), total: results.length, facets };
  }
}

function tokenize(s: string): string[] {
  return s.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 1);
}

function matchesFilters(d: SearchDoc, f?: SearchQuery["filters"]): boolean {
  if (!f) return true;
  if (f.categories?.length && !f.categories.includes(d.category)) return false;
  if (f.subcategories?.length && (!d.subcategory || !f.subcategories.includes(d.subcategory)))
    return false;
  if (f.series?.length && (!d.series || !f.series.includes(d.series))) return false;
  if (f.difficulty?.length && !f.difficulty.includes(d.difficulty)) return false;
  if (f.type?.length && !f.type.includes(d.type)) return false;
  if (f.hasPlayground && !d.hasPlayground) return false;
  if (f.tags?.length && !f.tags.some((t) => d.tags.includes(t))) return false;
  return true;
}

function scoreDoc(doc: SearchDoc, terms: string[]): SearchResult | null {
  const title = doc.title.toLowerCase();
  const desc = doc.description.toLowerCase();
  const body = doc.body.toLowerCase();
  const tags = doc.tags.join(" ").toLowerCase();

  let score = 0;
  let matched = 0;
  for (const t of terms) {
    let hit = false;
    if (title.includes(t)) { score += 10; hit = true; }
    if (tags.includes(t)) { score += 6; hit = true; }
    if (desc.includes(t)) { score += 4; hit = true; }
    if (body.includes(t)) { score += 1; hit = true; }
    if (hit) matched++;
  }
  if (matched === 0) return null;
  // Reward docs matching more of the distinct query terms.
  score *= 1 + matched / terms.length;

  return { doc, score, snippet: makeSnippet(doc.description || doc.body, terms) };
}

function makeSnippet(text: string, terms: string[]): string {
  const lower = text.toLowerCase();
  const idx = terms.map((t) => lower.indexOf(t)).filter((i) => i >= 0).sort((a, b) => a - b)[0] ?? 0;
  const start = Math.max(0, idx - 40);
  return (start > 0 ? "…" : "") + text.slice(start, start + 160).trim() + "…";
}

function computeFacets(docs: SearchDoc[]): SearchFacets {
  const facets: SearchFacets = { categories: {}, difficulty: {}, type: {}, tags: {} };
  for (const d of docs) {
    facets.categories[d.category] = (facets.categories[d.category] ?? 0) + 1;
    facets.difficulty[d.difficulty] = (facets.difficulty[d.difficulty] ?? 0) + 1;
    facets.type[d.type] = (facets.type[d.type] ?? 0) + 1;
    for (const t of d.tags) facets.tags[t] = (facets.tags[t] ?? 0) + 1;
  }
  return facets;
}
