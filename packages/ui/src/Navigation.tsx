"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export interface NavLink {
  name: string;
  href: string;
}

export interface NavigationProps {
  /** Wordmark: serif name + small-caps label, e.g. "Virex" | "Capital". */
  brand: { name: string; label: string };
  navLinks: NavLink[];
  contactHref?: string;
  /**
   * Paths that open on a dark hero. On these the header starts in its dark
   * tone and overlays the hero; after scrolling it switches to the light bar.
   */
  darkHeroPaths?: string[];
  /** Dark-tone background: transparent over imagery, or solid ink. */
  darkBackground?: "transparent" | "ink";
  /** Fill colour of the Contact button on the light bar. */
  accent?: "forest" | "ink";
}

const SCROLL_THRESHOLD = 80;
export const HEADER_HEIGHT = 96;

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navigation({
  brand,
  navLinks,
  contactHref = "/contact",
  darkHeroPaths = [],
  darkBackground = "transparent",
  accent = "forest",
}: NavigationProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const overHero = darkHeroPaths.includes(pathname);
  const dark = overHero && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock scroll and support Escape while the mobile menu is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const fg = dark ? "text-virex-warmwhite" : "text-virex-deepink";
  const rule = dark ? "bg-virex-stone/20" : "bg-virex-stone";
  const bar = dark
    ? `${darkBackground === "ink" ? "bg-virex-deepink" : "bg-transparent"} border-virex-stone/20`
    : "bg-virex-warmwhite border-virex-stone";
  const contactClasses = dark
    ? "border-virex-warmwhite/50 text-virex-warmwhite hover:border-virex-warmwhite"
    : accent === "ink"
      ? "border-virex-deepink bg-virex-deepink text-virex-warmwhite hover:bg-virex-forest hover:border-virex-forest"
      : "border-virex-forest bg-virex-forest text-virex-warmwhite hover:bg-virex-deepink hover:border-virex-deepink";

  return (
    <>
      <a
        href="#main"
        className="fixed -left-[9999px] top-4 z-[60] bg-virex-forest px-[18px] py-3 text-sm font-semibold text-virex-warmwhite focus:left-6"
      >
        Skip to content
      </a>

      <header
        className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${bar} ${fg}`}
      >
        <div className="container flex h-24 items-center justify-between gap-8">
          <Link
            href="/"
            aria-label={`${brand.name} ${brand.label} — home`}
            className={`inline-flex items-center gap-3.5 ${fg}`}
          >
            <span className="font-serif text-[26px] leading-none tracking-[-0.01em]">{brand.name}</span>
            <span aria-hidden="true" className={`inline-block h-[18px] w-px ${rule}`} />
            <span className="text-[11px] font-semibold uppercase leading-none tracking-[0.32em]">
              {brand.label}
            </span>
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-11 min-[861px]:flex">
            {navLinks.map((link) => {
              const active = isActivePath(pathname, link.href);
              const color = active ? fg : dark ? "text-virex-stone hover:text-virex-warmwhite" : "text-virex-body hover:text-virex-deepink";
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative inline-flex flex-col gap-1.5 py-3 text-sm font-medium tracking-[0.01em] transition-colors ${color}`}
                >
                  {link.name}
                  <span
                    aria-hidden="true"
                    className={`h-px w-full bg-current transition-opacity ${active ? "opacity-100" : "opacity-0"}`}
                  />
                </Link>
              );
            })}
            <Link
              href={contactHref}
              className={`inline-flex min-h-11 items-center border px-[22px] text-[13px] font-semibold tracking-[0.04em] transition-colors duration-300 ${contactClasses}`}
            >
              Contact
            </Link>
          </nav>

          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen(true)}
            className={`inline-flex size-11 items-center justify-center border min-[861px]:hidden ${dark ? "border-virex-stone/20" : "border-virex-stone"}`}
          >
            <svg width="20" height="12" viewBox="0 0 20 12" aria-hidden="true">
              <path d="M0 1h20M0 11h20" stroke="currentColor" strokeWidth="1.4" fill="none" />
            </svg>
          </button>
        </div>
      </header>

      {/* Pages without a dark hero start below the fixed bar. */}
      {!overHero && <div aria-hidden="true" className="h-24 shrink-0" />}

      {open && (
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-50 flex flex-col bg-virex-deepink px-6 pb-10 text-virex-warmwhite"
        >
          <div className="flex h-24 items-center justify-between">
            <span className="font-serif text-[26px]">
              {brand.name}{" "}
              <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.32em]">{brand.label}</span>
            </span>
            <button
              type="button"
              aria-label="Close menu"
              autoFocus
              onClick={() => setOpen(false)}
              className="inline-flex size-11 items-center justify-center border border-virex-stone/30"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M1 1l14 14M15 1L1 15" stroke="currentColor" strokeWidth="1.4" fill="none" />
              </svg>
            </button>
          </div>
          <nav aria-label="Mobile" className="mt-12 flex flex-col border-t border-virex-stone/20">
            {navLinks.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                aria-current={isActivePath(pathname, link.href) ? "page" : undefined}
                className="flex items-baseline justify-between border-b border-virex-stone/20 py-[22px] font-serif text-4xl font-light text-virex-warmwhite"
              >
                {link.name}
                <span className="font-sans text-xs text-virex-sage">{String(i + 1).padStart(2, "0")}</span>
              </Link>
            ))}
          </nav>
          <Link
            href={contactHref}
            onClick={() => setOpen(false)}
            className="mt-auto flex min-h-14 items-center justify-center bg-virex-warmwhite text-sm font-semibold text-virex-deepink"
          >
            Contact us
          </Link>
        </div>
      )}
    </>
  );
}
