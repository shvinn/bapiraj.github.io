import { Hero } from "@/components/home/hero";
import { Section, SectionHeading } from "@/components/ui/section";
import { ArticleCard } from "@/components/article-card";
import { TrendingTopic, PlaygroundShowcaseCard } from "@/components/home/cards";
import {
  getFeatured,
  getLatest,
  getPlaygroundArticles,
  getAllArticles,
} from "@/lib/content";

// Curated trending labels mapped to their tag/category routes.
const TRENDING = [
  { label: "AI Agents", tag: "agents" },
  { label: "MCP", tag: "mcp" },
  { label: "RAG", tag: "rag" },
  { label: "LLM Engineering", tag: "engineering" },
  { label: "Transformers", tag: "transformers" },
  { label: "Prompting", tag: "prompting" },
  { label: "Embeddings", tag: "embeddings" },
  { label: "Classical ML", tag: "classical-ml" },
];

export default function HomePage() {
  const featured = getFeatured(3);
  const latest = getLatest(6);
  const playgrounds = getPlaygroundArticles();
  const all = getAllArticles();

  const tagCount = (tag: string) =>
    all.filter((a) => a.tags.includes(tag) || a.taxonomy.subcategory === tag).length;

  return (
    <>
      <Hero />

      {/* Featured */}
      <Section>
        <SectionHeading
          eyebrow="Featured"
          title="Editor's picks"
          description="Hand-selected deep-dives across the platform."
          href="/learn"
        />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((a, i) => (
            <ArticleCard key={a.slug} article={a} variant={i === 0 ? "featured" : "default"} />
          ))}
        </div>
      </Section>

      {/* Trending */}
      <Section>
        <SectionHeading eyebrow="Trending" title="What people are learning now" />
        <div className="flex flex-wrap gap-2.5">
          {TRENDING.map((t) => (
            <TrendingTopic key={t.tag} label={t.label} count={Math.max(1, tagCount(t.tag))} href={`/search?tag=${t.tag}`} />
          ))}
        </div>
      </Section>

      {/* Playgrounds */}
      <Section>
        <SectionHeading
          eyebrow="Interactive"
          title="Model playgrounds"
          description="Train and probe models live — no install, no backend."
          href="/playgrounds"
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {playgrounds.map((a) => (
            <PlaygroundShowcaseCard key={a.slug} article={a} />
          ))}
        </div>
      </Section>

      {/* Latest */}
      <Section>
        <SectionHeading title="Just published" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {latest.map((a) => (
            <ArticleCard key={a.slug} article={a} variant="compact" />
          ))}
        </div>
      </Section>
    </>
  );
}
