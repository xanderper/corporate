import Link from "next/link";
import { getByMarket, PORTFOLIO, PORTFOLIO_MARKETS } from "@virex/content";
import { buildMetadata } from "../../lib/metadata";
import { Accent, CtaBand, Eyebrow, TextLink } from "../../components/ui";

export const metadata = buildMetadata({
  title: "Portfolio",
  description:
    "Virex Capital invests across private businesses and listed equities, partnering with ambitious companies built for the long term.",
  path: "/portfolio",
});

export default function PortfolioPage() {
  return (
    <div className="w-full">
      <section aria-labelledby="pf-title" className="pb-24 pt-[clamp(72px,9vw,128px)]">
        <div className="container flex flex-wrap items-end gap-x-24 gap-y-12">
          <div className="min-w-0 flex-[1_1_480px]">
            <Eyebrow className="mb-9">Our portfolio</Eyebrow>
            <h1 id="pf-title" className="type-display">
              Backing ambition.
              <br />
              <Accent>Enabling progress.</Accent>
            </h1>
          </div>
          <p className="min-w-0 flex-[0_1_380px] text-[17px] leading-[1.8] text-virex-body">
            We deploy patient capital across private businesses and publicly listed global leaders — guided by
            fundamental conviction and a long-term horizon.
          </p>
        </div>
      </section>

      <section aria-label="Portfolio summary" className="pb-16">
        <div className="container">
          <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-4 border-b border-t border-b-virex-stone border-t-virex-deepink py-5 text-[13px] text-virex-muted">
            <p>
              Showing {PORTFOLIO.length} investments across {PORTFOLIO_MARKETS.length} markets
            </p>
            <div className="flex flex-wrap gap-x-8 gap-y-2">
              {PORTFOLIO_MARKETS.map(({ market }) => {
                const count = getByMarket(market).length;
                const slug = market.toLowerCase().replace(/\s+/g, "-");
                return (
                  <a
                    key={market}
                    href={`#${slug}`}
                    className="font-semibold text-virex-deepink transition-colors hover:text-virex-forest"
                  >
                    {market} ({count})
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {PORTFOLIO_MARKETS.map((group, groupIndex) => {
        const companies = getByMarket(group.market);
        const slug = group.market.toLowerCase().replace(/\s+/g, "-");
        const isPublic = group.market === "Public markets";

        return (
          <section
            key={group.market}
            id={slug}
            aria-labelledby={`${slug}-title`}
            className={
              groupIndex % 2 === 1
                ? "bg-virex-white py-[clamp(72px,8vw,112px)]"
                : "pb-[clamp(72px,8vw,112px)] pt-8"
            }
          >
            <div className="container">
              <div className="flex flex-wrap items-end justify-between gap-x-16 gap-y-6 border-b border-virex-stone pb-10">
                <div className="min-w-0 flex-[1_1_420px]">
                  <Eyebrow rule={false} className="mb-4">
                    {group.subtitle}
                  </Eyebrow>
                  <h2 id={`${slug}-title`} className="font-serif text-[clamp(32px,3.2vw,48px)] font-light leading-[1.1]">
                    {group.market}
                  </h2>
                </div>
                <p className="min-w-0 flex-[0_1_420px] text-[15px] leading-[1.75] text-virex-muted">
                  {group.description}
                </p>
              </div>

              <div className="mt-12 grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6">
                {companies.map((company) => (
                  <Link
                    key={company.id}
                    href={`/portfolio/${company.id}`}
                    className={`group flex flex-col justify-between border border-virex-stone p-9 transition-colors duration-300 hover:border-virex-forest ${
                      groupIndex % 2 === 1 ? "bg-virex-warmwhite" : "bg-virex-white"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-4 border-b border-virex-stone pb-5">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-virex-muted">
                          {company.sector}
                        </span>
                        <span className="border border-virex-stone px-2.5 py-1 text-[11px] font-medium tracking-[0.06em] text-virex-forest">
                          {company.type}
                        </span>
                      </div>
                      <h3 className="mt-6 font-serif text-[26px] font-light leading-[1.2] text-virex-deepink transition-colors group-hover:text-virex-forest">
                        {company.name}
                      </h3>
                      <p className="mt-4 text-[15px] leading-[1.7] text-virex-muted">{company.description}</p>
                    </div>

                    <div className="mt-8 flex items-center justify-between border-t border-virex-stone/70 pt-5 text-xs">
                      <span className="uppercase tracking-[0.16em] text-virex-muted">
                        {isPublic ? "Position" : "Investment"}: {company.type}
                      </span>
                      <span className="font-semibold text-virex-forest transition-transform duration-300 group-hover:translate-x-1">
                        View →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      <section className="border-t border-virex-stone py-16">
        <div className="container flex flex-wrap items-center justify-between gap-6">
          <p className="max-w-[560px] text-[15px] leading-[1.75] text-virex-muted">
            Interested in how we evaluate private partnerships and listed equity positions?
          </p>
          <TextLink href="/strategy">Read our investment strategy</TextLink>
        </div>
      </section>

      <CtaBand id="cta-title" title={<>Building something <Accent tone="dark">ambitious?</Accent></>} />
    </div>
  );
}
