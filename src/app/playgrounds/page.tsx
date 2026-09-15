import type { Metadata } from "next";
import { getPlaygroundArticles } from "@/lib/content";
import { Section, SectionHeading } from "@/components/ui/section";
import { PlaygroundShowcaseCard } from "@/components/home/cards";

export const metadata: Metadata = {
  title: "Playgrounds",
  description: "Interactive, in-browser model demonstrations — train and probe models with zero setup.",
};

export default function PlaygroundsPage() {
  const playgrounds = getPlaygroundArticles();
  return (
    <Section>
      <SectionHeading
        eyebrow="Interactive"
        title="Model playgrounds"
        description="Every playground runs entirely in your browser — no install, no account, no backend. Built on a runtime that can switch to server inference later without changing the lesson."
      />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {playgrounds.map((a) => (
          <PlaygroundShowcaseCard key={a.slug} article={a} />
        ))}
      </div>
    </Section>
  );
}
