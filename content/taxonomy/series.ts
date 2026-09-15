import type { Series } from "@/lib/content/schema";

/**
 * Series metadata. The ordered `articleSlugs` define reading order; the build
 * pipeline cross-checks these against actual articles and warns on mismatch.
 */
export const series: Series[] = [
  {
    slug: "mcp-series",
    title: "The MCP Series",
    description:
      "A ground-up tour of the Model Context Protocol: why it exists, how it works, and how to build with it.",
    taxonomy: { category: "artificial-intelligence", subcategory: "mcp", series: "mcp-series" },
    articleSlugs: ["what-is-mcp", "build-an-mcp-server"],
  },
  {
    slug: "llm-engineering-basics",
    title: "LLM Engineering Basics",
    description: "The core skills for building reliable systems on top of language models.",
    taxonomy: { category: "large-language-models", subcategory: "llm-engineering", series: "llm-engineering-basics" },
    articleSlugs: ["prompting-foundations"],
  },
  {
    slug: "ml-regression-lab",
    title: "ML Regression Lab",
    description:
      "Learn regression by building five deployable projects — from a one-feature line to polynomial curves — each with data prep, training, evaluation, and a Streamlit app.",
    taxonomy: { category: "machine-learning", subcategory: "classical-ml", series: "ml-regression-lab" },
    articleSlugs: [
      "simple-linear-regression-housing",
      "multiple-linear-regression-energy",
      "binary-encoding-insurance",
      "one-hot-encoding-streaming",
      "polynomial-regression-marketing",
    ],
  },
];

export const seriesBySlug = (slug: string) => series.find((s) => s.slug === slug);
