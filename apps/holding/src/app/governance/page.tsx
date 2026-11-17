import { FadeIn } from "@virex/ui";
import { Scale, CheckCircle2, ShieldAlert, Users } from "lucide-react";

export const metadata = {
  title: "Governance ",
  description: "Governance principles and responsibilities of Virex Holding Group B.V.",
};

export default function Governance() {
  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* Hero */}
      <section className="pt-40 pb-20 border-b border-virex-stone/30">
        <div className="container max-w-6xl">
          <FadeIn>
            <span className="text-sm font-semibold tracking-widest text-virex-muted uppercase mb-8 block">
              Governance
            </span>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
              <div className="lg:col-span-8">
                <h1 className="text-5xl md:text-6xl font-serif text-virex-deepink leading-[1.1] mb-8">
                  Oversight and <br />
                  <span className="text-virex-forest italic">strategic direction.</span>
                </h1>
                <p className="text-xl text-virex-muted leading-relaxed max-w-2xl">
                  Virex Holding Group establishes the governance framework for the entire group, maintaining rigid oversight and ensuring that each operating business acts in strict accordance with our long-term principles.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Holding Responsibilities */}
      <section className="py-24 bg-virex-stone/5">
        <div className="container max-w-6xl">
          <FadeIn>
            <div className="mb-16">
              <h2 className="text-3xl font-serif text-virex-deepink mb-4">Mandate & Responsibilities</h2>
              <p className="text-virex-muted max-w-2xl">
                The holding company is deliberately lean. We do not interfere in the day-to-day operations of our subsidiaries. Instead, we exercise control through four core mandates.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-virex-white p-8 md:p-10 border border-virex-stone/50 hover:border-virex-forest/30 transition-colors">
                <Scale className="w-6 h-6 text-virex-forest mb-6" />
                <h3 className="text-lg font-serif text-virex-deepink mb-3">Capital Allocation</h3>
                <p className="text-sm text-virex-muted leading-relaxed">
                  The primary function of the holding company is the optimal allocation of capital. We fund new initiatives, manage the group&apos;s consolidated treasury, dictate dividend policies, and ensure an optimal capital structure for all operating subsidiaries to fund their growth aggressively yet safely.
                </p>
              </div>

              <div className="bg-virex-white p-8 md:p-10 border border-virex-stone/50 hover:border-virex-forest/30 transition-colors">
                <CheckCircle2 className="w-6 h-6 text-virex-forest mb-6" />
                <h3 className="text-lg font-serif text-virex-deepink mb-3">Strategic Oversight</h3>
                <p className="text-sm text-virex-muted leading-relaxed">
                  We set the uncompromising long-term strategic direction for the group. We monitor the performance, strategic drift, and alignment of each individual business against these multi-decade objectives, stepping in only when a subsidiary deviates from the group&apos;s overarching philosophy.
                </p>
              </div>

              <div className="bg-virex-white p-8 md:p-10 border border-virex-stone/50 hover:border-virex-forest/30 transition-colors">
                <ShieldAlert className="w-6 h-6 text-virex-forest mb-6" />
                <h3 className="text-lg font-serif text-virex-deepink mb-3">Risk & Compliance</h3>
                <p className="text-sm text-virex-muted leading-relaxed">
                  The group maintains centralized, institutional-grade risk management frameworks. We enforce strict adherence to regulatory requirements, cybersecurity standards, and legal compliance across all jurisdictions and verticals in which we operate.
                </p>
              </div>

              <div className="bg-virex-white p-8 md:p-10 border border-virex-stone/50 hover:border-virex-forest/30 transition-colors">
                <Users className="w-6 h-6 text-virex-forest mb-6" />
                <h3 className="text-lg font-serif text-virex-deepink mb-3">Leadership Succession</h3>
                <p className="text-sm text-virex-muted leading-relaxed">
                  We hold the ultimate authority over executive leadership appointments. The holding company is responsible for the selection, compensation structure, and long-term succession planning for the managing directors of all operating companies.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Board & Legal */}
      <section className="py-24">
        <div className="container max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <FadeIn>
              <h2 className="text-3xl font-serif text-virex-deepink mb-8">Board of Directors</h2>
              <div className="prose prose-virex prose-p:text-virex-muted prose-p:leading-relaxed">
                <p>
                  The Management Board of Virex Holding Group B.V. is responsible for the overall governance, strategy, and execution of the holding company&apos;s mandates.
                </p>
                <div className="mt-8 border border-virex-stone/50 bg-virex-warmwhite p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-virex-stone/30 rounded-full flex items-center justify-center text-virex-muted font-serif">
                      XP
                    </div>
                    <div>
                      <p className="font-semibold text-virex-deepink text-sm">Xander Perlee</p>
                      <p className="text-xs text-virex-forest tracking-widest uppercase mt-1">Managing Director</p>
                    </div>
                  </div>
                  <p className="text-sm text-virex-muted">
                    Responsible for overarching group strategy, capital allocation, and executive oversight across the portfolio.
                  </p>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <h2 className="text-3xl font-serif text-virex-deepink mb-8">Legal Structure</h2>
              <div className="prose prose-virex prose-p:text-virex-muted prose-p:leading-relaxed">
                <p>
                  Virex Holding Group B.V. is a private limited liability company (Besloten Vennootschap) incorporated under the laws of the Netherlands.
                </p>
                <p>
                  To ensure localized accountability and ring-fence risk, all group companies are structured as separate, wholly distinct legal entities. Each operating company possesses its own dedicated management team, operational bank accounts, and localized governance policies tailored to its specific industry requirements.
                </p>
                <p>
                  The holding company does not cross-collateralize assets between its subsidiaries, ensuring that systemic risk in one sector cannot compromise the integrity of the broader group.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </div>
  );
}
