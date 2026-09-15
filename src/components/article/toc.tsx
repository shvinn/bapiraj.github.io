"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Heading = { depth: number; text: string; id: string };

/** Table of contents with scroll-spy active-section highlighting. */
export function TableOfContents({ headings }: { headings: Heading[] }) {
  const [active, setActive] = useState<string>(headings[0]?.id ?? "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id);
        }
      },
      { rootMargin: "-90px 0px -70% 0px", threshold: 0 },
    );
    for (const h of headings) {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav aria-label="Table of contents" className="text-sm">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-subtle)]">
        On this page
      </p>
      <ul className="space-y-1 border-l border-[var(--color-border)]">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={cn(
                "-ml-px block border-l-2 py-1 transition-colors",
                h.depth === 3 ? "pl-6" : "pl-4",
                active === h.id
                  ? "border-[var(--color-accent-2)] text-[var(--color-text)]"
                  : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]",
              )}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
