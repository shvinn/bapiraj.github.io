"use client";

import { useEffect, useId, useRef, useState } from "react";

/** Client-only Mermaid renderer. The library is dynamically imported so it
 *  never enters the main bundle and only loads on pages that use diagrams. */
export function Mermaid({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId().replace(/[:]/g, "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          themeVariables: {
            background: "#0a0c16",
            primaryColor: "#10121f",
            primaryBorderColor: "#313861",
            primaryTextColor: "#f4f6ff",
            lineColor: "#7c5cff",
            fontFamily: "var(--font-mono)",
          },
        });
        const { svg } = await mermaid.render(`m-${id}`, chart);
        if (!cancelled && ref.current) ref.current.innerHTML = svg;
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Diagram failed to render");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [chart, id]);

  if (error) {
    return (
      <pre className="rounded-[var(--radius-md)] border border-[var(--color-danger)]/40 bg-[var(--color-surface)] p-4 text-sm text-[var(--color-danger)]">
        Mermaid error: {error}
      </pre>
    );
  }

  return (
    <div
      ref={ref}
      className="my-6 flex justify-center overflow-x-auto rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[#0a0c16] p-4"
      role="img"
      aria-label="Diagram"
    />
  );
}
