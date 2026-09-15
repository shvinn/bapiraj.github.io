import type { Author } from "@/lib/content/schema";

export const authors: Author[] = [
  {
    id: "shvinn",
    name: "@shvinn",
    role: "Machine Learning Engineer",
    bio: "Machine Learning Engineer writing about AI, ML, data, and the systems that ship them.",
  },
];

export const authorById = (id: string) =>
  authors.find((a) => a.id === id) ?? authors[0];
