import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import { rehypeMermaid } from "@/lib/mdx/rehype-mermaid";
import { Mermaid } from "@/components/mdx/mermaid";
import { Playground } from "@/components/playground";

const prettyCodeOptions = {
  theme: "github-dark-default",
  keepBackground: false,
};

/** MDX → React, compiled at build time (works under static export). */
export function MDXContent({ source }: { source: string }) {
  return (
    <MDXRemote
      source={source}
      components={{
        // Custom element produced by rehypeMermaid.
        mermaid: Mermaid as never,
        // JSX components usable directly in MDX bodies.
        Playground: Playground as never,
      }}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm, remarkMath],
          rehypePlugins: [
            rehypeMermaid,
            rehypeKatex,
            [rehypePrettyCode, prettyCodeOptions],
            rehypeSlug,
            [rehypeAutolinkHeadings, { behavior: "wrap" }],
          ],
        },
      }}
    />
  );
}
