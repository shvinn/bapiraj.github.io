# Hundredfolds — Architecture & Design

> An AI knowledge operating system. Static-first (GitHub Pages today), built to
> evolve into a dynamic, personalized platform without a rewrite.

This document is the canonical reference for the platform. It covers all 17
deliverables. Everything described here is implemented and builds to a static
export (`npm run build` → `out/`).

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · MDX
(`next-mdx-remote/rsc`) · `rehype-pretty-code` (Shiki) · Mermaid · Motion · Zod.

---

## 1. Information Architecture

The content hierarchy is four levels deep, exactly as specified:

```
Category → Subcategory → Series → Article
```

- **Category** (5) — top-level domains: AI, LLMs, ML, Data Engineering, SWE.
- **Subcategory** (3 each) — focused areas (e.g. Agents, MCP, RAG).
- **Series** — ordered multi-part article sequences within a subcategory.
- **Article** — the atomic unit; the MDX document + its metadata.

Cross-cutting organizers sit alongside the taxonomy:

- **Learning Paths** — curated journeys that reference articles/series across
  categories (a *view*, not a place in the tree).
- **Tags** — flat, many-to-many labels powering trending + faceted search.
- **Article types** — `tutorial | guide | deep-dive | research-summary |
  playground | reference` — drive specialized surfaces (Research, Playgrounds).

The taxonomy is data, not code: `content/taxonomy/{categories,series,authors,learning-paths}.ts`.
Editing those files reshapes navigation, routing, and footers automatically.

---

## 2. Sitemap

```
/                                 Home (AI learning portal)
/learn                            Knowledge base index (all categories)
/learn/[category]                 Category page (subcats, series, articles)
/article/[slug]                   Article reader (MDX, TOC, playgrounds)
/paths                            Learning paths index
/paths/[slug]                     Path detail (ordered steps)
/playgrounds                      Interactive demos index
/playground/[slug]                Focused playground experience
/research                         Research-summary stream
/search                           Faceted search (filters + facets)
/sitemap.xml                      Generated (app/sitemap.ts)
/robots.txt                       Generated (app/robots.ts)
/404                              Not-found
```

A machine-readable `sitemap.xml` is generated at build time from the content
registry (`src/app/sitemap.ts`).

---

## 3. Component Hierarchy

```
RootLayout (app/layout.tsx)         fonts, metadata, aurora backdrop, skip-link
├─ Header (client)                  nav · ⌘K search trigger · theme toggle
│  └─ SearchDialog (client)         command-palette over SearchProvider
├─ main
│  └─ <page>
│     ├─ Home
│     │  ├─ Hero (client, Motion)
│     │  ├─ Section + SectionHeading
│     │  ├─ ArticleCard ×N          (default | featured | compact)
│     │  ├─ TrendingTopic ×N
│     │  ├─ LearningPathCard ×N
│     │  └─ PlaygroundShowcaseCard ×N
│     ├─ CategoryPage               hero · subcat nav · series · article grids
│     ├─ ArticlePage
│     │  ├─ ReadingProgress (client)
│     │  ├─ Breadcrumb · header · AuthorCard · SaveButton (client)
│     │  ├─ MDXContent (server)
│     │  │  ├─ rehype-pretty-code   syntax highlighting
│     │  │  ├─ Mermaid (client)     diagrams (lazy)
│     │  │  └─ Playground (client)  in-body demos (lazy, code-split)
│     │  ├─ Citations
│     │  ├─ RelatedArticles + "Recommended next"
│     │  └─ TableOfContents (client) scroll-spy
│     ├─ PlaygroundPage             Playground registry → lazy component
│     └─ SearchPage (client)        filters · facets · results
└─ Footer                           brand · explore · categories · project
```

Primitives live in `src/components/ui/` (`icon`, `badges`, `section`). Feature
components are grouped by domain (`home/`, `article/`, `mdx/`, `playground/`,
`search/`, `layout/`).

---

## 4. Folder Structure

```
blog/
├─ content/                        CONTENT LAYER (authoring)
│  ├─ articles/*.mdx               article bodies + frontmatter
│  └─ taxonomy/                    categories, series, authors, learning-paths
├─ scripts/
│  └─ build-content.ts             content → generated registry + search index
├─ src/
│  ├─ app/                         ROUTING LAYER (App Router, static export)
│  │  ├─ layout.tsx, page.tsx, globals.css
│  │  ├─ learn/[category]/, article/[slug]/, playground/[slug]/, paths/[slug]/
│  │  ├─ playgrounds/, research/, search/
│  │  └─ sitemap.ts, robots.ts, not-found.tsx
│  ├─ components/                  PRESENTATION LAYER
│  ├─ lib/
│  │  ├─ content/                  content access layer + Zod schema + generated/
│  │  ├─ search/                   SEARCH LAYER (provider abstraction)
│  │  ├─ data/                     DATA LAYER (user-data provider abstraction)
│  │  ├─ mdx/                      rehype plugins
│  │  └─ utils.ts
│  └─ config/site.ts              branding + SEO config
├─ public/                         CNAME, .nojekyll, search-index.json (generated)
├─ .github/workflows/deploy.yml    CI → GitHub Pages
└─ next.config.mjs                 output: 'export'
```

