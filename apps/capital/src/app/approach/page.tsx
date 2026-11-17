import { FadeIn } from "@virex/ui";
import { buildMetadata } from "../../lib/metadata";

export const metadata = buildMetadata({
  title: "Approach — Virex Capital",
  description: "The investment philosophy and capital allocation approach of Virex Capital B.V.",
  path: "/approach",
});

export default function Approach() {
  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* Hero */}
      <section className="pt-40 pb-20 border-b border-virex-stone/30">
        <div className="container max-w-6xl">
          <FadeIn>
            <span className="text-sm font-semibold tracking-widest text-virex-muted uppercase mb-8 block">
              Investment Approach
            </span>
            <div className="max-w-4xl">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-virex-deepink leading-[1.05] mb-8 tracking-tight">
                How we <br />
                <span className="text-virex-forest italic">allocate capital.</span>
              </h1>
              <p className="text-xl text-virex-muted leading-relaxed">
                Our approach is defined by structural patience, rigorous asset selection, and a commitment to deep operational stewardship over decades.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Core Principles */}
      <section className="py-24">
        <div className="container max-w-6xl">
          <div className="flex flex-col border-t border-virex-deepink">

            <FadeIn>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start py-16 border-b border-virex-stone/30">
                <div className="lg:col-span-4">
                  <span className="text-[10px] font-bold tracking-widest text-virex-muted mb-6 block">01</span>
                  <h2 className="text-3xl font-serif text-virex-deepink">Long-term <br /> ownership</h2>
                </div>
                <div className="lg:col-span-8">
                  <div className="prose prose-lg prose-p:text-virex-muted max-w-none">
                    <p className="text-xl text-virex-deepink mb-6">
                      We underwrite for permanence, not for an exit multiple.
                    </p>
                    <p>
                      As a privately held capital group, we are not constrained by traditional fund structures or the artificial time horizons they enforce. We do not underwrite investments based on assumed exit multiples in year five. Instead, we seek businesses and assets that we would be comfortable owning indefinitely, focusing entirely on cash flow generation, capital compounding, and durable competitive advantages.
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start py-16 border-b border-virex-stone/30">
                <div className="lg:col-span-4">
                  <span className="text-[10px] font-bold tracking-widest text-virex-muted mb-6 block">02</span>
                  <h2 className="text-3xl font-serif text-virex-deepink">Selective <br /> allocation</h2>
                </div>
                <div className="lg:col-span-8">
                  <div className="prose prose-lg prose-p:text-virex-muted max-w-none">
                    <p className="text-xl text-virex-deepink mb-6">
                      We have no mandate to deploy capital simply because it is available.
                    </p>
                    <p>
                      We are highly selective, acting only when we identify clear asymmetrical risk-reward dynamics and exceptional asset quality. This restraint allows us to completely avoid the herd mentality prevalent in institutional investing and focus our absolute resources and operational bandwidth on our highest-conviction ideas.
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start py-16 border-b border-virex-stone/30">
                <div className="lg:col-span-4">
                  <span className="text-[10px] font-bold tracking-widest text-virex-muted mb-6 block">03</span>
                  <h2 className="text-3xl font-serif text-virex-deepink">Operational <br /> understanding</h2>
                </div>
                <div className="lg:col-span-8">
                  <div className="prose prose-lg prose-p:text-virex-muted max-w-none">
                    <p className="text-xl text-virex-deepink mb-6">
                      Financial engineering cannot compensate for a poor underlying business.
                    </p>
                    <p>
                      We look beyond spreadsheets to understand the fundamental operational mechanics, market dynamics, technical debt, and customer dependencies of potential investments. Our team brings direct operating experience to every transaction, evaluating companies as businesses rather than financial instruments.
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start py-16">
                <div className="lg:col-span-4">
                  <span className="text-[10px] font-bold tracking-widest text-virex-muted mb-6 block">04</span>
                  <h2 className="text-3xl font-serif text-virex-deepink">Absolute <br /> alignment</h2>
                </div>
                <div className="lg:col-span-8">
                  <div className="prose prose-lg prose-p:text-virex-muted max-w-none">
                    <p className="text-xl text-virex-deepink mb-6">
                      Structural alignment between owners, management teams, and the business itself is critical.
                    </p>
                    <p>
                      We design our partnerships to ensure that all parties share the exact same incentives, timelines, and definition of success. When we invest alongside founders or co-investors, we act as a stabilizing, supportive presence capable of navigating complex restructuring, multi-year strategic pivots, and significant capital expenditure cycles that public markets simply cannot tolerate.
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>

          </div>
        </div>
      </section>
    </div>
  );
}
