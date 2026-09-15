import { z } from "zod";

/* ============================================================================
   CONTENT MODEL — single source of truth.
   Zod gives us (1) runtime validation at build time and (2) inferred TS types,
   so the content layer cannot drift from the presentation layer.
   ========================================================================== */

export const Difficulty = z.enum([
  "beginner",
  "intermediate",
  "advanced",
  "expert",
]);
export type Difficulty = z.infer<typeof Difficulty>;

export const ArticleType = z.enum([
  "tutorial",
  "guide",
  "deep-dive",
  "research-summary",
  "playground",
  "reference",
]);
export type ArticleType = z.infer<typeof ArticleType>;

/** A stable taxonomy node. Category → Subcategory → Series → Article. */
export const TaxonomyRefSchema = z.object({
  category: z.string(), // slug, e.g. "artificial-intelligence"
  subcategory: z.string().optional(), // slug, e.g. "agents"
  series: z.string().optional(), // slug, e.g. "mcp-series"
});
export type TaxonomyRef = z.infer<typeof TaxonomyRefSchema>;

export const AuthorSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string().optional(),
  avatar: z.string().optional(),
  bio: z.string().optional(),
  links: z.record(z.string(), z.string()).optional(),
});
export type Author = z.infer<typeof AuthorSchema>;

export const CitationSchema = z.object({
  title: z.string(),
  authors: z.string().optional(),
  year: z.number().optional(),
  url: z.string().url().optional(),
  venue: z.string().optional(),
});
export type Citation = z.infer<typeof CitationSchema>;

export const PlaygroundConfigSchema = z.object({
  /** Maps to a registered playground component, e.g. "logistic-regression". */
  kind: z.string(),
  /** Static model/data assets the in-browser runtime loads (no backend). */
  assets: z.array(z.string()).optional(),
  /** Free-form params handed to the playground component. */
  params: z.record(z.string(), z.unknown()).optional(),
});
export type PlaygroundConfig = z.infer<typeof PlaygroundConfigSchema>;

/** Frontmatter authored at the top of each MDX file. */
export const ArticleFrontmatterSchema = z.object({
  title: z.string(),
  description: z.string(),
  heroImage: z.string().optional(),
  taxonomy: TaxonomyRefSchema,
  tags: z.array(z.string()).default([]),
  difficulty: Difficulty,
  type: ArticleType.default("guide"),
  authorId: z.string().default("shvinn"),
  publishedAt: z.string(), // ISO date
  updatedAt: z.string().optional(),
  featured: z.boolean().default(false),
  draft: z.boolean().default(false),
  /** Source repository this tutorial reproduces — surfaced for humans + agents. */
  repoUrl: z.string().url().optional(),
  /** Optional explicit related slugs; otherwise inferred by tag/taxonomy. */
  related: z.array(z.string()).optional(),
  citations: z.array(CitationSchema).optional(),
  playground: PlaygroundConfigSchema.optional(),
  /** Override the computed reading time (minutes) if desired. */
  readingTime: z.number().optional(),
});
export type ArticleFrontmatter = z.infer<typeof ArticleFrontmatterSchema>;

/** A fully-resolved article record stored in the generated registry. */
export const ArticleRecordSchema = ArticleFrontmatterSchema.extend({
  slug: z.string(),
  readingTime: z.number(), // resolved (minutes)
  wordCount: z.number(),
  headings: z.array(
    z.object({ depth: z.number(), text: z.string(), id: z.string() }),
  ),
  hasPlayground: z.boolean(),
});
export type ArticleRecord = z.infer<typeof ArticleRecordSchema>;

export const CategorySchema = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  icon: z.string().optional(),
  accent: z.string().optional(), // hex/gradient hint for theming
  subcategories: z.array(
    z.object({
      slug: z.string(),
      title: z.string(),
      description: z.string().optional(),
    }),
  ),
});
export type Category = z.infer<typeof CategorySchema>;

export const SeriesSchema = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  taxonomy: TaxonomyRefSchema,
  /** Ordered list of article slugs. */
  articleSlugs: z.array(z.string()),
});
export type Series = z.infer<typeof SeriesSchema>;

export const LearningPathStepSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  articleSlug: z.string().optional(),
  seriesSlug: z.string().optional(),
});

export const LearningPathSchema = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  difficulty: Difficulty,
  estimatedHours: z.number().optional(),
  icon: z.string().optional(),
  steps: z.array(LearningPathStepSchema),
});
export type LearningPath = z.infer<typeof LearningPathSchema>;

/** The compiled search document — what the search abstraction indexes. */
export const SearchDocSchema = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  body: z.string(), // stripped text for full-text matching
  category: z.string(),
  subcategory: z.string().optional(),
  series: z.string().optional(),
  tags: z.array(z.string()),
  difficulty: Difficulty,
  type: ArticleType,
  publishedAt: z.string(),
  hasPlayground: z.boolean(),
});
export type SearchDoc = z.infer<typeof SearchDocSchema>;
