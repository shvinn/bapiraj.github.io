import type { Category } from "@/lib/content/schema";

/**
 * The taxonomy backbone: Category → Subcategory.
 * Series and Articles attach to these via their frontmatter `taxonomy` ref.
 * Editing this file reshapes the entire navigation + category routing.
 */
export const categories: Category[] = [
  {
    slug: "artificial-intelligence",
    title: "Artificial Intelligence",
    description:
      "Agents, reasoning systems, and the protocols that connect models to the world.",
    icon: "sparkles",
    accent: "#7c5cff",
    subcategories: [
      { slug: "agents", title: "AI Agents", description: "Planning, tools, memory, and multi-agent systems." },
      { slug: "mcp", title: "Model Context Protocol", description: "Connecting models to tools and data via MCP." },
      { slug: "rag", title: "Retrieval-Augmented Generation", description: "Grounding models in external knowledge." },
    ],
  },
  {
    slug: "large-language-models",
    title: "Large Language Models",
    description: "Training, fine-tuning, serving, and engineering with LLMs.",
    icon: "cpu",
    accent: "#00d4ff",
    subcategories: [
      { slug: "llm-engineering", title: "LLM Engineering", description: "Prompting, evals, and production patterns." },
      { slug: "fine-tuning", title: "Fine-Tuning & Alignment", description: "SFT, RLHF, DPO, and adapters." },
      { slug: "inference", title: "Inference & Serving", description: "Quantization, batching, and latency." },
    ],
  },
  {
    slug: "machine-learning",
    title: "Machine Learning",
    description: "From classical algorithms to modern training pipelines.",
    icon: "function",
    accent: "#2dd4a7",
    subcategories: [
      { slug: "classical-ml", title: "Classical ML", description: "Regression, trees, SVMs, and ensembles." },
      { slug: "mlops", title: "MLOps", description: "Experiment tracking, deployment, and monitoring." },
    ],
  },
  {
    slug: "software-engineering",
    title: "Software Engineering",
    description: "Systems, infrastructure, and craft for AI-era builders.",
    icon: "code",
    accent: "#ff5ca8",
    subcategories: [
      { slug: "systems", title: "Systems Design", description: "Scalable, reliable architectures." },
      { slug: "ai-infrastructure", title: "AI Infrastructure", description: "GPUs, vector DBs, and serving stacks." },
      { slug: "web", title: "Web Platform", description: "Frontend, edge, and developer experience." },
    ],
  },
];

export const categoryBySlug = (slug: string) =>
  categories.find((c) => c.slug === slug);
