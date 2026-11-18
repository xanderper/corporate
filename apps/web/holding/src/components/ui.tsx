import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Tone = "light" | "dark";

/**
 * Mono label above a heading, led by a small square marker
 * (signal green on dark, forest on light).
 */
export function Eyebrow({
  children,
  tone = "light",
  marker = true,
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  marker?: boolean;
  className?: string;
}) {
  return (
    <p
      className={`mb-8 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.08em] ${
        tone === "dark" ? "text-virex-sage" : "text-virex-muted"
      } ${className}`}
    >
      {marker && (
        <span
          aria-hidden="true"
          className={`inline-block size-[7px] ${tone === "dark" ? "bg-virex-signal" : "bg-virex-forest"}`}
        />
      )}
      {children}
    </p>
  );
}

export function Accent({ children, tone = "light" }: { children: ReactNode; tone?: Tone }) {
  return (
    <em className={`italic ${tone === "dark" ? "text-virex-warmstone" : "text-virex-forest"}`}>{children}</em>
  );
}

export function Arrow() {
  return (
    <span className="vx-arrow" aria-hidden="true">
      →
    </span>
  );
}

const buttonVariants = {
  dark: "bg-virex-deepink text-virex-warmwhite hover:bg-virex-forest",
  light: "bg-virex-warmwhite text-virex-deepink hover:bg-virex-stone",
  ghost: "border border-virex-warmwhite/40 text-virex-warmwhite hover:border-virex-warmwhite",
} as const;

export function ButtonLink({
  href,
  children,
  variant = "dark",
  arrow = false,
  external = false,
  className = "",
  ...rest
}: {
  href: string;
  children: ReactNode;
  variant?: keyof typeof buttonVariants;
  arrow?: boolean;
  external?: boolean;
  className?: string;
} & Omit<ComponentProps<typeof Link>, "href" | "className" | "children">) {
  const classes = `inline-flex min-h-[52px] items-center gap-3 px-7 text-sm font-semibold tracking-[0.02em] transition-colors duration-300 ${buttonVariants[variant]} ${className}`;
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {children} <span aria-hidden="true">↗</span>
      </a>
    );
  }
  return (
    <Link href={href} className={classes} {...rest}>
      {children}
      {arrow && <Arrow />}
    </Link>
  );
}

export function TextLink({
  href,
  children,
  tone = "light",
  muted = false,
  external = false,
  className = "",
}: {
  href: string;
  children: ReactNode;
  tone?: Tone;
  muted?: boolean;
  external?: boolean;
  className?: string;
}) {
  const color =
    tone === "dark" ? "text-virex-warmwhite" : muted ? "text-virex-muted hover:text-virex-deepink" : "text-virex-forest hover:text-virex-deepink";
  const classes = `inline-flex min-h-11 items-center gap-2.5 text-sm font-semibold ${color} ${className}`;
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        <span className="vx-link">{children}</span>
        <span aria-hidden="true">↗</span>
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      <span className="vx-link">{children}</span>
      <Arrow />
    </Link>
  );
}

/** Light closing band: question + dark button. */
export function ContactBand({ id, eyebrow, title }: { id: string; eyebrow?: string; title: ReactNode }) {
  return (
    <section aria-labelledby={id} className="py-[clamp(80px,10vw,136px)]">
      <div className="container flex flex-wrap items-end justify-between gap-x-24 gap-y-8">
        <div className="min-w-0 flex-[1_1_520px]">
          {eyebrow && (
            <Eyebrow marker={false} className="mb-6">
              {eyebrow}
            </Eyebrow>
          )}
          <h2 id={id} className="font-serif text-[clamp(32px,3.4vw,48px)] font-light leading-[1.12]">
            {title}
          </h2>
        </div>
        <ButtonLink href="/contact" arrow>
          Contact Virex Holding
        </ButtonLink>
      </div>
    </section>
  );
}

export function Artwork({
  src,
  alt,
  className = "",
  imgClassName = "",
  position,
  zoom = false,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  position?: string;
  zoom?: boolean;
}) {
  return (
    <div className={`overflow-hidden bg-virex-stone ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- static SVG artwork */}
      <img
        src={src}
        alt={alt}
        style={position ? { objectPosition: position } : undefined}
        className={`block size-full object-cover ${zoom ? "vx-img" : ""} ${imgClassName}`}
      />
    </div>
  );
}
