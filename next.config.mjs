/**
 * Next.js configuration — static-first, dynamic-ready.
 *
 * `output: 'export'` produces a fully static site deployable to GitHub Pages.
 * To migrate to a dynamic Next.js App Router deployment later, remove `output`
 * and `images.unoptimized` — no route or component code needs to change.
 *
 * basePath is empty for custom-domain root (hundredfolds.io). For a project
 * subpath deployment (user.github.io/blog) set NEXT_PUBLIC_BASE_PATH=/blog.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  images: {
    // GitHub Pages has no image optimization server.
    unoptimized: true,
  },
  // Keep the build deterministic and surface type/lint errors in CI explicitly.
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    optimizePackageImports: ["motion"],
  },
};

export default nextConfig;
