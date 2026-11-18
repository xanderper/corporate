import Link from "next/link";
import type { ReactNode } from "react";

export interface FooterLink {
  name: string;
  href: string;
  external?: boolean;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export interface FooterProps {
  /** Wordmark: serif name + small-caps label, e.g. "Virex" | "Capital". */
  brand: { name: string; label: string };
  tagline: ReactNode;
  /** "sans": small sage paragraph. "serif": larger Fraunces statement. */
  taglineStyle?: "sans" | "serif";
  sections: FooterSection[];
  /** Column-heading / bottom-bar typeface. */
  labelFont?: "sans" | "mono";
  copyright: ReactNode;
  registration?: ReactNode;
  /** Optional legal disclaimer, rendered small above the bottom bar. */
  note?: ReactNode;
}

function FooterAnchor({ link }: { link: FooterLink }) {
  const className = "text-virex-stone transition-colors hover:text-virex-white";
  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" className={className}>
        {link.name} <span aria-hidden="true">↗</span>
      </a>
    );
  }
  return (
    <Link href={link.href} className={className}>
      {link.name}
    </Link>
  );
}

export function Footer({
  brand,
  tagline,
  taglineStyle = "sans",
  sections,
  labelFont = "sans",
  copyright,
  registration,
  note,
}: FooterProps) {
  const mono = labelFont === "mono";
  const heading = mono
    ? "font-mono text-[11px] uppercase tracking-[0.1em] text-virex-sage"
    : "text-[11px] uppercase tracking-[0.24em] text-virex-sage";

  return (
    <footer className="bg-virex-deepink text-virex-warmwhite">
      <div className="container pb-10 pt-24">
        <div className="flex flex-wrap justify-between gap-x-16 gap-y-14">
          <div className="min-w-0 max-w-[420px] flex-[1_1_320px]">
            <Link
              href="/"
              aria-label={`${brand.name} ${brand.label} — home`}
              className="inline-flex items-center gap-3.5 text-virex-warmwhite"
            >
              <span className="font-serif text-[30px] leading-none tracking-[-0.01em]">{brand.name}</span>
              <span aria-hidden="true" className="inline-block h-5 w-px bg-virex-stone/30" />
              <span className="text-[11px] font-semibold uppercase leading-none tracking-[0.32em]">{brand.label}</span>
            </Link>
            {taglineStyle === "serif" ? (
              <p className="mt-7 font-serif text-[22px] font-light leading-[1.4] text-virex-stone">{tagline}</p>
            ) : (
              <p className="mt-7 text-[15px] leading-[1.75] text-virex-sage">{tagline}</p>
            )}
          </div>

          <div className="grid min-w-0 flex-[1_1_520px] grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-10">
            {sections.map((section) => (
              <nav key={section.title} aria-label={section.title}>
                <p className={`mb-5 ${heading}`}>{section.title}</p>
                <ul className="flex flex-col gap-3.5 text-sm">
                  {section.links.map((link) => (
                    <li key={link.href + link.name}>
                      <FooterAnchor link={link} />
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {note && <p className="mt-20 max-w-[880px] text-xs leading-relaxed text-virex-sage/80">{note}</p>}

        <div
          className={`${note ? "mt-10" : "mt-24"} flex flex-wrap justify-between gap-x-10 gap-y-4 border-t border-virex-stone/15 pt-7 text-virex-sage ${
            mono ? "font-mono text-[11px] uppercase tracking-[0.06em]" : "text-[13px]"
          }`}
        >
          <p>{copyright}</p>
          {registration && <p>{registration}</p>}
        </div>
      </div>
    </footer>
  );
}
