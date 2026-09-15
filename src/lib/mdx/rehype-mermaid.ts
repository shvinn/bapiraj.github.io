/**
 * Rehype plugin: convert ```mermaid fenced code blocks into a custom <mermaid>
 * element carrying the raw chart source. Must run BEFORE rehype-pretty-code so
 * the diagram source isn't tokenized as code. The <mermaid> element is mapped
 * to a client React component that renders the diagram in the browser.
 */
type HastNode = {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  value?: string;
  children?: HastNode[];
};

function isMermaidPre(node: HastNode): string | null {
  if (node.tagName !== "pre" || !node.children?.length) return null;
  const code = node.children.find((c) => c.tagName === "code");
  if (!code) return null;
  const cls = (code.properties?.className as string[] | undefined) ?? [];
  if (!cls.includes("language-mermaid")) return null;
  const text = (code.children ?? [])
    .filter((c) => c.type === "text")
    .map((c) => c.value ?? "")
    .join("");
  return text || null;
}

export function rehypeMermaid() {
  return (tree: HastNode) => {
    const walk = (node: HastNode) => {
      if (!node.children) return;
      node.children = node.children.map((child) => {
        const chart = isMermaidPre(child);
        if (chart) {
          return {
            type: "element",
            tagName: "mermaid",
            properties: { chart },
            children: [],
          } as HastNode;
        }
        walk(child);
        return child;
      });
    };
    walk(tree);
  };
}
