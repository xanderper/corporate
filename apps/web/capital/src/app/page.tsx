import { getByMarket } from "@virex/content";
import { FadeIn } from "@virex/ui";
import { buildMetadata } from "../lib/metadata";
import { Accent, Artwork, ButtonLink, CtaBand, Eyebrow, TextLink } from "../components/ui";
import { ArticleCard } from "../components/ArticleCard";
import { AREAS_OF_INTEREST } from "../lib/strategy";
import { ARTICLES, IMAGES } from "../lib/insights";

export const metadata = buildMetadata({
  title: "Virex Capital",
  description:
    "Virex Capital partners with ambitious businesses and exceptional entrepreneurs to build enduring value through strategic investment and long-term collaboration.",
  path: "/",
});

const PRINCIPLES = [
  {
    title: "Strategic Perspective",
    body: "We identify opportunities where thoughtful capital allocation and strategic involvement can create meaningful value.",
  },
  {
    title: "Entrepreneurial Partnership",
    body: "We believe strong businesses are built through collaboration, trust, and a shared commitment to long-term success.",
  },
  {
    title: "Sustainable Value",
    body: "We focus on enduring business fundamentals and sustainable growth rather than short-term outcomes.",
  },
];

const PARTNERSHIP = [
  { title: "Patient capital", body: "Investment horizons aligned with how good businesses actually grow.", strong: true },
  { title: "Strategic counsel", body: "A sparring partner on strategy, structure and key decisions.", strong: true },
  { title: "Access to the Virex network", body: "Perspective and relationships from across the wider Virex ecosystem." },
  { title: "Discretion", body: "Every conversation handled confidentially, from first introduction." },
];

const HERO_STRIP = [
  "01 — Private investments",
  "02 — Venture partnerships",
  "03 — Listed equities",
  "Part of the Virex ecosystem",
];

