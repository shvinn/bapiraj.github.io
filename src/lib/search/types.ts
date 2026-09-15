import type { SearchDoc } from "@/lib/content/schema";

/* ============================================================================
   SEARCH ABSTRACTION LAYER
   Components depend on the SearchProvider interface, never on a concrete engine.
   v1 = StaticJsonSearchProvider (client-side index). v2 = a hosted engine
   (Typesense / Meilisearch / Algolia / pgvector) implementing the same
   interface — zero component changes required.
   ========================================================================== */

export interface SearchFilters {
  categories?: string[];
  subcategories?: string[];
  series?: string[];
  tags?: string[];
  difficulty?: string[];
  type?: string[];
  hasPlayground?: boolean;
}

export interface SearchQuery {
  q: string;
  filters?: SearchFilters;
  limit?: number;
}

export interface SearchResult {
  doc: SearchDoc;
  score: number;
  /** Optional highlighted snippet for the result list. */
  snippet?: string;
}

export interface SearchFacets {
  categories: Record<string, number>;
  difficulty: Record<string, number>;
  type: Record<string, number>;
  tags: Record<string, number>;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  facets: SearchFacets;
}

export interface SearchProvider {
  /** Lazily initialize (e.g. fetch the static index). Idempotent. */
  init(): Promise<void>;
  search(query: SearchQuery): Promise<SearchResponse>;
}
