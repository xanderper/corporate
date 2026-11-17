import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";
import { FadeIn } from "@virex/ui";
import { PORTFOLIO_GROUPS, getByType } from "@virex/content";
import { buildMetadata } from "../../lib/metadata";

export const metadata = buildMetadata({
  title: "Portfolio — Virex Capital",
  description: "The investment portfolio of Virex Capital B.V., spanning direct ownership, majority, minority and venture positions.",
  path: "/portfolio",
});

export default function Portfolio() {
  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* Header */}
      <section className="pt-40 pb-20 border-b border-virex-stone/30">
        <div className="container max-w-6xl">
          <FadeIn>
            <span className="text-sm font-semibold tracking-widest text-virex-muted uppercase mb-8 block">
              Portfolio
            </span>
            <div className="max-w-4xl">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-virex-deepink leading-[1.05] mb-8 tracking-tight">
                Capital deployed across <br />
                <span className="text-virex-forest italic">businesses and assets.</span>
              </h1>
              <p className="text-xl text-virex-muted leading-relaxed">
                Virex Capital&apos;s investment portfolio spans absolute direct ownership, strategic majority positions, minority stakes, and specialized venture investments across Europe.
              </p>
            </div>
          </FadeIn>

          {/* Demo note */}
          <FadeIn delay={0.15} className="mt-16">
            <div className="border border-virex-stone/50 bg-virex-stone/5 px-6 py-4 flex items-center gap-4 text-sm text-virex-muted max-w-2xl">
              <Lock className="w-4 h-4 text-virex-deepink shrink-0" />
              <span>
                <strong className="text-virex-deepink font-medium">Confidentiality Notice — </strong>
                The portfolio companies shown below represent indicative demonstration data. The actual Virex Capital portfolio is held privately.
              </span>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Portfolio Directory */}
      <section className="py-24">
        <div className="container max-w-6xl">
          {PORTFOLIO_GROUPS.map((type) => {
            const items = getByType(type);
            if (items.length === 0) return null;

            return (
              <div key={type} className="mb-24 last:mb-0">
                <FadeIn>
                  <div className="flex items-end justify-between border-b-2 border-virex-forest pb-6 mb-4">
                    <h2 className="text-3xl font-serif text-virex-deepink">
                      {type}
                    </h2>
                    <span className="text-xs font-semibold tracking-widest uppercase text-virex-muted">
                      {items.length} {items.length === 1 ? "Asset" : "Assets"}
                    </span>
                  </div>
                </FadeIn>

                <div className="flex flex-col">
                  {items.map((company, idx) => (
                    <FadeIn key={company.id} delay={idx * 0.05}>
                      <Link
                        href={`/portfolio/${company.id}`}
                        className="group flex flex-col lg:flex-row lg:items-center justify-between py-10 border-b border-virex-stone/30 hover:bg-virex-stone/5 transition-colors -mx-6 px-6"
                      >
                        <div className="lg:w-1/3 mb-4 lg:mb-0">
                          <h3 className="text-2xl font-serif text-virex-deepink group-hover:text-virex-forest transition-colors">
                            {company.name}
                          </h3>
                        </div>
                        <div className="lg:w-1/3 mb-6 lg:mb-0 pr-8">
                          <p className="text-sm text-virex-muted leading-relaxed line-clamp-2">
                            {company.description}
                          </p>
                        </div>
                        <div className="lg:w-1/3 flex items-center justify-between lg:justify-end gap-6">
                          <div className="flex flex-col items-start lg:items-end gap-1">
                            <span className="text-xs font-medium text-virex-muted uppercase tracking-wider">
                              {company.sector} · {company.geography.join(" / ")}
                            </span>
                            <span className="text-xs font-bold tracking-widest uppercase text-virex-deepink">
                              {company.ownership}% Stake
                            </span>
                          </div>
                          <ArrowRight className="w-5 h-5 text-virex-stone group-hover:text-virex-forest group-hover:translate-x-1 transition-all shrink-0" />
                        </div>
                      </Link>
                    </FadeIn>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
