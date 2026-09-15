import type { SearchProvider } from "./types";
import { StaticJsonSearchProvider } from "./static-provider";

export * from "./types";

/**
 * Search factory. Today it always returns the static provider; flipping to a
 * hosted engine is a one-line change here (driven by an env flag), and nothing
 * that consumes `getSearchProvider()` needs to know.
 */
let provider: SearchProvider | null = null;

export function getSearchProvider(): SearchProvider {
  if (provider) return provider;
  // const mode = process.env.NEXT_PUBLIC_SEARCH_MODE; // "static" | "hosted"
  provider = new StaticJsonSearchProvider();
  return provider;
}
