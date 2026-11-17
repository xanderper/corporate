import { FadeIn, LineReveal } from "@virex/ui";
import Link from "next/link";
import { ArrowRight, Briefcase, Network, Globe, Lock } from "lucide-react";

export const metadata = {
  title: "The Group ",
  description: "The operating model of Virex Holding Group B.V.",
};

export default function Group() {
  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* Hero */}
      <section className="pt-40 pb-20 border-b border-virex-stone/30">
        <div className="container max-w-6xl">
          <FadeIn>
            <span className="text-sm font-semibold tracking-widest text-virex-muted uppercase mb-8 block">
              The Group
            </span>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
              <div className="lg:col-span-8">
                <h1 className="text-5xl md:text-6xl font-serif text-virex-deepink leading-[1.1] mb-8">
                  A permanent home for <br />
                  <span className="text-virex-forest italic">foundational businesses.</span>
                </h1>
                <p className="text-xl text-virex-muted leading-relaxed max-w-2xl">
                  Virex Holding Group exists to provide a permanent home for companies operating in foundational sectors. We build, acquire, and hold businesses with a multi-decade perspective.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* The Operating Model */}
      <section className="py-24">
        <div className="container max-w-6xl">
          <FadeIn>
            <div className="mb-16 text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-serif text-virex-deepink mb-4">The Operating Model</h2>
              <p className="text-virex-muted">
                Our companies operate in highly complex sectors ranging from financial technology to digital infrastructure. To ensure their success, we employ a decentralized operating model characterized by strict autonomy at the subsidiary level.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-virex-stone/50 border border-virex-stone/50">
            <FadeIn delay={0.1} className="bg-virex-warmwhite p-10 md:p-16">
              <Briefcase className="w-8 h-8 text-virex-forest mb-6" />
              <h3 className="text-xl font-serif text-virex-deepink mb-4">Decentralized Autonomy</h3>
              <p className="text-sm text-virex-muted leading-relaxed">
                Each company within the group is an entirely independent entity. They maintain their own management teams, cultivate their own corporate cultures, and execute their own specialized operational models. We do not believe in bureaucratic micro-management from the holding level.
              </p>
            </FadeIn>

            <FadeIn delay={0.2} className="bg-virex-warmwhite p-10 md:p-16">
              <Network className="w-8 h-8 text-virex-forest mb-6" />
              <h3 className="text-xl font-serif text-virex-deepink mb-4">Centralized Strategy</h3>
              <p className="text-sm text-virex-muted leading-relaxed">
                While execution is completely decentralized, strategic alignment is strictly centralized. The holding company sets the multi-decade objectives, allocates capital, and ensures that every subsidiary remains aligned with the group&apos;s overarching philosophy and risk parameters.
              </p>
            </FadeIn>

            <FadeIn delay={0.3} className="bg-virex-warmwhite p-10 md:p-16">
              <Globe className="w-8 h-8 text-virex-forest mb-6" />
              <h3 className="text-xl font-serif text-virex-deepink mb-4">Strategic Synergies</h3>
              <p className="text-sm text-virex-muted leading-relaxed">
                Our strict focus on capital, financial infrastructure, and digital infrastructure creates natural, powerful adjacencies. While companies do not depend on one another for survival, they frequently collaborate to unlock complex opportunities that neither could capture alone.
              </p>
            </FadeIn>

            <FadeIn delay={0.4} className="bg-virex-warmwhite p-10 md:p-16">
              <Lock className="w-8 h-8 text-virex-forest mb-6" />
              <h3 className="text-xl font-serif text-virex-deepink mb-4">Shared Resources</h3>
              <p className="text-sm text-virex-muted leading-relaxed">
                Operating companies benefit from the group&apos;s robust balance sheet, extensive institutional network, and specialized expertise in governance, risk mitigation, and corporate finance—resources typically unavailable to standalone companies of their size.
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      <LineReveal className="max-w-6xl mx-auto px-6" />

      {/* Call to action */}
      <section className="py-24">
        <div className="container max-w-4xl text-center">
          <FadeIn>
            <h2 className="text-3xl font-serif text-virex-deepink mb-6">Explore the Portfolio</h2>
            <p className="text-virex-muted mb-10 max-w-2xl mx-auto">
              View the businesses currently operating under Virex Holding Group, categorized by their respective focus across capital and infrastructure.
            </p>
            <Link
              href="/companies"
              className="inline-flex items-center gap-2 bg-virex-deepink text-virex-white px-8 py-4 text-sm font-semibold tracking-widest uppercase hover:bg-virex-forest transition-colors"
            >
              View companies <ArrowRight className="w-4 h-4" />
            </Link>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
