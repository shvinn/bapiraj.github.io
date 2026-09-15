"use client";

import { useEffect, useState } from "react";
import { getUserDataProvider } from "@/lib/data/provider";

/** Top-of-page reading progress bar. Persists progress via the data provider
 *  so a future account system can sync it server-side unchanged. */
export function ReadingProgress({ slug }: { slug: string }) {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const el = document.documentElement;
        const max = el.scrollHeight - el.clientHeight;
        const p = max > 0 ? Math.min(100, (el.scrollTop / max) * 100) : 0;
        setPct(p);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Persist coarse progress occasionally.
  useEffect(() => {
    const id = setInterval(() => {
      if (pct > 1) getUserDataProvider().setProgress(slug, Math.round(pct));
    }, 4000);
    return () => clearInterval(id);
  }, [pct, slug]);

  return (
    <div className="fixed inset-x-0 top-0 z-[60] h-0.5 bg-transparent" aria-hidden>
      <div
        className="h-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] transition-[width] duration-150"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
