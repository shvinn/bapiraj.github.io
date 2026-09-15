"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site } from "@/config/site";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { SearchDialog } from "@/components/search/search-dialog";

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const stored = (localStorage.getItem("hf:theme") as "dark" | "light") || "dark";
    setTheme(stored);
    document.documentElement.setAttribute("data-theme", stored);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("hf:theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          scrolled ? "glass border-b py-2.5" : "border-b border-transparent py-4",
        )}
      >
        <div className="container-page flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-2)] text-white shadow-[var(--shadow-glow)]">
              <Icon name="layers" size={18} />
            </span>
            <span className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight">
              {site.name}
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {site.nav.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-sm transition-colors",
                    active
                      ? "bg-[var(--color-surface-2)] text-[var(--color-text)]"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] py-1.5 pl-3 pr-2 text-sm text-[var(--color-text-subtle)] transition-colors hover:border-[var(--color-border-strong)]"
              aria-label="Search"
            >
              <Icon name="search" size={16} />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden rounded border border-[var(--color-border)] px-1.5 py-0.5 text-[0.65rem] sm:inline">
                ⌘K
              </kbd>
            </button>
            <button
              onClick={toggleTheme}
              className="grid size-9 place-items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              aria-label="Toggle theme"
            >
              <Icon name={theme === "dark" ? "sun" : "moon"} size={16} />
            </button>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="grid size-9 place-items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] md:hidden"
              aria-label="Menu"
              aria-expanded={menuOpen}
            >
              <Icon name={menuOpen ? "close" : "menu"} size={18} />
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="container-page mt-3 flex flex-col gap-1 md:hidden">
            {site.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-surface)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
