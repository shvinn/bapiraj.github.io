import Link from "next/link";
import { site } from "@/config/site";
import { categories } from "@content/taxonomy/categories";
import { Icon } from "@/components/ui/icon";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-2)] text-white">
              <Icon name="layers" size={18} />
            </span>
            <span className="font-[family-name:var(--font-display)] text-lg font-semibold">
              {site.name}
            </span>
          </Link>
          <p className="mt-3 max-w-xs text-sm text-[var(--color-text-muted)]">{site.tagline}.</p>
        </div>

        <FooterCol title="Explore">
          {site.nav.map((n) => (
            <FooterLink key={n.href} href={n.href}>
              {n.label}
            </FooterLink>
          ))}
        </FooterCol>

        <FooterCol title="Categories">
          {categories.slice(0, 5).map((c) => (
            <FooterLink key={c.slug} href={`/learn/${c.slug}`}>
              {c.title}
            </FooterLink>
          ))}
        </FooterCol>

        <FooterCol title="Project">
          <FooterLink href={site.social.github}>GitHub</FooterLink>
          <FooterLink href={site.social.x}>X / Twitter</FooterLink>
          <FooterLink href="/learn">All Content</FooterLink>
        </FooterCol>
      </div>
      <div className="border-t border-[var(--color-border)] py-6">
        <p className="container-page text-xs text-[var(--color-text-subtle)]">
          © {new Date().getFullYear()} {site.name}. {site.description}
        </p>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-subtle)]">
        {title}
      </h4>
      <ul className="flex flex-col gap-2">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
        {children}
      </Link>
    </li>
  );
}
