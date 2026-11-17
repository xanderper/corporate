import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Lock } from "lucide-react";
import { FadeIn, LineReveal } from "@virex/ui";
import { PORTFOLIO, getRelatedInvestments } from "@virex/content";

export async function generateStaticParams() {
  return PORTFOLIO.map((company) => ({
    company: company.id,
  }));
}

export async function generateMetadata(props: { params: Promise<{ company: string }> }) {
  const params = await props.params;
  const company = PORTFOLIO.find((c) => c.id === params.company);

  if (!company) {
    return { title: "Portfolio — Virex Capital" };
  }

  const description = `${company.name} — a ${company.ownership}% ${company.type.toLowerCase()} in the ${company.sector.toLowerCase()} sector, part of the Virex Capital portfolio.`;

  return {
    title: `${company.name} — Virex Capital`,
    description,
    openGraph: {
      title: `${company.name} — Virex Capital`,
      description,
      url: `https://virexcapital.com/portfolio/${company.id}`,
    },
  };
}

export default async function CompanyPage(props: { params: Promise<{ company: string }> }) {
  const params = await props.params;
  const company = PORTFOLIO.find((c) => c.id === params.company);

  if (!company) {
    notFound();
  }

  const related = getRelatedInvestments(company.id);

  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* Header */}
      <section className="pt-40 pb-20 border-b border-virex-stone/30 bg-virex-stone/5">
        <div className="container max-w-6xl">
          <FadeIn>
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-3 text-xs font-bold tracking-widest text-virex-muted uppercase mb-16 hover:text-virex-deepink transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
              Back to Portfolio
            </Link>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-virex-deepink leading-[1.05] mb-12 tracking-tight">
              {company.name}
            </h1>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10 border-y-2 border-virex-stone/30 mt-8 bg-virex-white px-8">
              <div>
                <p className="text-xs font-bold tracking-widest text-virex-muted uppercase mb-3">
                  Sector
                </p>
                <p className="text-virex-deepink font-medium text-lg">{company.sector}</p>
              </div>
              <div>
                <p className="text-xs font-bold tracking-widest text-virex-muted uppercase mb-3">
                  Investment
                </p>
                <p className="text-virex-deepink font-medium text-lg">{company.type}</p>
              </div>
              <div>
                <p className="text-xs font-bold tracking-widest text-virex-muted uppercase mb-3">
                  Ownership
                </p>
                <p className="text-virex-deepink font-medium text-lg">{company.ownership}% Stake</p>
              </div>
              <div>
                <p className="text-xs font-bold tracking-widest text-virex-muted uppercase mb-3">
                  Geography
                </p>
                <p className="text-virex-deepink font-medium text-lg">{company.geography.join(", ")}</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Content */}
      <section className="py-24">
        <div className="container max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
            <div className="lg:col-span-8">
              <FadeIn>
                <h2 className="text-3xl font-serif text-virex-deepink mb-8">
                  Overview
                </h2>
                <div className="w-12 h-px bg-virex-forest mb-8"></div>
                <div className="prose prose-lg prose-p:text-virex-muted max-w-none mb-16 leading-relaxed">
                  <p>
                    {company.description || `${company.name} is a leading entity operating in the ${company.sector.toLowerCase()} sector across ${company.geography.join(" and ")}.`}
                  </p>
                </div>
              </FadeIn>

              <LineReveal className="mb-16" />

              <FadeIn>
                <h2 className="text-3xl font-serif text-virex-deepink mb-8">
                  Virex Position
                </h2>
                <div className="w-12 h-px bg-virex-forest mb-8"></div>
                <div className="prose prose-lg prose-p:text-virex-muted max-w-none leading-relaxed">
                  <p>
                    Virex Capital holds a strategic {company.ownership}% position in {company.name}.
                    {company.type === "Direct Ownership" && " We operate the business as a wholly owned proprietary platform, providing structural long-term direction and capital for organic growth without exit constraints."}
                    {company.type === "Majority Investment" && " We partner with deeply aligned co-investors and management to drive the strategic and operational direction of the business over a multi-decade horizon."}
                    {company.type === "Minority Investment" && " We hold a strategic minority position, providing patient, stabilizing capital alongside lead sponsors and management."}
                    {company.type === "Venture" && " We provide early-stage proprietary capital and operational support to help scale the underlying technology to institutional grade."}
                  </p>
                </div>
              </FadeIn>

              {company.isDemo && (
                <FadeIn delay={0.2} className="mt-20">
                  <div className="border border-virex-stone/50 bg-virex-stone/5 px-6 py-4 flex items-center gap-4 text-sm text-virex-muted">
                    <Lock className="w-4 h-4 text-virex-deepink shrink-0" />
                    <span>
                      <strong className="text-virex-deepink font-medium">Confidentiality Notice — </strong>
                      This profile is indicative demonstration data. The actual Virex Capital portfolio is held privately.
                    </span>
                  </div>
                </FadeIn>
              )}
            </div>

            <div className="lg:col-span-4 space-y-16">
              {related.length > 0 && (
                <div>
                  <FadeIn>
                    <h3 className="text-xs font-bold tracking-widest text-virex-deepink uppercase mb-8">
                      Related Assets
                    </h3>
                  </FadeIn>
                  <div className="space-y-4">
                    {related.map((r, i) => (
                      <FadeIn key={r.id} delay={i * 0.1}>
                        <Link
                          href={`/portfolio/${r.id}`}
                          className="group block border border-virex-stone/30 bg-virex-white p-6 hover:border-virex-forest transition-colors"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-serif text-xl text-virex-deepink group-hover:text-virex-forest transition-colors">
                              {r.name}
                            </h4>
                            <ArrowRight className="w-4 h-4 text-virex-stone group-hover:text-virex-forest group-hover:translate-x-1 transition-all" />
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] font-semibold tracking-widest text-virex-muted uppercase">
                              {r.sector}
                            </p>
                            <p className="text-[10px] font-semibold tracking-widest text-virex-deepink uppercase bg-virex-stone/10 px-2 py-1">
                              {r.ownership}% Stake
                            </p>
                          </div>
                        </Link>
                      </FadeIn>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
