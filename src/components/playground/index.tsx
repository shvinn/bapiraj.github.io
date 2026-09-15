"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

/* ----------------------------------------------------------------------------
   PLAYGROUND REGISTRY
   Maps a playground `kind` (from article frontmatter) to a lazily-loaded
   component. Adding a new playground = one entry here + one component file.
   Each is code-split so a playground's weight never affects other pages.
   -------------------------------------------------------------------------- */

const loader = (
  <div className="my-8 grid h-64 place-items-center rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text-subtle)]">
    Loading playground…
  </div>
);

const registry: Record<string, ComponentType<Record<string, unknown>>> = {
  "logistic-regression": dynamic(
    () =>
      import("./logistic-regression").then((m) => m.LogisticRegressionPlayground),
    { ssr: false, loading: () => loader },
  ) as ComponentType<Record<string, unknown>>,
  // "decision-tree": dynamic(() => import("./decision-tree")...),
  // "neural-network": dynamic(() => import("./neural-network")...),
};

export function Playground({ kind, ...params }: { kind: string } & Record<string, unknown>) {
  const Component = registry[kind];
  if (!Component) {
    return (
      <div className="my-8 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface)] p-6 text-sm text-[var(--color-text-muted)]">
        Playground <code className="text-[var(--color-accent-soft)]">{kind}</code> is not yet
        available.
      </div>
    );
  }
  return <Component {...params} />;
}

export const playgroundKinds = Object.keys(registry);
