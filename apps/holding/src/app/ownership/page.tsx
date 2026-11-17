import { FadeIn } from "@virex/ui";
import Link from "next/link";
import { ArrowRight, Shield, Anchor, Users, Network } from "lucide-react";

export const metadata = {
  title: "Ownership Structure ",
  description: "The ownership architecture and governance model of Virex Holding Group B.V.",
};

export default function Ownership() {
  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* Hero Section */}
      <section className="pt-40 pb-20 border-b border-virex-stone/30">
        <div className="container max-w-6xl">
          <FadeIn>
            <span className="text-sm font-semibold tracking-widest text-virex-muted uppercase mb-8 block">
              Corporate Structure
            </span>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
              <div className="lg:col-span-7">
                <h1 className="text-5xl md:text-6xl font-serif text-virex-deepink leading-[1.1] mb-8">
                  Architected for <br />
                  <span className="text-virex-forest italic">permanence.</span>
                </h1>
                <p className="text-xl text-virex-muted leading-relaxed mb-8">
                  Our ownership model is deliberately designed to shield our operating companies from short-term market pressures, enabling them to make decisions based on multi-decade horizons.
                </p>
                <div className="w-20 h-[1px] bg-virex-stone mb-8"></div>
                <p className="text-sm text-virex-muted leading-relaxed max-w-md">
                  Virex Holding Group utilizes a robust Dutch corporate framework to separate economic participation from voting control, guaranteeing operational continuity and strategic independence.
                </p>
              </div>
              <div className="lg:col-span-5 flex flex-col justify-end">
                <div className="bg-virex-stone/10 p-8 border border-virex-stone/30 rounded-sm">
                  <h3 className="font-serif text-xl text-virex-deepink mb-4">Core Principles</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-virex-forest shrink-0 mt-0.5" />
                      <div>
                        <span className="block font-semibold text-virex-deepink text-sm">Structural Defense</span>
                        <span className="text-sm text-virex-muted">Immunity to hostile acquisitions and short-term activist pressure.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Anchor className="w-5 h-5 text-virex-forest shrink-0 mt-0.5" />
                      <div>
                        <span className="block font-semibold text-virex-deepink text-sm">Strategic Stability</span>
                        <span className="text-sm text-virex-muted">Capital allocation based on generational compounding.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-virex-forest shrink-0 mt-0.5" />
                      <div>
                        <span className="block font-semibold text-virex-deepink text-sm">Aligned Partnerships</span>
                        <span className="text-sm text-virex-muted">A co-ownership model that incentivizes operating teams.</span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* The STAK Structure */}
      <section className="py-24 bg-virex-warmwhite">
        <div className="container max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <FadeIn>
              <h2 className="text-3xl md:text-4xl font-serif text-virex-deepink mb-6">
                The Trust Office Foundation (STAK)
              </h2>
              <div className="prose prose-virex prose-p:text-virex-muted prose-p:leading-relaxed">
                <p>
                  At the apex of our corporate structure sits the <strong>Stichting Administratiekantoor (STAK) Virex</strong>. This Dutch legal entity is a fundamental tool for ensuring the long-term independence of the group.
                </p>
                <p>
                  The STAK holds 100% of the voting shares in Virex Holding Group B.V. In exchange, it issues non-voting depositary receipts (certificaten) to the beneficial owners.
                </p>
                <p>
                  This mechanism irrevocably separates economic rights (the right to dividends and capital appreciation) from voting rights (the control over corporate strategy and board appointments). The board of the STAK is legally bound to exercise its voting power in the long-term interest of the company, its employees, and its subsidiaries, rather than seeking immediate shareholder returns.
                </p>
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="border border-virex-stone bg-virex-white p-8 md:p-12 relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-virex-stone/10 border-l border-b border-virex-stone/30" />
                <h3 className="text-sm font-semibold tracking-widest text-virex-muted uppercase mb-8">
                  Mechanism of Separation
                </h3>

                <div className="flex flex-col gap-6 relative z-10">
                  <div className="flex items-center gap-4 p-4 border border-virex-stone/50 bg-virex-warmwhite/50">
                    <div className="w-12 h-12 flex items-center justify-center bg-virex-forest/10 rounded-full shrink-0">
                      <span className="text-virex-forest font-serif font-bold">1</span>
                    </div>
                    <div>
                      <p className="font-semibold text-virex-deepink text-sm">Beneficial Owners</p>
                      <p className="text-xs text-virex-muted">Hold Depositary Receipts (Economic Rights)</p>
                    </div>
                  </div>

                  <div className="w-px h-6 bg-virex-forest/30 mx-auto"></div>

                  <div className="flex items-center gap-4 p-4 border-2 border-virex-forest bg-virex-forest text-virex-warmwhite">
                    <div className="w-12 h-12 flex items-center justify-center bg-virex-white/10 rounded-full shrink-0">
                      <span className="text-virex-white font-serif font-bold">2</span>
                    </div>
                    <div>
                      <p className="font-semibold text-virex-white text-sm">STAK Virex</p>
                      <p className="text-xs text-virex-white/80">Holds 100% Voting Shares (Control Rights)</p>
                    </div>
                  </div>

                  <div className="w-px h-6 bg-virex-forest/30 mx-auto"></div>

                  <div className="flex items-center gap-4 p-4 border border-virex-stone/50 bg-virex-warmwhite/50">
                    <div className="w-12 h-12 flex items-center justify-center bg-virex-forest/10 rounded-full shrink-0">
                      <span className="text-virex-forest font-serif font-bold">3</span>
                    </div>
                    <div>
                      <p className="font-semibold text-virex-deepink text-sm">Virex Holding Group</p>
                      <p className="text-xs text-virex-muted">Executes Long-Term Strategy</p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Visual Tree */}
      <section className="py-24 bg-virex-stone/10 border-y border-virex-stone/30">
        <div className="container max-w-5xl">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl font-serif text-virex-deepink mb-4">Corporate Architecture</h2>
              <p className="text-virex-muted max-w-2xl mx-auto mb-6">
                A visual representation of capital flow and voting control across the Virex ecosystem.
              </p>
              <div className="flex justify-center">
                <a
                  href="http://localhost:3204"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-virex-forest text-virex-warmwhite hover:bg-virex-deepink transition-colors rounded-sm shadow-xs"
                >
                  Open Interactive Structure Builder <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="border border-virex-white bg-virex-white/50 p-8 md:p-16 overflow-x-auto">
              <div className="min-w-[700px] flex flex-col items-center">
                {/* Level 1: Shareholders */}
                <div className="flex flex-col items-center w-full relative z-10">
                  <div className="bg-virex-white border border-virex-stone px-8 py-4 text-center">
                    <p className="text-[10px] font-semibold tracking-widest text-virex-muted uppercase mb-1">
                      Beneficial Owners
                    </p>
                    <p className="font-serif text-virex-deepink">Shareholders</p>
                  </div>
                  <div className="w-[1px] h-8 bg-virex-stone"></div>
                </div>

                {/* Level 2: STAK */}
                <div className="flex flex-col items-center w-full relative z-10">
                  <div className="bg-virex-white border border-virex-stone px-8 py-4 text-center">
                    <p className="text-[10px] font-semibold tracking-widest text-virex-muted uppercase mb-1">
                      Trust Office (STAK)
                    </p>
                    <p className="font-serif text-virex-deepink">
                      Stichting Administratiekantoor Virex
                    </p>
                  </div>
                  <div className="w-[1px] h-12 bg-virex-stone"></div>
                </div>

                {/* Level 3: Holding */}
                <div className="flex flex-col items-center w-full relative z-10">
                  <div className="bg-virex-forest text-virex-warmwhite px-12 py-5 text-center">
                    <p className="text-[10px] font-semibold tracking-widest text-virex-sage/80 uppercase mb-2">
                      Ultimate Holding Company
                    </p>
                    <p className="font-serif text-xl">
                      Virex Holding Group B.V.
                    </p>
                  </div>
                  <div className="w-[1px] h-12 bg-virex-forest"></div>
                </div>

                {/* Connectors for companies */}
                <div className="flex w-full px-20">
                  <div className="flex-1 flex flex-col items-center">
                    <div className="w-full h-[1px] bg-virex-forest" />
                    <div className="w-[1px] h-8 bg-virex-forest" />
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <div className="w-[1px] h-0" />
                    <div className="w-[1px] h-8 bg-virex-forest" />
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <div className="w-full h-[1px] bg-virex-forest" />
                    <div className="w-[1px] h-8 bg-virex-forest" />
                  </div>
                </div>

                {/* Level 4: Group Companies */}
                <div className="grid grid-cols-3 gap-6 w-full">
                  <div className="bg-virex-white border-t-4 border-t-virex-forest border border-virex-stone p-6 text-center">
                    <p className="text-[10px] font-semibold tracking-widest text-virex-forest uppercase mb-2">
                      100% Wholly Owned
                    </p>
                    <p className="font-serif text-virex-deepink text-lg">
                      Virex Capital B.V.
                    </p>
                  </div>

                  <div className="bg-virex-white border-t-4 border-t-virex-muted border border-virex-stone p-6 text-center">
                    <p className="text-[10px] font-semibold tracking-widest text-virex-muted uppercase mb-2">
                      51% Majority Owned
                    </p>
                    <p className="font-serif text-virex-deepink text-lg">
                      Qorve Holding B.V.
                    </p>
                  </div>

                  <div className="bg-virex-white border-t-4 border-t-virex-muted border border-virex-stone p-6 text-center relative">
                    <p className="text-[10px] font-semibold tracking-widest text-virex-muted uppercase mb-2">
                      51% Majority Owned
                    </p>
                    <p className="font-serif text-virex-deepink text-lg">
                      Northgrid Holding B.V.
                    </p>

                    {/* Qorve to Northgrid 49% relationship */}
                    <div className="absolute top-[40%] -left-6 w-6 h-[1px] bg-virex-stone/50 border-t border-dashed border-virex-stone/80"></div>
                    <p className="text-[10px] text-virex-muted mt-3 pt-3 border-t border-virex-stone/30">
                      49% co-owned by Qorve
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Subsidiary Models */}
      <section className="py-24 bg-virex-warmwhite">
        <div className="container max-w-6xl">
          <FadeIn>
            <div className="mb-16">
              <h2 className="text-3xl font-serif text-virex-deepink mb-4">Allocation Models</h2>
              <p className="text-virex-muted max-w-2xl">
                The holding group utilizes two distinct ownership methodologies depending on the nature of the subsidiary and the required operational expertise.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 md:p-10 border border-virex-stone bg-virex-white flex flex-col h-full">
                <Network className="w-8 h-8 text-virex-forest mb-6" />
                <h3 className="text-xl font-serif text-virex-deepink mb-4">100% Wholly Owned</h3>
                <p className="text-sm text-virex-muted leading-relaxed mb-8 flex-grow">
                  Entities that serve as internal engines for capital allocation, research, and proprietary investment are wholly owned by the holding group. This ensures absolute alignment of capital deployment with the group&apos;s overarching philosophy.
                </p>
                <div className="pt-6 border-t border-virex-stone/50">
                  <p className="text-xs font-semibold tracking-widest text-virex-deepink uppercase mb-3">Example Entity</p>
                  <Link href="https://virexcapital.com" target="_blank" className="inline-flex items-center gap-2 text-sm text-virex-forest hover:text-virex-deepink transition-colors font-medium">
                    Virex Capital B.V. <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div className="p-8 md:p-10 border border-virex-stone bg-virex-white flex flex-col h-full">
                <Users className="w-8 h-8 text-virex-forest mb-6" />
                <h3 className="text-xl font-serif text-virex-deepink mb-4">51% Majority Partnership</h3>
                <p className="text-sm text-virex-muted leading-relaxed mb-8 flex-grow">
                  For operational infrastructure companies, we typically acquire a 51% controlling stake. The remaining 49% is strategically distributed to specialist co-investors or executive management teams to ensure operational excellence and skin-in-the-game.
                </p>
                <div className="pt-6 border-t border-virex-stone/50">
                  <p className="text-xs font-semibold tracking-widest text-virex-deepink uppercase mb-3">Example Entities</p>
                  <div className="flex gap-6">
                    <Link href="https://qorve.com" target="_blank" className="inline-flex items-center gap-2 text-sm text-virex-forest hover:text-virex-deepink transition-colors font-medium">
                      Qorve <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link href="https://northgrid.eu" target="_blank" className="inline-flex items-center gap-2 text-sm text-virex-forest hover:text-virex-deepink transition-colors font-medium">
                      Northgrid <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
