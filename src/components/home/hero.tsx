"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { site } from "@/config/site";
import { Icon } from "@/components/ui/icon";

const fade = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function Hero() {
  return (
    <section className="container-page relative pt-10 pb-16 md:pt-16 md:pb-24">
      <motion.div initial="hidden" animate="show" className="mx-auto max-w-3xl text-center">
        <motion.div custom={0} variants={fade}>
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm text-[var(--color-text-muted)]">
            <span className="size-2 animate-pulse rounded-full bg-[var(--color-success)]" />
            The AI knowledge operating system
          </span>
        </motion.div>

        <motion.h1
          custom={1}
          variants={fade}
          className="mt-6 font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl"
        >
          Learn the systems behind <span className="text-gradient">modern AI</span> — interactively.
        </motion.h1>

        <motion.p
          custom={2}
          variants={fade}
          className="mx-auto mt-6 max-w-2xl text-lg text-[var(--color-text-muted)]"
        >
          {site.name} turns frontier AI, ML, and data engineering into buildable knowledge:
          deep-dive articles, research summaries, guided paths, and model playgrounds that run
          entirely in your browser.
        </motion.p>

        <motion.div custom={3} variants={fade} className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/learn"
            className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] px-6 py-3 font-medium text-white shadow-[var(--shadow-glow)] transition-transform hover:-translate-y-0.5"
          >
            Start learning
            <Icon name="arrow" size={18} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/playgrounds"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-6 py-3 font-medium text-[var(--color-text)] transition-colors hover:border-[var(--color-accent)]"
          >
            <Icon name="play" size={16} /> Try a playground
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4"
      >
        {[
          { k: "Articles", v: "Deep-dives" },
          { k: "Playgrounds", v: "In-browser" },
          { k: "Tutorials", v: "Hands-on" },
          { k: "Categories", v: "Curated" },
        ].map((s) => (
          <div key={s.k} className="glass rounded-[var(--radius-lg)] p-5 text-left">
            <p className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--color-text)]">
              {s.v}
            </p>
            <p className="text-sm text-[var(--color-text-subtle)]">{s.k}</p>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