The five layers the brief asked to separate are physically separated:
**content** (`content/`), **presentation** (`src/components/`), **data**
(`src/lib/data/` + `src/lib/content/`), **routing** (`src/app/`), **search**
(`src/lib/search/`).

---

## 5. Content Model Schema

Single source of truth: `src/lib/content/schema.ts` (Zod → inferred TS types).
Frontmatter is validated at build time; an invalid article fails the build.

```ts
ArticleFrontmatter {
  title, description, heroImage?
  taxonomy: { category, subcategory?, series? }
  tags: string[]
  difficulty: beginner | intermediate | advanced | expert
  type: tutorial | guide | deep-dive | research-summary | playground | reference
  authorId
  publishedAt, updatedAt?
  featured, draft
  related?: slug[]            // explicit related override
  citations?: Citation[]      // research references
  playground?: { kind, assets?, params? }
  readingTime?                // override; otherwise derived
}
```

The build pipeline derives and adds: `slug`, `readingTime`, `wordCount`,
`headings[]` (for the TOC), and `hasPlayground`, producing an `ArticleRecord`.
Every metadata field the brief required (title, description, hero image,
category, tags, difficulty, reading time, publish date, last updated, related
content, featured flag) is present.

Supporting models: `Category`, `Series`, `LearningPath`, `Author`, `Citation`,
`PlaygroundConfig`, and `SearchDoc` (the indexed projection).

---

## 6. Design System

Defined as CSS variables in `src/app/globals.css` and exposed to Tailwind v4 via
`@theme`, so tokens are usable as utilities and themeable at runtime
(`[data-theme]`). Dark-first; light is an opt-in override.

- **Surfaces:** layered scale `bg → bg-elevated → surface → surface-2` with two
  border weights for depth.
- **Glassmorphism:** `.glass` utility (blur + saturate + translucent border).
- **Depth:** `--shadow-soft`, `--shadow-glow`; `.card-hover` lift-on-hover.
- **Ambient:** `.bg-aurora` fixed radial-gradient backdrop (the "OS" feel).
- **Gradient accents:** `.text-gradient` violet→cyan→magenta.
- **Radii & motion:** standardized radius scale; `--ease-out-soft` easing;
  `prefers-reduced-motion` fully honored.
- **Bento layouts:** responsive grids on home/category/research surfaces.

---

## 7. Color Palette

| Token | Hex | Use |
|---|---|---|
| `bg` | `#06070d` | App background |
| `surface` / `surface-2` | `#10121f` / `#161a2b` | Cards, controls |
| `border` / `border-strong` | `#232842` / `#313861` | Dividers, hover |
| `text` / `muted` / `subtle` | `#f4f6ff` / `#aab1cf` / `#6b7299` | Text scale |
| `accent` (violet) | `#7c5cff` | Primary brand |
| `accent-2` (cyan) | `#00d4ff` | Secondary / links |
| `accent-3` (magenta) | `#ff5ca8` | Tertiary gradient stop |
| `success / warning / danger` | `#2dd4a7 / #ffb43d / #ff5c7a` | Status |

**Difficulty scale** (also used as semantic status): beginner `#2dd4a7`,
intermediate `#00d4ff`, advanced `#ffb43d`, expert `#ff5c7a`.

---

## 8. Typography

| Role | Family | Where |
|---|---|---|
| Display | **Space Grotesk** | Headings, hero, card titles |
| Body/UI | **Inter** | Paragraphs, navigation, controls |
| Mono | **JetBrains Mono** | Code, metrics, kbd |

Loaded via `next/font/google` (self-hosted at build, zero layout shift,
`display: swap`). Exposed as `--font-display/-sans/-mono`. Article body styles
live in the `.prose-hf` system (headings, lists, blockquotes, inline code,
fenced code, pretty-code line highlighting).

---

## 9. Homepage Wireframe

