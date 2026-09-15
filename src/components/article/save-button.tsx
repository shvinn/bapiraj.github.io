"use client";

import { useEffect, useState } from "react";
import { getUserDataProvider } from "@/lib/data/provider";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

/** Bookmark toggle. Backed by the data-provider abstraction — local today,
 *  account-synced when auth lands, with no change to this component. */
export function SaveButton({ slug }: { slug: string }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getUserDataProvider().getSaved().then((s) => setSaved(s.includes(slug)));
  }, [slug]);

  const toggle = async () => {
    const next = await getUserDataProvider().toggleSaved(slug);
    setSaved(next.includes(slug));
  };

  return (
    <button
      onClick={toggle}
      aria-pressed={saved}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
        saved
          ? "border-[var(--color-accent)] bg-[color-mix(in_oklab,var(--color-accent)_16%,transparent)] text-[var(--color-accent-soft)]"
          : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]",
      )}
    >
      <Icon name="bookmark" size={16} />
      {saved ? "Saved" : "Save"}
    </button>
  );
}
