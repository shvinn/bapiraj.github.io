import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { getAllArticles, getPlaygroundArticles } from "@/lib/content";
import { categories } from "@content/taxonomy/categories";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const u = (p: string) => `${site.url}${p}`;
  const now = new Date();

  const staticRoutes = ["", "/learn", "/playgrounds", "/search"].map((p) => ({
    url: u(p || "/"),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.7,
  }));

  const articleRoutes = getAllArticles().map((a) => ({
    url: u(`/article/${a.slug}`),
    lastModified: new Date(a.updatedAt ?? a.publishedAt),
    changeFrequency: "monthly" as const,
    priority: a.featured ? 0.9 : 0.6,
  }));

  const categoryRoutes = categories.map((c) => ({ url: u(`/learn/${c.slug}`), lastModified: now, priority: 0.6 }));
  const playgroundRoutes = getPlaygroundArticles().map((a) => ({ url: u(`/playground/${a.slug}`), lastModified: now, priority: 0.6 }));

  return [...staticRoutes, ...articleRoutes, ...categoryRoutes, ...playgroundRoutes];
}