```
┌───────────────────────────────────────────────┐
│ Header: logo · Learn Paths Playgrounds Research · ⌘K · ☼ │
├───────────────────────────────────────────────┤
│            ● The AI knowledge OS  (pill)        │
│     LEARN THE SYSTEMS BEHIND **modern AI**      │  Hero
│              mission statement                  │  (animated)
│     [ Start learning → ]  [ ▷ Try a playground ]│
│   [Deep-dives][In-browser][Guided][Summarized]  │  glass stats
├───────────────────────────────────────────────┤
│ FEATURED · Editor's picks            View all → │
│ [ featured (2-wide) ] [ card ] [ card ]         │  bento grid
├───────────────────────────────────────────────┤
│ TRENDING · #AI Agents #MCP #RAG #LLM #…  (chips)│
├───────────────────────────────────────────────┤
│ GUIDED · Learning paths              View all → │
│ [ path ] [ path ] [ path ] [ path ] [ path ]    │
├───────────────────────────────────────────────┤
│ INTERACTIVE · Model playgrounds      View all → │
│ [ playground ] [ playground ] [ playground ]    │
├───────────────────────────────────────────────┤
│ RESEARCH summaries (2-col)   │ Just published   │
│ [ card ] [ card ]            │ • compact ×5     │
├───────────────────────────────────────────────┤
│ Footer                                          │
└───────────────────────────────────────────────┘
```

Implements every required section: hero + mission + featured paths + animation;
featured articles (hero/category/description/reading-time/difficulty); trending
topics; learning paths; playground showcase; latest research summaries.

---

## 10. Category Page Wireframe

```
Breadcrumb: Learn › {Category}
┌───────────────────────────────────────────────┐
│ ▦ icon   {CATEGORY TITLE}     (accent gradient) │
│          description · N articles               │
├───────────────────────────────────────────────┤
│ Subcat nav: ( Agents )( MCP )( RAG )  → #anchor │
├───────────────────────────────────────────────┤
│ SERIES   [ series card ] [ series card ]        │
├───────────────────────────────────────────────┤
│ #agents  Agents                                 │
│ [ card ] [ card ] [ card ]                       │
│ #mcp     MCP                                     │
│ [ card ] [ card ]                                │
└───────────────────────────────────────────────┘
```

---

## 11. Article Page Wireframe

```
▔▔▔▔▔ reading-progress bar (fixed top) ▔▔▔▔▔
Breadcrumb: Learn › Category › Title
┌──────────────────────────────┬──────────────┐
│  [difficulty][type]          │              │
│  H1 Title (centered)         │  ON THIS PAGE│
│  description                 │  • heading   │  (sticky,
│  author · ⏱ min · date · 🔖  │  • heading   │   scroll-spy)
├──────────────────────────────┤  • heading   │
│  MDX body:                   │              │
│   prose · code (highlighted) │              │
│   mermaid diagrams           │              │
│   <Playground/> (in-body)    │              │
│   blockquotes, images, video │              │
│  ── References [1][2] ──     │              │
│  Recommended next  →         │              │
│  Related reading [ ][ ][ ]   │              │
└──────────────────────────────┴──────────────┘
```

Supports: Markdown/MDX, rich + highlighted code, Mermaid, interactive
charts/playgrounds, images/video, citations, downloadable assets; plus TOC,
reading-progress, author info, related + recommended-next, difficulty, reading
time, category navigation. JSON-LD `TechArticle` is emitted per page.

---

## 12. Playground Page Wireframe

```
Breadcrumb: Playgrounds › Title
┌───────────────────────────────────────────────┐
│ ▷ Live playground  [difficulty]   [ Read article ]│
│ H1 Title · description                          │
├───────────────────────────────────────────────┤
│ ┌─────────────┬───────────────────────────┐    │
│ │  SVG plot   │  Learning rate  ▭▭▭▭○──    │    │
│ │  • • boundary│  Epochs         ▭▭○─────  │    │
│ │  • •        │  [ Loss ] [ Accuracy ]    │    │
│ │             │  [ Train ] [ Reset ]      │    │
│ └─────────────┴───────────────────────────┘    │
│ "runs client-side · static assets · backend-ready"│
└───────────────────────────────────────────────┘
```

The Logistic Regression playground trains live in-browser (gradient descent in
JS, animated via `requestAnimationFrame`). The registry
(`src/components/playground/index.tsx`) lazy-loads each demo by `kind` so it's
code-split. The component documents a runtime seam where TensorFlow.js / ONNX
Runtime Web / remote inference can be substituted without changing pages.

---

## 13. Search Architecture

A provider abstraction (`src/lib/search/`) decouples UI from engine:

```
UI (SearchDialog, /search)
   └─ getSearchProvider(): SearchProvider     ← factory (one-line swap)
        ├─ v1  StaticJsonSearchProvider        fetch /search-index.json, score in-memory
        └─ v2  HostedSearchProvider            Typesense/Meilisearch/Algolia/pgvector
```

- **Index** built at compile time by `scripts/build-content.ts` →
  `public/search-index.json` (`SearchDoc[]`).
- **Capabilities:** free-text (field-weighted: title > tags > description >
  body), plus filters for **category, subcategory, series, tags, difficulty,
  type, hasPlayground**, with computed **facet counts** — exactly the required
  search dimensions.
