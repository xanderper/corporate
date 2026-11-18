import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Tone = "light" | "dark";

/** Small caps label above a heading, optionally led by a 40px rule. */
export function Eyebrow({
  children,
  tone = "light",
  rule = true,
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  rule?: boolean;
  className?: string;
}) {
  const color = tone === "dark" ? "text-virex-sage" : "text-virex-muted";
  const ruleColor = tone === "dark" ? "bg-virex-sage" : "bg-virex-forest";
  return (
    <p
      className={`mb-7 flex items-center gap-4 text-xs uppercase tracking-[0.24em] ${color} ${className}`}
    >
      {rule && <span aria-hidden="true" className={`inline-block h-px w-10 ${ruleColor}`} />}
      {children}
    </p>
  );
}

/** Italic accent inside a serif heading. */
export function Accent({ children, tone = "light" }: { children: ReactNode; tone?: Tone }) {
  return (
    <em className={`italic ${tone === "dark" ? "text-virex-warmstone" : "text-virex-forest"}`}>
      {children}
    </em>
  );
}

const buttonVariants = {
  primary: "bg-virex-forest text-virex-warmwhite hover:bg-virex-deepink",
  secondary: "border border-virex-forest text-virex-forest hover:bg-virex-forest hover:text-virex-warmwhite",
  light: "bg-virex-warmwhite text-virex-deepink hover:bg-virex-stone",
  ghost: "border border-virex-warmwhite/40 text-virex-warmwhite hover:border-virex-warmwhite",
} as const;

export function ButtonLink({
  href,
  children,
  variant = "primary",
  arrow = false,
  className = "",
  ...rest
}: {
  href: string;
  children: ReactNode;
  variant?: keyof typeof buttonVariants;
  arrow?: boolean;
  className?: string;
} & Omit<ComponentProps<typeof Link>, "href" | "className" | "children">) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-[52px] items-center gap-3 px-7 text-sm font-semibold tracking-[0.02em] transition-colors duration-300 ${buttonVariants[variant]} ${className}`}
      {...rest}
    >
      {children}
      {arrow && <Arrow />}
    </Link>
  );
}

/** Inline link with drawn underline and optional arrow. */
export function TextLink({
  href,
  children,
  tone = "light",
  arrow = true,
  muted = false,
  className = "",
}: {
  href: string;
  children: ReactNode;
  tone?: Tone;
  arrow?: boolean;
  muted?: boolean;
  className?: string;
}) {
  const color =
    tone === "dark" ? "text-virex-warmwhite" : muted ? "text-virex-muted" : "text-virex-forest hover:text-virex-deepink";
  return (
    <Link href={href} className={`inline-flex gap-3 text-sm font-semibold ${color} ${className}`}>
      <span className="vx-link">{children}</span>
      {arrow && <Arrow />}
    </Link>
  );
}

export function Arrow() {
  return (
    <span className="vx-arrow" aria-hidden="true">
      →
    </span>
  );
}

/** Marks illustrative / placeholder content so it is never mistaken for fact. */
export function PlaceholderBadge({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={`m-0 inline-flex items-center gap-2.5 border border-virex-warmstone bg-virex-white px-4 py-2.5 text-xs tracking-[0.08em] text-virex-muted ${className}`}
    >
      <span aria-hidden="true" className="inline-block size-1.5 rounded-full bg-virex-warmstone" />
      {children}
    </p>
  );
}

/** Dark closing call-to-action band used at the bottom of most pages. */
export function CtaBand({
  id,
  title,
  children,
  cta = { href: "/contact", label: "Start a conversation" },
  large = false,
}: {
  id: string;
  title: ReactNode;
  children?: ReactNode;
  cta?: { href: string; label: string };
  large?: boolean;
}) {
  return (
    <section
      aria-labelledby={id}
      className={`bg-virex-deepink text-virex-warmwhite ${large ? "py-[clamp(96px,12vw,176px)]" : "section-y-sm"}`}
    >
      <div className="container flex flex-wrap items-end justify-between gap-x-24 gap-y-12">
        <h2
          id={id}
          className={`min-w-0 flex-[1_1_480px] ${large ? "font-serif text-[clamp(42px,5.6vw,84px)] font-light leading-[1.04] tracking-[-0.02em]" : "type-cta"}`}
        >
          {title}
        </h2>
        {children ? (
          <div className="min-w-0 flex-[0_1_400px]">
            <p className="text-[17px] leading-[1.75] text-virex-stone">{children}</p>
            <ButtonLink href={cta.href} variant="light" arrow className="mt-9">
              {cta.label}
            </ButtonLink>
          </div>
        ) : (
          <ButtonLink href={cta.href} variant="light" arrow>
            {cta.label}
          </ButtonLink>
        )}
      </div>
    </section>
  );
}

/** Decorative image wrapper. Images are brand-toned placeholders (see public/images). */
export function Artwork({
  src,
  alt,
  className = "",
  imgClassName = "",
  zoom = false,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  zoom?: boolean;
}) {
  return (
    <div className={`overflow-hidden bg-virex-stone ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- static SVG artwork */}
      <img
        src={src}
        alt={alt}
        className={`block size-full object-cover ${zoom ? "vx-img" : ""} ${imgClassName}`}
      />
    </div>
  );
}