export default function Home() {
  return (
    <div className="w-full overflow-x-hidden">
      {/* Hero — header overlays this section in its dark tone. */}
      <section
        aria-labelledby="hero-title"
        className="relative flex min-h-[880px] flex-col justify-end overflow-hidden bg-virex-deepink text-virex-warmwhite"
      >
        <Artwork src={IMAGES.tower} alt="Vertical fins of a contemporary office tower at dusk" className="absolute inset-0" />
        <div aria-hidden="true" className="absolute inset-0 bg-virex-deepink/50" />
        <div aria-hidden="true" className="absolute inset-y-0 left-0 w-[46%] bg-virex-deepink/40" />

        <div className="container relative w-full pt-[200px]">
          <FadeIn>
            <Eyebrow tone="dark" className="mb-8">
              Private Capital &amp; Investments
            </Eyebrow>
            <h1
              id="hero-title"
              className="max-w-[1000px] font-serif text-[clamp(46px,6.6vw,104px)] font-light leading-[1.02] tracking-[-0.02em]"
            >
              Capital with conviction.
              <br />
              Partnerships with <Accent tone="dark">purpose.</Accent>
            </h1>
            <div className="mt-11 flex max-w-[560px] flex-col gap-10">
              <p className="text-lg leading-[1.7] text-virex-stone">
                Virex Capital partners with ambitious businesses and exceptional entrepreneurs to build enduring value
                through strategic investment and long-term collaboration.
              </p>
              <div className="flex flex-wrap gap-3">
                <ButtonLink href="/strategy" variant="light" arrow>
                  Explore our approach
                </ButtonLink>
                <ButtonLink href="/contact" variant="ghost">
                  Get in touch
                </ButtonLink>
              </div>
            </div>
          </FadeIn>
        </div>

        <div className="container relative mt-24 w-full">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6 border-t border-virex-stone/20 pb-9 pt-7">
            {HERO_STRIP.map((item) => (
              <p key={item} className="text-xs uppercase tracking-[0.2em] text-virex-sage">
                {item}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Who we are */}
      <section aria-labelledby="who-title" className="section-y bg-virex-white">
        <div className="container flex flex-wrap items-center gap-x-24 gap-y-16">
          <figure className="vx-card min-w-0 flex-[1_1_380px]">
            <Artwork src={IMAGES.facade} alt="Recessed windows in a pale concrete facade" className="aspect-[4/5]" zoom />
            <figcaption className="mt-4 text-xs tracking-[0.04em] text-virex-muted">
              Structure, proportion and patience.
            </figcaption>
          </figure>
          <FadeIn className="min-w-0 max-w-[560px] flex-[1_1_360px]">
            <Eyebrow>Who we are</Eyebrow>
            <h2 id="who-title" className="type-h2">
              Beyond capital.
              <br />
              <Accent>Building lasting value.</Accent>
            </h2>
            <p className="mt-9 text-[17px] leading-[1.8] text-virex-body">
              At Virex Capital, we believe meaningful investments extend beyond financial commitments. We work
              alongside ambitious entrepreneurs and businesses, combining strategic perspective, disciplined
              investment, and long-term partnership to support sustainable growth.
            </p>
            <TextLink href="/about" className="mt-11">
              Discover Virex Capital
            </TextLink>
          </FadeIn>
        </div>
      </section>

      {/* Philosophy */}
      <section aria-labelledby="phil-title" className="section-y">
        <div className="container">
          <div className="flex flex-wrap items-end justify-between gap-x-24 gap-y-8">
            <div className="min-w-0 flex-[1_1_400px]">
              <Eyebrow>Our philosophy</Eyebrow>
              <h2 id="phil-title" className="type-h2">
                Long-term thinking.
                <br />
                Disciplined execution.
              </h2>
            </div>
            <p className="flex-[0_1_380px] text-base leading-[1.75] text-virex-muted">
              Three principles guide how we evaluate opportunities and how we work with the businesses we back.
            </p>
          </div>
          <div className="mt-24 grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-12">
            {PRINCIPLES.map((p, i) => (
              <FadeIn key={p.title} delay={i * 0.1}>
                <article className="border-t border-virex-deepink pt-8">
                  <p aria-hidden="true" className="font-serif text-7xl font-light leading-none text-virex-forest">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mb-4 mt-12 text-xl font-semibold tracking-[-0.005em]">{p.title}</h3>
                  <p className="text-base leading-[1.75] text-virex-muted">{p.body}</p>
                </article>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Investment approach */}
      <section aria-labelledby="approach-title" className="section-y bg-virex-forest text-virex-warmwhite">
        <div className="container flex flex-wrap gap-x-28 gap-y-[72px]">
          <div className="min-w-0 flex-[1_1_380px]">
            <Eyebrow tone="dark">Investment approach</Eyebrow>
            <h2 id="approach-title" className="type-h2">
              Selective by nature.
              <br />
              <Accent tone="dark">Ambitious by design.</Accent>
            </h2>
            <p className="mt-9 max-w-[520px] text-[17px] leading-[1.8] text-virex-stone">
              We invest across private businesses and listed equities with the same discipline: understand the
              fundamentals, assess the people, and commit only where we can contribute to lasting value.
            </p>
            <div className="mt-14 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-8">
              <div className="border-t border-virex-sage/40 pt-6">
                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-virex-sage">
                  {getByMarket("Private markets").length} Positions
                </p>
                <h3 className="mb-3 text-base font-semibold">Private markets</h3>
                <p className="text-[15px] leading-[1.7] text-virex-stone">
                  Direct growth investments, venture capital, and strategic partnerships alongside founders and owners.
                </p>
              </div>
              <div className="border-t border-virex-sage/40 pt-6">
                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-virex-sage">
                  {getByMarket("Public markets").length} Positions
                </p>
                <h3 className="mb-3 text-base font-semibold">Public markets</h3>
                <p className="text-[15px] leading-[1.7] text-virex-stone">
                  Long-term holdings in publicly listed global leaders selected on fundamental research.
                </p>
              </div>
            </div>
            <TextLink href="/strategy" tone="dark" className="mt-14">
              Explore our investment strategy
            </TextLink>
          </div>
          <div className="min-w-0 flex-[1_1_360px]">
            <p className="mb-2 text-xs uppercase tracking-[0.2em] text-virex-sage">Areas of interest</p>
            <ul>
              {AREAS_OF_INTEREST.map((area, i) => (
                <li key={area.title} className="flex items-baseline gap-8 border-b border-virex-sage/30 py-7">
                  <span className="w-6 text-xs text-virex-sage">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-serif text-[30px] font-light">{area.title}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[13px] leading-relaxed text-virex-sage">
              Illustrative areas of interest. Not a confirmed investment mandate.
            </p>
          </div>
        </div>
      </section>

      {/* Partnership */}
      <section aria-labelledby="port-title" className="section-y">
        <div className="container">
          <div className="flex flex-wrap items-end justify-between gap-x-24 gap-y-8">
            <div className="min-w-0 flex-[1_1_480px]">
              <Eyebrow>Partnership</Eyebrow>
              <h2 id="port-title" className="type-h2">
                Backing ambition.
                <br />
                Enabling progress.
              </h2>
            </div>
            <p className="flex-[0_1_380px] text-base leading-[1.75] text-virex-muted">
              What the businesses we invest in can expect from Virex Capital — from the first conversation onwards.
            </p>
          </div>
          <div className="mt-20 flex flex-wrap items-stretch gap-x-24 gap-y-12">
            <div className="vx-card min-h-[420px] min-w-0 flex-[1_1_360px]">
              <Artwork src={IMAGES.colonnade} alt="Colonnade with long afternoon shadows" className="size-full bg-virex-warmstone" zoom />
            </div>
            <div className="grid min-w-0 flex-[1_1_400px] grid-cols-[repeat(auto-fit,minmax(220px,1fr))] content-start gap-x-12">
              {PARTNERSHIP.map((item) => (
                <div
                  key={item.title}
                  className={`border-t pb-8 pt-7 ${item.strong ? "border-virex-deepink" : "border-virex-stone"}`}
                >
                  <h3 className="mb-2.5 text-lg font-semibold">{item.title}</h3>
                  <p className="text-[15px] leading-[1.7] text-virex-muted">{item.body}</p>
                </div>
              ))}
              <div className="col-span-full flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-virex-stone pt-7">
                <TextLink href="/contact">Discuss a partnership</TextLink>
                <TextLink href="/portfolio" muted arrow={false}>
                  Our portfolio
                </TextLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Insights teaser */}
      <section aria-labelledby="ins-title" className="section-y bg-virex-white">
        <div className="container">
          <div className="flex flex-wrap items-end justify-between gap-8">
            <div className="min-w-0 flex-[1_1_420px]">
              <Eyebrow>Perspectives</Eyebrow>
              <h2 id="ins-title" className="type-h2 max-w-[760px]">
                Perspectives on capital, business and <Accent>innovation.</Accent>
              </h2>
            </div>
            <TextLink href="/insights">All insights</TextLink>
          </div>
          <div className="mt-20 grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-x-10 gap-y-12">
            {ARTICLES.slice(0, 3).map((article) => (
              <ArticleCard key={article.slug} article={article} aspect="aspect-[4/3]" />
            ))}
          </div>
          <p className="mt-14 text-[13px] text-virex-muted">
            Editorial placeholder content, shown to illustrate the publication format.
          </p>
        </div>
      </section>

      <CtaBand id="cta-title" large title={<>Great businesses are <Accent tone="dark">built together.</Accent></>}>
        We welcome conversations with entrepreneurs, business owners, and potential partners who share our ambition
        for long-term value creation.
      </CtaBand>
    </div>
  );
}
