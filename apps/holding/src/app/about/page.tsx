import { FadeIn, LineReveal } from "@virex/ui";
import { Compass, Clock, Anchor, Activity } from "lucide-react";

export const metadata = {
  title: "About ",
  description: "About Virex Holding Group B.V. and our core philosophy.",
};

export default function About() {
  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* Hero */}
      <section className="pt-40 pb-20 border-b border-virex-stone/30">
        <div className="container max-w-6xl">
          <FadeIn>
            <span className="text-sm font-semibold tracking-widest text-virex-muted uppercase mb-8 block">
              About The Group
            </span>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
              <div className="lg:col-span-8">
                <h1 className="text-5xl md:text-6xl font-serif text-virex-deepink leading-[1.1] mb-8">
                  Decades, <br />
                  <span className="text-virex-forest italic">not quarters.</span>
                </h1>
                <p className="text-xl text-virex-muted leading-relaxed max-w-2xl">
                  We are a private group structured for permanence. We build, hold, and compound value across generations without the interference of short-term market cycles.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* The Premise */}
      <section className="py-24">
        <div className="container max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeIn>
              <h2 className="text-3xl font-serif text-virex-deepink mb-8">The Premise</h2>
              <div className="prose prose-virex prose-lg prose-p:text-virex-muted prose-p:leading-relaxed">
                <p>
                  Virex Holding Group was founded on a very simple observation: <strong>truly exceptional businesses require time to compound.</strong>
                </p>
                <p>
                  They require leaders who are empowered to optimize for the next ten years rather than the next ten weeks. They require owners who provide the stability, capital, and patience to execute complex, multi-layered strategies.
                </p>
                <p>
                  Most modern capital structures enforce artificial time horizons. Investment funds must eventually exit to return capital to LPs, and public markets demand quarterly earnings beats. This structural reality creates a fundamental misalignment between the owners and the actual needs of businesses operating in foundational sectors.
                </p>
                <p>
                  We established Virex Holding Group to solve this problem.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-virex-stone/10 p-8 border border-virex-stone/30">
                  <Compass className="w-8 h-8 text-virex-forest mb-6" />
                  <h3 className="font-serif text-lg text-virex-deepink mb-2">Independent</h3>
                  <p className="text-sm text-virex-muted">Privately held and immune to the whims of public market sentiment.</p>
                </div>
                <div className="bg-virex-stone/10 p-8 border border-virex-stone/30 mt-0 sm:mt-12">
                  <Clock className="w-8 h-8 text-virex-forest mb-6" />
                  <h3 className="font-serif text-lg text-virex-deepink mb-2">Patient</h3>
                  <p className="text-sm text-virex-muted">Capital that does not have an expiration date or forced exit timeline.</p>
                </div>
                <div className="bg-virex-stone/10 p-8 border border-virex-stone/30">
                  <Anchor className="w-8 h-8 text-virex-forest mb-6" />
                  <h3 className="font-serif text-lg text-virex-deepink mb-2">Stable</h3>
                  <p className="text-sm text-virex-muted">A governance structure explicitly designed to prevent hostile interference.</p>
                </div>
                <div className="bg-virex-stone/10 p-8 border border-virex-stone/30 mt-0 sm:mt-12">
                  <Activity className="w-8 h-8 text-virex-forest mb-6" />
                  <h3 className="font-serif text-lg text-virex-deepink mb-2">Focused</h3>
                  <p className="text-sm text-virex-muted">Strict adherence to our core competencies: capital, and infrastructure.</p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <LineReveal className="max-w-6xl mx-auto px-6" />

      {/* Philosophy Details */}
      <section className="py-24 bg-virex-warmwhite">
        <div className="container max-w-4xl">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl font-serif text-virex-deepink mb-4">Our Approach</h2>
              <p className="text-virex-muted">We do not seek to be the largest group, but rather the most durable.</p>
            </div>

            <div className="space-y-12">
              <div className="flex flex-col md:flex-row gap-6 md:gap-12 pb-12 border-b border-virex-stone/50">
                <div className="md:w-1/3 shrink-0">
                  <h3 className="text-xl font-serif text-virex-deepink">Conservative Structure.</h3>
                </div>
                <div className="md:w-2/3">
                  <p className="text-virex-muted leading-relaxed">
                    We maintain a fortress balance sheet at the holding level. We believe that surviving the inevitable economic winters is the prerequisite to long-term compounding. We do not cross-collateralize our subsidiaries, ensuring that systemic risk is perpetually contained.
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6 md:gap-12 pb-12 border-b border-virex-stone/50">
                <div className="md:w-1/3 shrink-0">
                  <h3 className="text-xl font-serif text-virex-deepink">Aggressive Execution.</h3>
                </div>
                <div className="md:w-2/3">
                  <p className="text-virex-muted leading-relaxed">
                    While our structure is conservative, our operating companies are mandated to be aggressively entrepreneurial. Because they do not have to worry about the parent company&apos;s solvency or liquidity, they can take calculated, long-term risks that their publicly traded peers cannot.
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6 md:gap-12">
                <div className="md:w-1/3 shrink-0">
                  <h3 className="text-xl font-serif text-virex-deepink">Uncompromising Ownership.</h3>
                </div>
                <div className="md:w-2/3">
                  <p className="text-virex-muted leading-relaxed">
                    We view our subsidiaries as permanent assets. We do not acquire businesses with the intent to flip them for a quick multiple expansion. When we enter a market, we enter it with the intent to remain there indefinitely.
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
