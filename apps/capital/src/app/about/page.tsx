import Link from "next/link";
import { FadeIn, LineReveal } from "@virex/ui";
import { ArrowRight } from "lucide-react";
import { buildMetadata } from "../../lib/metadata";

export const metadata = buildMetadata({
  title: "About — Virex Capital",
  description: "Virex Capital is a proprietary investment and operating group focused on permanent capital and long-term ownership.",
  path: "/about",
});

export default function About() {
  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* Hero */}
      <section className="pt-40 pb-20 border-b border-virex-stone/30">
        <div className="container max-w-6xl">
          <FadeIn>
            <span className="text-sm font-semibold tracking-widest text-virex-muted uppercase mb-8 block">
              About Virex Capital
            </span>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
              <div className="lg:col-span-8">
                <h1 className="text-5xl md:text-6xl font-serif text-virex-deepink leading-[1.1] mb-8">
                  A proprietary <br />
                  <span className="text-virex-forest italic">capital base.</span>
                </h1>
                <p className="text-xl text-virex-muted leading-relaxed max-w-2xl">
                  Virex Capital is a private investment and operating group. We deploy capital with an absolute focus on long-term stewardship, structurally immune to the short-term pressures of public markets.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Structural Advantage */}
      <section className="py-24">
        <div className="container max-w-6xl">
          <FadeIn>
            <span className="text-[10px] font-bold tracking-widest text-virex-muted uppercase mb-6 block">
              The Structural Advantage
            </span>
            <h2 className="text-3xl md:text-4xl font-serif text-virex-deepink mb-8">Permanent Capital</h2>
            <div className="w-16 h-px bg-virex-forest mb-8"></div>
            <p className="text-xl text-virex-deepink leading-relaxed max-w-3xl">
              Virex Capital operates without the traditional fund lifecycle. We invest entirely from a permanent, proprietary capital base — free from predetermined exit periods, external fundraising cycles, and the artificial five-to-ten year horizons that constrain traditional private equity and venture capital.
            </p>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-8 mt-16 pt-16 border-t border-virex-stone/30">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold tracking-widest text-virex-muted mb-4">01</span>
                <h3 className="font-serif text-xl text-virex-deepink mb-3">No Mandated Exits</h3>
                <p className="text-sm text-virex-muted leading-relaxed">
                  We invest with the ability to hold assets and businesses for as long as the underlying value creation opportunity remains compelling.
                </p>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold tracking-widest text-virex-muted mb-4">02</span>
                <h3 className="font-serif text-xl text-virex-deepink mb-3">Operational Value</h3>
                <p className="text-sm text-virex-muted leading-relaxed">
                  We focus on businesses with strong fundamentals, acting as genuine partners to founders and management teams where active ownership and operational discipline can create meaningful value.
                </p>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold tracking-widest text-virex-muted mb-4">03</span>
                <h3 className="font-serif text-xl text-virex-deepink mb-3">Absolute Returns</h3>
                <p className="text-sm text-virex-muted leading-relaxed">
                  We evaluate opportunities through the lens of long-term value creation and absolute capital growth rather than short-term benchmark performance.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <LineReveal className="max-w-6xl mx-auto px-6" />

      {/* Investment Philosophy */}
      <section className="py-24">
        <div className="container max-w-6xl">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-serif text-virex-deepink mb-16">How We Think About Capital</h2>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            <FadeIn delay={0.05} className="flex flex-col border-t border-virex-deepink pt-6">
              <span className="text-[10px] font-bold tracking-widest text-virex-muted mb-4">01</span>
              <h3 className="font-serif text-xl text-virex-deepink mb-3">Own</h3>
              <p className="text-sm text-virex-muted leading-relaxed">We prefer ownership over exposure.</p>
            </FadeIn>
            <FadeIn delay={0.1} className="flex flex-col border-t border-virex-deepink pt-6">
              <span className="text-[10px] font-bold tracking-widest text-virex-muted mb-4">02</span>
              <h3 className="font-serif text-xl text-virex-deepink mb-3">Compound</h3>
              <p className="text-sm text-virex-muted leading-relaxed">We focus on businesses and assets capable of compounding value over time.</p>
            </FadeIn>
            <FadeIn delay={0.15} className="flex flex-col border-t border-virex-deepink pt-6">
              <span className="text-[10px] font-bold tracking-widest text-virex-muted mb-4">03</span>
              <h3 className="font-serif text-xl text-virex-deepink mb-3">Build</h3>
              <p className="text-sm text-virex-muted leading-relaxed">We work alongside management and founders to strengthen the underlying business.</p>
            </FadeIn>
            <FadeIn delay={0.2} className="flex flex-col border-t border-virex-deepink pt-6">
              <span className="text-[10px] font-bold tracking-widest text-virex-muted mb-4">04</span>
              <h3 className="font-serif text-xl text-virex-deepink mb-3">Hold</h3>
              <p className="text-sm text-virex-muted leading-relaxed">We are not forced sellers. Time is an advantage when capital is permanent.</p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Statement */}
      <section className="pb-24">
        <div className="container max-w-4xl text-center">
          <FadeIn>
            <p className="font-serif italic text-2xl md:text-3xl text-virex-forest leading-snug">
              Permanent capital creates a different relationship with time.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Group Affiliation */}
      <section className="py-24">
        <div className="container max-w-6xl">
          <FadeIn>
            <div className="bg-virex-deepink text-virex-white p-12 md:p-20">
              <div className="max-w-2xl">
                <span className="text-[10px] font-bold tracking-widest text-virex-sage uppercase mb-6 block">
                  Group Affiliation
                </span>
                <h2 className="text-2xl md:text-3xl font-serif leading-snug mb-8">
                  Virex Capital B.V. operates as a specialized investment subsidiary within Virex Holding Group B.V.
                </h2>
                <p className="text-virex-white/70 leading-relaxed text-lg mb-10">
                  The group provides the long-term ownership framework, while Virex Capital independently manages its investment mandate, portfolio and capital allocation.
                </p>
                <Link
                  href="/structure"
                  className="inline-flex items-center gap-2 text-sm font-semibold tracking-widest uppercase text-virex-white hover:text-virex-sage transition-colors"
                >
                  Explore the Virex Group <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
