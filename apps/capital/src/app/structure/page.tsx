import { FadeIn, LineReveal } from "@virex/ui";
import { ArrowRight, CornerDownRight } from "lucide-react";
import { buildMetadata } from "../../lib/metadata";

export const metadata = buildMetadata({
  title: "Structure — Virex Capital",
  description: "The corporate ownership structure of Virex Capital B.V. within Virex Holding Group B.V.",
  path: "/structure",
});

export default function Structure() {
  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* Hero */}
      <section className="pt-40 pb-20 border-b border-virex-stone/30">
        <div className="container max-w-6xl">
          <FadeIn>
            <span className="text-[10px] font-bold tracking-widest text-virex-muted uppercase mb-8 block">
              Corporate Structure
            </span>
            <div className="max-w-4xl">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-normal text-virex-deepink leading-[1.05] mb-8 tracking-tight">
                A framework for <br />
                <span className="text-virex-forest font-serif italic tracking-normal">dedicated capital.</span>
              </h1>
              <p className="text-xl text-virex-muted leading-relaxed">
                Virex Capital operates as a fully dedicated, proprietary investment vehicle within the Virex Holding Group, structurally engineered for permanent capital deployment.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Structural Hierarchy */}
      <section className="py-32">
        <div className="container max-w-6xl">
          <FadeIn>
            <div className="border-t border-virex-deepink pt-16">

              {/* Level 1: Holding Group */}
              <div className="flex flex-col md:flex-row items-start pb-16 border-b border-virex-stone/20 relative group hover:bg-virex-stone/5 transition-colors duration-500 -mx-8 px-8">
                <div className="md:w-1/3 shrink-0 mb-6 md:mb-0">
                  <span className="text-[10px] font-bold tracking-widest text-virex-muted uppercase block mb-4">Ultimate Parent Company</span>
                  <h2 className="text-3xl lg:text-4xl font-normal tracking-tight text-virex-deepink">Virex Holding Group B.V.</h2>
                </div>
                <div className="md:w-2/3 md:pl-12">
                  <p className="text-xl text-virex-deepink font-normal leading-relaxed mb-6 max-w-2xl">
                    The centralized governance and permanent ownership entity that provides structural stability and long-term capital backing.
                  </p>
                </div>
              </div>

              {/* Level 2: Capital */}
              <div className="flex flex-col md:flex-row items-start py-16 border-b border-virex-stone/20 relative md:ml-12 group hover:bg-virex-stone/5 transition-colors duration-500 -mx-8 px-8">
                <div className="hidden md:block absolute -left-12 top-0 bottom-0 w-[1px] bg-virex-forest/20"></div>
                <div className="hidden md:flex absolute -left-12 top-0 -translate-y-1/2 items-center gap-2 bg-virex-warmwhite pr-3">
                  <div className="w-8 h-[1px] bg-virex-forest/40"></div>
                  <span className="text-[9px] font-bold tracking-widest text-virex-forest uppercase whitespace-nowrap">
                    100% Ownership
                  </span>
                </div>

                <div className="md:w-1/3 shrink-0 mb-6 md:mb-0">
                  <span className="text-[10px] font-bold tracking-widest text-virex-forest uppercase block mb-4">Proprietary Investment Arm</span>
                  <h2 className="text-3xl lg:text-4xl font-normal tracking-tight text-virex-forest">Virex Capital B.V.</h2>
                </div>
                <div className="md:w-2/3 md:pl-12">
                  <p className="text-xl text-virex-deepink font-normal leading-relaxed mb-6 max-w-2xl">
                    The principal investment arm of the group, mandated to compound capital over a permanent time horizon.
                  </p>
                  <p className="text-base text-virex-muted leading-relaxed max-w-2xl">
                    Operating independently from a centralized balance sheet, Virex Capital is free from external LP mandates, fund life constraints, or forced liquidity events, allowing for true long-term value creation.
                  </p>
                </div>
              </div>

              {/* Level 3: Portfolio Strategy */}
              <div className="flex flex-col md:flex-row items-start pt-16 relative md:ml-24 group transition-colors duration-500 -mx-8 px-8 pb-16">
                <div className="hidden md:block absolute -left-12 top-0 bottom-full w-[1px] bg-virex-stone/20"></div>
                <div className="hidden md:block absolute -left-12 top-24 w-8 h-[1px] bg-virex-stone/20"></div>

                <div className="md:w-1/3 shrink-0 mb-8 md:mb-0">
                  <span className="text-[10px] font-bold tracking-widest text-virex-muted uppercase block mb-4">Deployment Strata</span>
                  <h2 className="text-2xl lg:text-3xl font-normal tracking-tight text-virex-deepink">Capital Allocation</h2>
                </div>

                <div className="md:w-2/3 md:pl-12 grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold tracking-widest text-virex-muted mb-4">01</span>
                    <h3 className="font-normal tracking-tight text-lg text-virex-deepink mb-3">Investments</h3>
                    <p className="text-sm text-virex-muted leading-relaxed">
                      Selective ownership positions in exceptional businesses with durable competitive advantages.
                    </p>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold tracking-widest text-virex-muted mb-4">02</span>
                    <h3 className="font-normal tracking-tight text-lg text-virex-deepink mb-3">Real Assets</h3>
                    <p className="text-sm text-virex-muted leading-relaxed">
                      Long-term ownership of tangible assets with enduring economic value.
                    </p>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold tracking-widest text-virex-muted mb-4">03</span>
                    <h3 className="font-normal tracking-tight text-lg text-virex-deepink mb-3">Strategic Holdings</h3>
                    <p className="text-sm text-virex-muted leading-relaxed">
                      Concentrated positions that support long-term strategic interests across the group.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </FadeIn>
        </div>
      </section>

      <LineReveal className="max-w-6xl mx-auto px-6" />

      {/* Group Relationship */}
      <section className="py-32">
        <div className="container max-w-6xl">
          <FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24 items-start">
              <div>
                <h2 className="text-4xl font-normal tracking-tight text-virex-deepink mb-8">Group Relationship</h2>
                <div className="w-12 h-[1px] bg-virex-forest mb-8"></div>
                <div className="prose prose-lg prose-p:text-virex-muted max-w-none">
                  <p>
                    Virex Capital B.V. is a wholly owned investment subsidiary of Virex Holding Group B.V. While capital allocation and portfolio management are conducted independently, Virex Capital shares the group&apos;s long-term ownership philosophy.
                  </p>
                </div>
              </div>

              <div className="bg-virex-stone/5 p-10 md:p-14">
                <p className="text-[10px] font-bold tracking-widest text-virex-muted uppercase mb-10 flex items-center gap-3">
                  <CornerDownRight className="w-4 h-4" />
                  Related Entities
                </p>
                <div className="flex flex-col border-t border-virex-stone/30">
                  <a href="https://virex.group" target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between py-8 border-b border-virex-stone/20 hover:bg-virex-white transition-colors -mx-4 px-4">
                    <span className="font-normal tracking-tight text-2xl text-virex-deepink group-hover:text-virex-forest transition-colors">Virex Holding Group B.V.</span>
                    <ArrowRight className="w-5 h-5 text-virex-stone group-hover:text-virex-forest group-hover:translate-x-1 transition-all duration-300" />
                  </a>
                  <a href="https://qorve.com" target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between py-8 border-b border-virex-stone/20 hover:bg-virex-white transition-colors -mx-4 px-4">
                    <span className="font-normal tracking-tight text-2xl text-virex-deepink group-hover:text-virex-forest transition-colors">Qorve Holding B.V.</span>
                    <ArrowRight className="w-5 h-5 text-virex-stone group-hover:text-virex-forest group-hover:translate-x-1 transition-all duration-300" />
                  </a>
                  <a href="https://northgrid.eu" target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between py-8 border-b border-virex-stone/20 hover:bg-virex-white transition-colors -mx-4 px-4">
                    <span className="font-normal tracking-tight text-2xl text-virex-deepink group-hover:text-virex-forest transition-colors">Northgrid Holding B.V.</span>
                    <ArrowRight className="w-5 h-5 text-virex-stone group-hover:text-virex-forest group-hover:translate-x-1 transition-all duration-300" />
                  </a>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
