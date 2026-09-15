/** Global site configuration. Single place to retune branding + SEO. */
export const site = {
  name: "hundredfolds",
  tagline: "An AI knowledge operating system",
  description:
    "hundredfolds is a futuristic learning platform for AI, ML, data, and software engineering — interactive articles, research summaries, and in-browser model playgrounds.",
  url: "https://hundredfolds.io",
  locale: "en-US",
  ogImage: "/og/default.png",
  social: {
    github: "https://github.com/hundredfolds",
    x: "https://x.com/hundredfolds",
  },
  nav: [
    { label: "Learn", href: "/learn" },
    { label: "Playgrounds", href: "/playgrounds" },
  ],
} as const;

export type SiteConfig = typeof site;