- **v1** is fully static, runs client-side, no backend. **v2** implements the
  same `SearchProvider` interface; no component changes.

---

## 14. Static-to-Dynamic Migration Plan

Each future feature maps to an already-defined seam:

| Future capability | Seam today | Migration step |
|---|---|---|
| **Drop `output: 'export'`** | `next.config.mjs` | Remove `output` + `images.unoptimized`; pages already work as RSC/SSG/SSR. No route changes. |
| **Database / CMS** | `src/lib/content/index.ts` (only content reader) | Re-implement its functions against Postgres/CMS; build-content writes rows instead of JSON. Components untouched. |
| **Hosted search / vector** | `SearchProvider` interface | Add `HostedSearchProvider`; flip factory via env. `getRelated()` is the recommender seam. |
| **Auth & user profiles** | `UserDataProvider` (`src/lib/data/`) | Add an API-backed provider (local → server); `SaveButton`, `ReadingProgress` unchanged. |
| **Saved articles / progress / notes** | `UserDataProvider` methods already defined | Persist server-side; UI is provider-agnostic. |
| **Personalized recommendations** | `getRelated` / `getNextArticle` | Swap heuristic for vector similarity / collaborative filtering. |
| **AI assistant / playgrounds backend** | Playground registry runtime seam | Add a remote-inference runtime implementing the same contract. |
| **Community, subscriptions, API** | New routes + data providers | App Router adds dynamic routes alongside static ones incrementally. |

The guiding rule: **every storage/engine concern is behind an interface, and
components depend only on interfaces.**

---

## 15. Performance Optimization Strategy

- **Static export + CDN** (GitHub Pages): pre-rendered HTML, instant TTFB.
- **Code-splitting:** Mermaid and each Playground are `dynamic()` + `ssr:false`,
  so heavy libs never enter the main bundle (shared JS ≈ 107 kB; playground page
  adds only ~1.5 kB until opened).
- **Build-time work:** MDX compiled, search index + reading time precomputed —
  zero runtime markdown parsing.
- **Fonts:** `next/font` self-hosts and preloads → no layout shift, no
  render-blocking third-party fetch.
- **Images:** procedural gradient covers (no network) where hero art is absent;
  real images served statically. (Add `next/image` loader or precompressed
  assets when art is authored.)
- **CSS:** Tailwind v4 emits only used utilities; tokens are variables (no JS
  theme runtime).
- **Motion:** `optimizePackageImports` for `motion`; animations honor
  `prefers-reduced-motion`.

---

## 16. SEO Strategy

- **Per-page metadata** via the App Router Metadata API (`generateMetadata`):
  titles (templated `%s · Hundredfolds`), descriptions, canonical URLs.
- **Open Graph + Twitter cards** site-wide and per-article.
- **Structured data:** JSON-LD `TechArticle` per article (headline, dates,
  keywords).
- **`sitemap.xml`** generated from the registry with per-route priority/lastmod;
  **`robots.txt`** points to it.
- **Semantic HTML:** one `<h1>` per page, breadcrumb `nav`, article landmarks,
  `metadataBase` for absolute URLs.
- **Clean URLs:** `trailingSlash` + content-derived slugs; stable taxonomy
  routes.

---

## 17. Accessibility Strategy

- **Keyboard:** ⌘K palette, focus-visible outlines (`--color-accent-2`), `esc`
  to close dialogs, skip-to-content link.
- **Semantics/ARIA:** landmark regions, `aria-label`/`aria-modal` on the search
  dialog, `aria-pressed` on the Save toggle, `aria-expanded` on the mobile menu,
  `role="img"` + label on diagrams, labeled SVG plots, breadcrumb `nav`s.
- **Motion:** `prefers-reduced-motion` disables animations/transitions globally.
- **Contrast:** dark-first palette tuned for AA body text; difficulty colors
  paired with text labels (never color-only).
- **Forms/controls:** native `<input type=range>` with visible value labels;
  real `<button>`/`<a>` elements (no div-buttons).
- **Theming:** light theme available for users who need it (`data-theme`).

---

## Running it

```bash
npm install
npm run dev        # http://localhost:3000  (rebuilds content first)
npm run build      # static export → ./out
npm run typecheck  # strict TS, no errors
```

**Authoring:** drop a `content/articles/<slug>.mdx` with valid frontmatter — the
build validates it, indexes it, and routes it automatically.

**Deploy:** push to `main`; `.github/workflows/deploy.yml` builds and publishes
`out/` to GitHub Pages. Custom domain via `public/CNAME`; `.nojekyll` ensures
`_next/` assets are served. For a project subpath instead, set
`NEXT_PUBLIC_BASE_PATH=/blog`.
