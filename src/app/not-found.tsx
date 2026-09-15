import Link from "next/link";
import { Icon } from "@/components/ui/icon";

export default function NotFound() {
  return (
    <div className="container-page grid min-h-[60vh] place-items-center text-center">
      <div>
        <p className="font-[family-name:var(--font-display)] text-7xl font-bold text-gradient">404</p>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-semibold">
          This page drifted out of context
        </h1>
        <p className="mx-auto mt-2 max-w-md text-[var(--color-text-muted)]">
          The page you're looking for doesn't exist. Try the knowledge base or search.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/" className="rounded-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] px-5 py-2.5 text-sm font-medium text-white">
            Home
          </Link>
          <Link href="/learn" className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-5 py-2.5 text-sm font-medium">
            <Icon name="book" size={15} /> Browse
          </Link>
        </div>
      </div>
    </div>
  );
}
