import { FadeIn, LineReveal } from "@virex/ui";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buildMetadata } from "../../lib/metadata";

export const metadata = buildMetadata({
  title: "Investments — Virex Capital",
  description: "The investment universe and capital deployment strategy of Virex Capital B.V.",
  path: "/investments",
});

export default function Investments() {
  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* Hero */}
      <section className="pt-40 pb-20 border-b border-virex-stone/30">
        <div className="container max-w-6xl">
          <FadeIn>
            <span className="text-sm font-semibold tracking-widest text-virex-muted uppercase mb-8 block">
              Investment Universe
            </span>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
              <div className="lg:col-span-8">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-virex-deepink leading-[1.05] mb-8 tracking-tight">
                  Where we <br />
                  <span className="text-virex-forest italic">deploy capital.</span>
                </h1>
                <p className="text-xl text-virex-muted leading-relaxed max-w-2xl">
                  Our investment universe is firmly concentrated on foundational sectors where long-term ownership creates unassailable structural advantages.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Sectors */}
      <section className="py-24">
        <div className="container max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">

            <FadeIn>
              <div className="h-full border-t-2 border-virex-forest pt-8">
                <span className="text-[10px] font-bold tracking-widest text-virex-muted block mb-8">01</span>
                <h2 className="text-3xl font-serif text-virex-deepink mb-6">Operating Businesses</h2>
                <div className="prose prose-lg prose-p:text-virex-muted max-w-none">
                  <p>
                    We acquire and build established, cash-generative businesses with highly defensible market positions. We actively seek out operational complexity where our long-term perspective and proprietary holding structure can unlock fundamental value that highly-leveraged, traditional private equity models cannot access.
                  </p>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="h-full border-t-2 border-virex-forest pt-8">
                <span className="text-[10px] font-bold tracking-widest text-virex-muted block mb-8">02</span>
                <h2 className="text-3xl font-serif text-virex-deepink mb-6">Infrastructure</h2>
                <div className="prose prose-lg prose-p:text-virex-muted max-w-none">
                  <p>
                    Infrastructure forms the absolute backbone of the modern economy. We invest in physical and digital infrastructure assets that offer highly predictable, inflation-protected yields over multi-decade horizons. Our core focus includes energy transition assets, critical logistics networks, and specialized heavy facilities.
                  </p>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="h-full border-t-2 border-virex-forest pt-8">
                <span className="text-[10px] font-bold tracking-widest text-virex-muted block mb-8">03</span>
                <h2 className="text-3xl font-serif text-virex-deepink mb-6">Industrial Technology</h2>
                <div className="prose prose-lg prose-p:text-virex-muted max-w-none">
                  <p>
                    We deploy targeted capital into mission-critical B2B software, specialized technology platforms, and advanced industrial automation. We strongly prefer established businesses with massive switching costs and sticky recurring revenues over speculative, cash-burning consumer models.
                  </p>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="h-full border-t-2 border-virex-forest pt-8">
                <span className="text-[10px] font-bold tracking-widest text-virex-muted block mb-8">04</span>
                <h2 className="text-3xl font-serif text-virex-deepink mb-6">Real Assets</h2>
                <div className="prose prose-lg prose-p:text-virex-muted max-w-none">
                  <p>
                    Strategic real estate and physical assets provide fundamental, hard-asset downside protection to our aggregate portfolio. We focus intensely on commercial, industrial, and highly specialized real estate that either directly supports our operating businesses or offers distinct, uncorrelated value-add opportunities.
                  </p>
                </div>
              </div>
            </FadeIn>

          </div>

          <LineReveal className="my-24" />

          <FadeIn className="text-center">
            <h2 className="text-3xl font-serif text-virex-deepink mb-8">View our active positions</h2>
            <Link
              href="/portfolio"
              className="inline-flex items-center justify-center bg-virex-forest text-virex-white px-10 py-5 text-sm font-semibold tracking-widest uppercase hover:bg-virex-deepink transition-all hover:px-12"
            >
              The Portfolio <ArrowRight className="w-4 h-4 ml-3" />
            </Link>
          </FadeIn>

        </div>
      </section>
    </div>
  );
}
