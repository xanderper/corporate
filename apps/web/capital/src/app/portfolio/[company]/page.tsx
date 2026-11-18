import Link from "next/link";
import { notFound } from "next/navigation";
import { getRelatedInvestments, PORTFOLIO } from "@virex/content";
import { buildMetadata } from "../../../lib/metadata";
import { Accent, ButtonLink, CtaBand, Eyebrow, TextLink } from "../../../components/ui";

export function generateStaticParams() {
  return PORTFOLIO.map((company) => ({ company: company.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ company: string }> }) {
  const { company: slug } = await params;
  const company = PORTFOLIO.find((c) => c.id === slug);
  if (!company) {
    return buildMetadata({ title: "Investment not found", description: "", path: "/portfolio" });
  }
  return buildMetadata({
    title: company.name,
    description: company.description,
    path: `/portfolio/${company.id}`,
  });
}

export default async function CompanyDetailPage({ params }: { params: Promise<{ company: string }> }) {
  const { company: slug } = await params;
  const company = PORTFOLIO.find((c) => c.id === slug);
  if (!company) notFound();

  const related = getRelatedInvestments(company.id);
  const isPublic = company.market === "Public markets";

  return (
    <div className="w-full">
      <section aria-labelledby="company-title" className="pb-20 pt-[clamp(72px,9vw,120px)]">
        <div className="container">
          <TextLink href="/portfolio" arrow={false} muted className="mb-10">
            ← Back to portfolio
          </TextLink>

          <div className="flex flex-wrap items-end justify-between gap-x-20 gap-y-10">
            <div className="min-w-0 flex-[1_1_480px]">
              <Eyebrow className="mb-6">{company.market}</Eyebrow>
              <h1 id="company-title" className="type-display">
                {company.name}
              </h1>
            </div>
            <p className="min-w-0 flex-[0_1_420px] text-[17px] leading-[1.8] text-virex-body">
              {company.description}
            </p>
          </div>
        </div>
      </section>

      <section aria-label="Investment details" className="bg-virex-white py-[clamp(64px,8vw,104px)]">
        <div className="container">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Eyebrow rule={false} className="mb-4">
                Virex Position
              </Eyebrow>
              <h2 className="font-serif text-[clamp(28px,2.8vw,38px)] font-light leading-[1.2] text-virex-deepink">
                {company.virexPosition}
              </h2>
              <div className="mt-10 flex flex-wrap gap-4">
                <ButtonLink href="/contact" arrow>
                  Discuss a partnership
                </ButtonLink>
                <ButtonLink href="/strategy" variant="secondary">
                  Our investment strategy
                </ButtonLink>
              </div>
            </div>

            <dl className="grid grid-cols-1 gap-6 border-t border-virex-deepink pt-8 sm:grid-cols-2 lg:col-span-5 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
              <div className="border-b border-virex-stone pb-5">
                <dt className="text-[11px] uppercase tracking-[0.2em] text-virex-muted">Market</dt>
                <dd className="mt-2 font-serif text-[22px] font-light text-virex-deepink">{company.market}</dd>
              </div>
              <div className="border-b border-virex-stone pb-5">
                <dt className="text-[11px] uppercase tracking-[0.2em] text-virex-muted">Sector</dt>
                <dd className="mt-2 font-serif text-[22px] font-light text-virex-deepink">{company.sector}</dd>
              </div>
              <div className="border-b border-virex-stone pb-5">
                <dt className="text-[11px] uppercase tracking-[0.2em] text-virex-muted">
                  {isPublic ? "Position" : "Investment Type"}
                </dt>
                <dd className="mt-2 font-serif text-[22px] font-light text-virex-deepink">{company.type}</dd>
              </div>
              <div className="border-b border-virex-stone pb-5">
                <dt className="text-[11px] uppercase tracking-[0.2em] text-virex-muted">Geography</dt>
                <dd className="mt-2 font-serif text-[22px] font-light text-virex-deepink">
                  {company.geography.join(", ")}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="py-[clamp(64px,8vw,104px)]">
          <div className="container">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <Eyebrow rule={false} className="mb-4">
                  Related holdings
                </Eyebrow>
                <h2 id="related-title" className="font-serif text-[32px] font-light">
                  More in {company.market}
                </h2>
              </div>
              <TextLink href="/portfolio">View full portfolio</TextLink>
            </div>

            <div className="mt-10 grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/portfolio/${item.id}`}
                  className="group flex flex-col justify-between border border-virex-stone bg-virex-white p-8 transition-colors hover:border-virex-forest"
                >
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-virex-muted">{item.sector}</p>
                    <h3 className="mt-3 font-serif text-[24px] font-light text-virex-deepink group-hover:text-virex-forest">
                      {item.name}
                    </h3>
                    <p className="mt-3 text-[14px] leading-[1.7] text-virex-muted">{item.description}</p>
                  </div>
                  <p className="mt-6 text-xs font-semibold text-virex-forest">{item.type} →</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBand id="cta-title" title={<>Building something <Accent tone="dark">ambitious?</Accent></>} />
    </div>
  );
}
