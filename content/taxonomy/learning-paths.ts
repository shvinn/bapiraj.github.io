import type { LearningPath } from "@/lib/content/schema";

export const learningPaths: LearningPath[] = [
  {
    slug: "ai-engineer-roadmap",
    title: "AI Engineer Roadmap",
    description:
      "Go from LLM consumer to systems builder: prompting, RAG, agents, evals, and production serving.",
    difficulty: "intermediate",
    estimatedHours: 40,
    icon: "rocket",
    steps: [
      { title: "Foundations of LLM Engineering", seriesSlug: "llm-engineering-basics" },
      { title: "Retrieval-Augmented Generation", articleSlug: "rag-from-scratch" },
      { title: "Building Agents", seriesSlug: "mcp-series" },
      { title: "Evaluation & Observability", description: "Measure quality and ship safely." },
    ],
  },
  {
    slug: "ml-fundamentals",
    title: "Machine Learning Fundamentals",
    description:
      "Build intuition for the classical algorithms that underpin everything else — with interactive playgrounds.",
    difficulty: "beginner",
    estimatedHours: 30,
    icon: "function",
    steps: [
      { title: "Regression, project by project", seriesSlug: "ml-regression-lab" },
      { title: "Logistic Regression, Interactively", articleSlug: "logistic-regression-playground" },
      { title: "Decision Trees & Ensembles", description: "From a single split to gradient boosting." },
      { title: "Model Evaluation", description: "Bias, variance, and the metrics that matter." },
    ],
  },
  {
    slug: "agent-development",
    title: "Agent Development",
    description:
      "Design tool-using, memory-equipped agents and connect them to the world with MCP.",
    difficulty: "advanced",
    estimatedHours: 25,
    icon: "sparkles",
    steps: [
      { title: "The MCP Series", seriesSlug: "mcp-series" },
      { title: "Agent Architectures", description: "Planning, reflection, and multi-agent orchestration." },
    ],
  },
  {
    slug: "mlops",
    title: "MLOps",
    description: "Take models from notebook to reliable production system.",
    difficulty: "advanced",
    estimatedHours: 35,
    icon: "cog",
    steps: [
      { title: "Experiment Tracking", description: "Reproducibility and versioning." },
      { title: "Deployment & Serving", description: "Containers, autoscaling, and rollouts." },
      { title: "Monitoring & Drift", description: "Detect degradation before users do." },
    ],
  },
  {
    slug: "research-engineering",
    title: "Research Engineering",
    description: "Read, reproduce, and build on frontier research papers.",
    difficulty: "expert",
    estimatedHours: 50,
    icon: "flask",
    steps: [
      { title: "How to Read a Paper", description: "A repeatable three-pass method." },
      { title: "Reproducing Results", description: "From PDF to working code." },
    ],
  },
];

export const pathBySlug = (slug: string) =>
  learningPaths.find((p) => p.slug === slug);
