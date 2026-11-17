import Link from "next/link";
import { ArrowRight, Building, Globe, Layers } from "lucide-react";
import { FadeIn, LineReveal } from "@virex/ui";
import { GROUP_COMPANIES } from "@virex/content";

export const metadata = {
  title: "Virex Holding Group B.V.",
  description:
    "Virex Holding Group is the ownership and governance structure behind a group of independent businesses operating across capital, financial infrastructure and digital infrastructure.",
};

export default function Home() {
  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* Hero */}
      <section className="min-h-[90vh] flex flex-col justify-center pt-32 pb-16 relative">
        <div className="absolute inset-0 bg-virex-stone/5 -z-10" />
        <div className="container max-w-6xl">
          <FadeIn>
            <span className="text-sm font-semibold tracking-widest text-virex-muted uppercase mb-12 block">
              Virex Holding Group
            </span>
            <div className="max-w-4xl">
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-serif text-virex-deepink leading-[1.05] mb-12 tracking-tight">
                Long-term ownership. <br />
                Distinct businesses. <br />
                <span className="text-virex-forest italic">One group.</span>
              </h1>
              <p className="text-xl md:text-2xl text-virex-muted leading-relaxed max-w-3xl">
                Virex Holding Group is the ownership and governance structure
                behind a group of independent businesses operating across capital,
                financial technology, and digital infrastructure.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* The Group Model */}
      <section className="py-24 border-y border-virex-stone/30">
        <div className="container max-w-6xl">
          <FadeIn>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-serif text-virex-deepink mb-8">
                  Architected for <br /> permanence.
                </h2>
                <div className="w-16 h-px bg-virex-forest mb-8"></div>
                <p className="text-lg text-virex-muted leading-relaxed mb-10">
                  We build, acquire, and hold businesses with a multi-decade perspective. By shielding our operating companies from the short-term pressures of public markets, we empower management teams to make decisions that compound value over generations.
                </p>
                <div className="flex flex-wrap gap-6">
                  <Link
                    href="/group"
                    className="inline-flex items-center gap-2 text-sm font-semibold tracking-widest uppercase text-virex-deepink hover:text-virex-forest transition-colors"
                  >
                    Our Operating Model <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/ownership"
                    className="inline-flex items-center gap-2 text-sm font-semibold tracking-widest uppercase text-virex-muted hover:text-virex-deepink transition-colors"
                  >
                    View Ownership Structure <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-virex-stone/30 border border-virex-stone/30">
                <div className="bg-virex-white p-8">
                  <Building className="w-6 h-6 text-virex-forest mb-4" />
                  <h3 className="font-serif text-virex-deepink text-lg mb-2">Decentralized</h3>
                  <p className="text-sm text-virex-muted">Independent execution at the subsidiary level.</p>
                </div>
                <div className="bg-virex-white p-8">
                  <Globe className="w-6 h-6 text-virex-forest mb-4" />
                  <h3 className="font-serif text-virex-deepink text-lg mb-2">Global Focus</h3>
                  <p className="text-sm text-virex-muted">Operating across European and international markets.</p>
                </div>
                <div className="bg-virex-white p-8">
                  <Layers className="w-6 h-6 text-virex-forest mb-4" />
                  <h3 className="font-serif text-virex-deepink text-lg mb-2">Patient Capital</h3>
                  <p className="text-sm text-virex-muted">No external mandates requiring premature liquidity.</p>
                </div>
                <div className="bg-virex-white p-8 flex items-center justify-center bg-virex-stone/5">
                  <span className="font-serif text-4xl text-virex-stone/60">VHG</span>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Companies */}
      <section className="py-32">
        <div className="container max-w-6xl">
          <FadeIn className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <h2 className="text-4xl md:text-5xl text-virex-deepink tracking-tight font-normal mb-4">
                Operating Portfolio
              </h2>
              <p className="text-lg text-virex-muted max-w-xl">
                The group holds three distinct operating businesses focused on foundational economic infrastructure.
              </p>
            </div>
            <Link
              href="/companies"
              className="shrink-0 inline-flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-virex-deepink hover:text-virex-forest transition-colors"
            >
              VIEW ALL COMPANIES <ArrowRight className="w-4 h-4" />
            </Link>
          </FadeIn>

          <div className="flex flex-col border-t border-virex-deepink">
            {GROUP_COMPANIES.map((company, i) => (
              <FadeIn key={company.id} delay={i * 0.1}>
                <a
                  href={company.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col lg:flex-row py-12 lg:py-14 hover:bg-virex-white transition-colors duration-500 -mx-6 px-6 lg:-mx-8 lg:px-8"
                >
                  {/* Left Col */}
                  <div className="w-full lg:w-4/12 flex flex-col mb-8 lg:mb-0 pr-8">
                    <span className="text-[10px] font-bold tracking-widest text-virex-muted mb-6">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="text-3xl lg:text-4xl text-virex-deepink tracking-tight font-normal">
                      {company.name}
                    </h3>
                  </div>

                  {/* Middle Col */}
                  <div className="w-full lg:w-5/12 flex flex-col mb-8 lg:mb-0 pr-8">
                    <span className="text-[10px] font-bold tracking-widest text-virex-forest uppercase mb-6">
                      {company.descriptor}
                    </span>
                    <p className="text-virex-muted text-base leading-relaxed max-w-md">
                      {company.description}
                    </p>
                  </div>

                  {/* Right Col */}
                  <div className="w-full lg:w-3/12 flex flex-col justify-between items-start lg:items-end">
                    <div className="bg-virex-stone/30 px-3 py-1.5 rounded-sm mb-6 lg:mb-0">
                      <span className="text-[11px] text-virex-deepink">
                        {company.ownership}% Stake
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-virex-deepink group-hover:text-virex-forest transition-colors mt-auto">
                      VIEW ENTITY <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </a>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <LineReveal className="max-w-6xl mx-auto px-6" />

      {/* Governance Banner */}
      <section className="py-24">
        <div className="container max-w-6xl">
          <FadeIn>
            <div className="bg-virex-deepink text-virex-white p-12 md:p-20 relative overflow-hidden">
              <div className="relative z-10 max-w-2xl">
                <h3 className="text-3xl md:text-4xl font-serif mb-6">Rigid Governance</h3>
                <p className="text-virex-white/70 leading-relaxed mb-10 text-lg">
                  The holding company establishes the governance framework for the entire group. It maintains strict oversight, ensuring that each operating business acts in accordance with our long-term principles, risk parameters, and legal responsibilities.
                </p>
                <Link
                  href="/governance"
                  className="inline-flex items-center gap-2 text-sm font-semibold tracking-widest uppercase text-virex-white hover:text-virex-stone transition-colors"
                >
                  Read our governance mandate <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Closing */}
      <section className="py-32 text-center bg-virex-stone/5 border-t border-virex-stone/30">
        <div className="container max-w-3xl">
          <FadeIn>
            <h2 className="text-4xl md:text-5xl font-serif text-virex-deepink mb-12">
              Built for the long term.
            </h2>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center bg-virex-forest text-virex-white px-10 py-5 text-sm font-semibold tracking-widest uppercase hover:bg-virex-deepink transition-colors"
            >
              Contact the group
            </Link>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
