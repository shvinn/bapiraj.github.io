import type { SVGProps } from "react";

/** Minimal inline icon set (stroke-based, currentColor) — no icon-font dep. */
const paths: Record<string, string> = {
  sparkles:
    "M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4L12 3zM19 14l.9 2.3L22 17l-2.1.7L19 20l-.9-2.3L16 17l2.1-.7L19 14z",
  cpu: "M9 3v2M15 3v2M9 19v2M15 19v2M3 9h2M3 15h2M19 9h2M19 15h2M6 6h12v12H6z M9 9h6v6H9z",
  function: "M4 19c3 0 3-14 6-14M4 12h8M14 8l6 8M20 8l-6 8",
  database: "M12 5c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3z M4 8v8c0 1.7 3.6 3 8 3s8-1.3 8-3V8 M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3",
  code: "M8 6l-6 6 6 6M16 6l6 6-6 6",
  rocket:
    "M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2c.8-.8.8-2 0-2.8s-2-.8-2.8 0zM9 12l3-3c3-3 7-4 9-4 0 2-1 6-4 9l-3 3-5-5zM14 9.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z",
  cog: "M12 9a3 3 0 100 6 3 3 0 000-6z M19.4 13a7.5 7.5 0 000-2l2-1.5-2-3.5-2.4 1a7.5 7.5 0 00-1.7-1L14 3h-4l-.3 2.5a7.5 7.5 0 00-1.7 1l-2.4-1-2 3.5L3.6 11a7.5 7.5 0 000 2l-2 1.5 2 3.5 2.4-1a7.5 7.5 0 001.7 1L10 21h4l.3-2.5a7.5 7.5 0 001.7-1l2.4 1 2-3.5L19.4 13z",
  flask: "M9 3h6M10 3v6l-5 9a2 2 0 002 3h10a2 2 0 002-3l-5-9V3M7 15h10",
  search: "M11 4a7 7 0 105 12 7 7 0 00-5-12zM21 21l-5-5",
  arrow: "M5 12h14M13 6l6 6-6 6",
  clock: "M12 7v5l3 2M12 3a9 9 0 100 18 9 9 0 000-18z",
  bookmark: "M6 3h12v18l-6-4-6 4V3z",
  play: "M7 4l13 8-13 8V4z",
  layers: "M12 2l9 5-9 5-9-5 9-5zM3 12l9 5 9-5M3 17l9 5 9-5",
  book: "M4 5a2 2 0 012-2h12v18H6a2 2 0 01-2-2V5zM18 3v18",
  menu: "M4 6h16M4 12h16M4 18h16",
  close: "M6 6l12 12M18 6L6 18",
  sun: "M12 7a5 5 0 100 10 5 5 0 000-10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4",
  moon: "M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z",
  user: "M12 12a4 4 0 100-8 4 4 0 000 8zM5 20a7 7 0 0114 0",
  terminal: "M4 5h16v14H4zM7 9l3 3-3 3M13 15h4",
  github:
    "M9 19c-4 1.5-4-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 00-1.3-3.2 4.3 4.3 0 00-.1-3.2s-1-.3-3.4 1.3a11.5 11.5 0 00-6 0C7.3 3.4 6.3 3.7 6.3 3.7a4.3 4.3 0 00-.1 3.2A4.6 4.6 0 005 10.1c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V22",
  download: "M12 3v12m0 0l4-4m-4 4l-4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2",
};

export type IconName = keyof typeof paths;

export function Icon({
  name,
  size = 20,
  ...props
}: { name: string; size?: number } & SVGProps<SVGSVGElement>) {
  const d = paths[name] ?? paths.sparkles;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={d} />
    </svg>
  );
}
