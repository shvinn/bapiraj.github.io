import Link from "next/link";
import { Icon } from "@/components/ui/icon";

export function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  hrefLabel = "View all",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-2)]">
            {eyebrow}
          </p>
        )}
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight md:text-3xl">
          {title}
        </h2>
        {description && <p className="mt-2 text-[var(--color-text-muted)]">{description}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="group inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
        >
          {hrefLabel}
          <Icon name="arrow" size={16} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

export function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`container-page py-12 md:py-16 ${className}`}>{children}</section>;
}
