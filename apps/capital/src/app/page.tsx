import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FadeIn, LineReveal } from "@virex/ui";
import { PORTFOLIO_GROUPS, getByType } from "@virex/content";
import { buildMetadata } from "../lib/metadata";

export const metadata = buildMetadata({
  title: "Virex Capital",
  description: "Virex Capital is a private investment and operating group deploying permanent, proprietary capital with a long-term ownership perspective.",
  path: "/",
});

export default function Home() {
  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* Hero */}
      <section className="min-h-[90vh] flex flex-col justify-center pt-32 pb-16 relative">
        <div className="absolute inset-0 bg-virex-stone/5 -z-10" />
        <div className="container max-w-6xl">
          <FadeIn>
            <span className="text-sm font-semibold tracking-widest text-virex-muted uppercase mb-12 block">
              Virex Capital
            </span>
            <div className="max-w-4xl">
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-serif text-virex-deepink leading-[1.05] mb-12 tracking-tight">
                Capital with a <br />
                <span className="text-virex-forest italic">permanent horizon.</span>
              </h1>
              <p className="text-xl md:text-2xl text-virex-muted leading-relaxed max-w-3xl">
                We invest in and build businesses, infrastructure, and real assets with an absolute focus on durable ownership and compounding long-term value.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-32 border-y border-virex-stone/30">
        <div className="container max-w-6xl">
          <FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-serif text-virex-deepink mb-8">
                  We invest with <br /> ownership in mind.
                </h2>
                <div className="w-16 h-px bg-virex-forest mb-8"></div>
                <p className="text-lg text-virex-muted leading-relaxed mb-10">
                  Virex Capital takes an uncompromising, long-term approach to capital allocation. Operating from a permanent capital base within the Virex Holding Group, we deploy capital entirely free from the structural constraints and liquidity demands of traditional fund lifecycles.
                </p>
                <Link
                  href="/about"
                  className="inline-flex items-center justify-center bg-virex-forest text-virex-white px-8 py-4 text-sm font-semibold tracking-widest uppercase hover:bg-virex-deepink transition-colors"
                >
                  Our Ethos
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-virex-stone/30 border border-virex-stone/30">
                <div className="bg-virex-white p-10 flex flex-col items-center justify-center text-center aspect-square">
                  <span className="font-serif text-5xl text-virex-deepink mb-2">01</span>
                  <span className="text-xs tracking-widest uppercase text-virex-muted font-semibold">Decades</span>
                </div>
                <div className="bg-virex-stone/5 p-10 flex flex-col items-center justify-center text-center aspect-square">
                  <span className="font-serif text-5xl text-virex-deepink mb-2">100%</span>
                  <span className="text-xs tracking-widest uppercase text-virex-muted font-semibold">Proprietary</span>
                </div>
                <div className="bg-virex-stone/5 p-10 flex flex-col items-center justify-center text-center aspect-square">
                  <span className="font-serif text-5xl text-virex-deepink mb-2">0</span>
                  <span className="text-xs tracking-widest uppercase text-virex-muted font-semibold">LPs</span>
                </div>
                <div className="bg-virex-deepink text-virex-white p-10 flex flex-col items-center justify-center text-center aspect-square">
                  <span className="font-serif text-4xl mb-2">∞</span>
                  <span className="text-xs tracking-widest uppercase text-virex-white/70 font-semibold">Horizon</span>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-32 bg-virex-stone/5">
        <div className="container max-w-6xl">
          <FadeIn className="mb-20">
            <h2 className="text-4xl md:text-5xl font-serif text-virex-deepink text-center">
              Investment Philosophy
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            <FadeIn delay={0.1} className="flex flex-col h-full border-t border-virex-deepink pt-6">
              <span className="text-[10px] font-bold tracking-widest text-virex-muted mb-6">01</span>
              <h3 className="text-xl font-serif text-virex-deepink mb-4">Permanent</h3>
              <p className="text-sm text-virex-muted leading-relaxed flex-grow">
                We think beyond short investment cycles. Our permanent capital base allows us to make decisions that maximize value over decades, rather than optimizing for quarterly reports or fund exit timelines.
              </p>
            </FadeIn>

            <FadeIn delay={0.2} className="flex flex-col h-full border-t border-virex-deepink pt-6">
              <span className="text-[10px] font-bold tracking-widest text-virex-muted mb-6">02</span>
              <h3 className="text-xl font-serif text-virex-deepink mb-4">Ownership</h3>
              <p className="text-sm text-virex-muted leading-relaxed flex-grow">
                We seek meaningful positions where ownership matters. Whether outright or alongside aligned partners, we act as engaged stewards of capital rather than passive speculators.
              </p>
            </FadeIn>

            <FadeIn delay={0.3} className="flex flex-col h-full border-t border-virex-deepink pt-6">
              <span className="text-[10px] font-bold tracking-widest text-virex-muted mb-6">03</span>
              <h3 className="text-xl font-serif text-virex-deepink mb-4">Focus</h3>
              <p className="text-sm text-virex-muted leading-relaxed flex-grow">
                We invest where we can deeply understand the business, the underlying asset, and its potential. We avoid complex financial engineering in favor of fundamental operational value.
              </p>
            </FadeIn>

            <FadeIn delay={0.4} className="flex flex-col h-full border-t border-virex-deepink pt-6">
              <span className="text-[10px] font-bold tracking-widest text-virex-muted mb-6">04</span>
              <h3 className="text-xl font-serif text-virex-deepink mb-4">Alignment</h3>
              <p className="text-sm text-virex-muted leading-relaxed flex-grow">
                We build relationships around shared long-term interests. Perfect structural alignment between owners, management, and underlying business fundamentals is an absolute prerequisite.
              </p>
            </FadeIn>
          </div>

          <div className="mt-16 text-center">
            <Link
              href="/approach"
              className="inline-flex items-center gap-2 text-sm font-semibold tracking-widest uppercase text-virex-deepink hover:text-virex-forest transition-colors"
            >
              Read our approach <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <LineReveal className="max-w-6xl mx-auto px-6" />

      {/* Investment Categories */}
      <section className="py-32">
        <div className="container max-w-6xl">
          <FadeIn className="mb-20">
            <h2 className="text-4xl md:text-5xl font-serif text-virex-deepink">
              Capital Deployment
            </h2>
          </FadeIn>

          <div className="flex flex-col border-t border-virex-stone/50">
            {PORTFOLIO_GROUPS.map((type, i) => {
              const count = getByType(type).length;
              return (
                <FadeIn key={type} delay={i * 0.1}>
                  <Link
                    href="/portfolio"
                    className="group flex flex-col lg:flex-row lg:items-center justify-between py-12 border-b border-virex-stone/50 hover:bg-virex-stone/5 transition-colors px-6 -mx-6"
                  >
                    <div className="lg:w-1/3 mb-6 lg:mb-0">
                      <h3 className="text-2xl font-serif text-virex-deepink group-hover:text-virex-forest transition-colors">
                        {type}
                      </h3>
                    </div>
                    <div className="lg:w-1/2 pr-8 mb-8 lg:mb-0">
                      <p className="text-virex-muted text-base leading-relaxed">
                        {type === "Direct Ownership"
                          ? "100% ownership of operating businesses, serving as the permanent platform for value creation."
                          : type === "Majority Investment"
                            ? "Controlling stakes in established businesses alongside founders or aligned co-investors."
                            : type === "Minority Investment"
                              ? "Strategic minority positions in high-quality assets with strong governance rights."
                              : "Early-stage capital for specialized technology and infrastructure companies."}
                      </p>
                    </div>
                    <div className="lg:w-1/6 flex items-center justify-between lg:justify-end gap-6">
                      <span className="text-xs font-semibold tracking-widest text-virex-muted uppercase group-hover:text-virex-deepink transition-colors">
                        {count} {count === 1 ? "Asset" : "Assets"}
                      </span>
                      <ArrowRight className="w-5 h-5 text-virex-stone group-hover:text-virex-forest transition-colors transform group-hover:translate-x-1 duration-300" />
                    </div>
                  </Link>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
