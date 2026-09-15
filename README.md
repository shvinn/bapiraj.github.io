# Hundredfolds

**An AI knowledge operating system** — a futuristic learning platform for AI, ML,
data, and software engineering. Interactive articles, research summaries, guided
learning paths, and in-browser model playgrounds.

Static-first (deploys to GitHub Pages today), architected to evolve into a
dynamic, personalized platform without a rewrite. Full design is in
[ARCHITECTURE.md](./ARCHITECTURE.md).

## Quickstart

```bash
npm install
npm run dev          # http://localhost:3000
```

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Dev server (regenerates content registry first) |
| `npm run build` | Static export to `./out` (GitHub Pages-ready) |
| `npm run typecheck` | Strict TypeScript check |
| `npm run content` | Rebuild content registry + search index only |

## Stack

Next.js 15 (App Router, `output: 'export'`) · TypeScript · Tailwind CSS v4 ·
MDX · Shiki syntax highlighting · Mermaid · Motion · Zod.

## Authoring an article

Create `content/articles/<slug>.mdx`:

```mdx
---
title: "My Article"
description: "One-line summary."
taxonomy: { category: machine-learning, subcategory: classical-ml }
tags: ["ml"]
difficulty: beginner
type: guide
publishedAt: "2026-06-14"
featured: false
---

Body in **MDX**. Code, ```mermaid``` diagrams, LaTeX math (`$inline$` and
`$$display$$`, rendered with KaTeX), and `<Playground kind="..." />` all work.
```

Frontmatter is validated against the Zod schema at build time; the article is
indexed, routed, and added to the sitemap automatically.

## Deploy

Push to `main` → GitHub Actions builds and publishes `out/` to GitHub Pages.
Custom domain is set in `public/CNAME`. For a project-subpath deployment set
`NEXT_PUBLIC_BASE_PATH=/blog` in the build step.

## Project layout

```
content/        Articles (MDX) + taxonomy (categories, series, paths, authors)
src/app/        Routes (static export)
src/components/ UI + feature components
src/lib/        content · search · data layers (each behind an interface)
scripts/        Content build pipeline
```
