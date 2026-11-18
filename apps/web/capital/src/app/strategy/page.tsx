import { buildMetadata } from "../../lib/metadata";
import { IMAGES } from "../../lib/insights";
import { AREAS_OF_INTEREST } from "../../lib/strategy";
import { Accent, Artwork, ButtonLink, Eyebrow, PlaceholderBadge } from "../../components/ui";

export const metadata = buildMetadata({
  title: "Investment Strategy",
  description:
    "How Virex Capital finds opportunities, evaluates them, and works with the businesses and companies it invests in — across private and public markets.",
  path: "/strategy",
});

const SECTIONS = [
  { id: "philosophy", label: "Philosophy" },
  { id: "process", label: "Our process" },
  { id: "markets", label: "Private & public markets" },
  { id: "criteria", label: "Investment criteria" },
  { id: "areas", label: "Areas of interest" },
  { id: "partner", label: "Partnership" },
];

const PROCESS = [
  {
    n: "i",
    title: "Opportunity identification",
    body: "We source opportunities through our network, the wider Virex ecosystem and our own research, focusing on sectors and business models we understand well.",
  },
  {
    n: "ii",
    title: "Investment evaluation",
    body: "We assess fundamentals, market position, leadership and risks with care. Conviction is built on evidence, and a clear view of what could go wrong.",
  },
  {
    n: "iii",
    title: "Strategic collaboration",
    body: "In private investments we work alongside management, contributing perspective, network and support where it adds value — without taking over what they do best.",
  },
  {
    n: "iv",
    title: "Long-term value creation",
    body: "We stay committed over time, reviewing each position regularly and making decisions with the long-term health of the business in mind.",
  },
];

const QUALITIES = [
  "Sound business fundamentals and a clear value proposition",
  "Capable, committed leadership with integrity",
  "A credible path to sustainable, long-term growth",
  "Room for our perspective and network to make a difference",
];

const PARAMETERS = ["Investment stage", "Investment size", "Geographic focus", "Holding horizon"];

const AUDIENCES = [
  {
    title: "Entrepreneurs & founders",
    body: "Building something ambitious and looking for a partner who thinks long-term.",
  },
  {
    title: "Business owners",
    body: "Considering growth capital, a strategic partner or the next chapter for your company.",
  },
  {
    title: "Co-investors & partners",
    body: "Exploring opportunities where aligned capital and expertise create more value together.",
  },
];

function SectionLabel({ n, children, dark = false }: { n: number; children: string; dark?: boolean }) {
  return (
    <Eyebrow rule={false} tone={dark ? "dark" : "light"}>
      {`${String(n).padStart(2, "0")} — ${children}`}
    </Eyebrow>
  );
}

export default function StrategyPage() {
  return (
    <div className="w-full">
      <section aria-labelledby="st-title" className="pt-[clamp(72px,9vw,128px)]">
        <div className="container flex flex-wrap items-end gap-x-24 gap-y-14">
          <div className="min-w-0 flex-[1_1_480px]">
            <Eyebrow className="mb-9">Investment Strategy</Eyebrow>
            <h1 id="st-title" className="type-display">
              A disciplined approach to <Accent>long-term value.</Accent>
            </h1>
          </div>
          <p className="min-w-0 flex-[0_1_400px] text-[17px] leading-[1.8] text-virex-body">
            How we find opportunities, how we evaluate them, and how we work with the businesses and companies we
            invest in — across private and public markets.
          </p>
        </div>
        <div className="container mt-24">
          <Artwork
            src={IMAGES.bridge}
            alt="Cable-stayed bridge over still water at dawn"
            className="h-[clamp(280px,40vw,560px)]"
          />
        </div>
      </section>

      {/* Sticky in-page navigation, docked under the fixed site header. */}
      <nav
        aria-label="On this page"
        className="sticky top-24 z-30 mt-[72px] border-b border-virex-stone bg-virex-warmwhite/95 backdrop-blur-sm"
      >
        <ol className="container flex h-16 items-center gap-10 overflow-x-auto whitespace-nowrap text-[13px] tracking-[0.02em]">
          {SECTIONS.map((s, i) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="text-virex-body transition-colors hover:text-virex-forest">
                <span className="text-virex-muted">{String(i + 1).padStart(2, "0")}</span>&ensp;{s.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <section id="philosophy" aria-labelledby="ph-title" className="section-y-sm scroll-mt-40">
        <div className="container flex flex-wrap gap-x-24 gap-y-12">
          <div className="min-w-0 flex-[1_1_320px]">
            <SectionLabel n={1}>Investment philosophy</SectionLabel>
            <h2 id="ph-title" className="type-h2-sm">
              Fewer decisions, made well.
            </h2>
          </div>
          <div className="flex min-w-0 max-w-[720px] flex-[2_1_440px] flex-col gap-6 text-[17px] leading-[1.85] text-virex-body">
            <p>
              We believe that long-term returns come from understanding a business deeply, buying into it sensibly,
              and supporting it patiently. We are selective about where we commit capital, and deliberate about how we
              stay involved.
            </p>
            <p>
              Whether we are partnering with a founder or holding shares in a listed company, our questions are the
              same: is the business sound, are the people capable, and can value compound over time?
            </p>
          </div>
        </div>
      </section>

      <section id="process" aria-labelledby="pr-title" className="section-y-sm scroll-mt-40 bg-virex-white">
        <div className="container">
          <SectionLabel n={2}>Our process</SectionLabel>
          <h2 id="pr-title" className="type-h2-sm max-w-[720px]">
            From first conversation to <Accent>lasting partnership.</Accent>
          </h2>
          <ol className="mt-[88px] border-b border-virex-stone">
            {PROCESS.map((step, i) => (
              <li
                key={step.n}
                className={`flex flex-wrap gap-x-16 gap-y-6 border-t py-12 ${i === 0 ? "border-virex-deepink" : "border-virex-stone"}`}
              >
                <span aria-hidden="true" className="flex-[0_0_72px] font-serif text-[56px] font-light leading-none text-virex-forest">
                  {step.n}
                </span>
                <h3 className="min-w-0 flex-[1_1_280px] text-[22px] font-semibold">{step.title}</h3>
                <p className="min-w-0 flex-[2_1_420px] text-base leading-[1.8] text-virex-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="markets" aria-labelledby="mk-title" className="section-y-sm scroll-mt-40">
        <div className="container">
          <SectionLabel n={3}>Private &amp; public markets</SectionLabel>
          <h2 id="mk-title" className="type-h2-sm max-w-[720px]">
            One discipline, two markets.
          </h2>
          <div className="mt-[72px] grid grid-cols-[repeat(auto-fit,minmax(min(340px,100%),1fr))] gap-6">
            <article className="flex min-h-[340px] flex-col gap-6 bg-virex-forest p-[clamp(28px,4.5vw,56px)] text-virex-warmwhite">
              <p className="text-xs uppercase tracking-[0.2em] text-virex-sage">Private markets</p>
              <h3 className="font-serif text-4xl font-light leading-[1.15]">Investing in businesses</h3>
              <p className="text-base leading-[1.8] text-virex-stone">
                Direct investments and venture partnerships with entrepreneurs and business owners, where our
                involvement extends beyond capital.
              </p>
              <p className="mt-auto text-sm text-virex-sage">
                Venture capital · Private investments · Strategic partnerships
              </p>
            </article>
            <article className="flex min-h-[340px] flex-col gap-6 border border-virex-stone bg-virex-white p-[clamp(28px,4.5vw,56px)]">
              <p className="text-xs uppercase tracking-[0.2em] text-virex-muted">Public markets</p>
              <h3 className="font-serif text-4xl font-light leading-[1.15]">Investing in listed equities</h3>
              <p className="text-base leading-[1.8] text-virex-body">
                Long-term positions in listed companies, selected on fundamental research and held with the same
                patience we bring to private investments.
              </p>
              <p className="mt-auto text-sm text-virex-muted">Fundamental research · Long-term holdings</p>
            </article>
          </div>
        </div>
      </section>

      <section id="criteria" aria-labelledby="cr-title" className="section-y-sm scroll-mt-40 bg-virex-white">
        <div className="container flex flex-wrap gap-x-24 gap-y-12">
          <div className="min-w-0 flex-[1_1_320px]">
            <SectionLabel n={4}>Investment criteria</SectionLabel>
            <h2 id="cr-title" className="type-h2-sm">
              What we look for.
            </h2>
            <p className="mt-7 max-w-[360px] text-[15px] leading-[1.75] text-virex-muted">
              Formal parameters are published once confirmed by the company. Until then they are shown as
              placeholders.
            </p>
          </div>
          <div className="min-w-0 flex-[2_1_440px]">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-virex-forest">Qualities we value</p>
            <ul className="mb-14 text-[17px] leading-relaxed">
              {QUALITIES.map((q) => (
                <li key={q} className="border-b border-virex-stone py-5">
                  {q}
                </li>
              ))}
            </ul>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-virex-muted">Formal parameters</p>
            <dl className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] border-t border-virex-stone">
              {PARAMETERS.map((label) => (
                <div key={label} className="border-b border-virex-stone py-5 pr-6">
                  <dt className="text-[13px] text-virex-muted">{label}</dt>
                  <dd className="mt-1.5 text-[15px]">[To be confirmed]</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section id="areas" aria-labelledby="ar-title" className="section-y-sm scroll-mt-40">
        <div className="container">
          <div className="flex flex-wrap items-end justify-between gap-x-16 gap-y-6">
            <div className="min-w-0 flex-[1_1_400px]">
              <SectionLabel n={5}>Areas of interest</SectionLabel>
              <h2 id="ar-title" className="type-h2-sm">
                Where we see opportunity.
              </h2>
            </div>
            <PlaceholderBadge>Illustrative — not a confirmed mandate</PlaceholderBadge>
          </div>
          <div className="mt-16 grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
            {AREAS_OF_INTEREST.map((area, i) => (
              <article
                key={area.title}
                className="flex min-h-[260px] flex-col justify-between border border-virex-stone px-7 py-9 transition-colors duration-300 hover:border-virex-forest hover:bg-virex-white"
              >
                <span className="text-xs text-virex-muted">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="mb-3 font-serif text-2xl leading-[1.2]">{area.title}</h3>
                  <p className="text-sm leading-[1.65] text-virex-muted">{area.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="partner" aria-labelledby="pa-title" className="section-y-sm scroll-mt-40 bg-virex-forest text-virex-warmwhite">
        <div className="container">
          <SectionLabel n={6} dark>
            Partnership opportunities
          </SectionLabel>
          <h2 id="pa-title" className="type-h2 max-w-[820px]">
            We’d like to hear from <Accent tone="dark">you.</Accent>
          </h2>
          <div className="mt-20 grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-12">
            {AUDIENCES.map((a) => (
              <div key={a.title} className="border-t border-virex-sage/40 pt-7">
                <h3 className="mb-3 text-lg font-semibold">{a.title}</h3>
                <p className="text-[15px] leading-[1.75] text-virex-stone">{a.body}</p>
              </div>
            ))}
          </div>
          <ButtonLink href="/contact" variant="light" arrow className="mt-[72px]">
            Start a conversation
          </ButtonLink>
        </div>
      </section>

      <section aria-label="Important information" className="py-14">
        <div className="container">
          <p className="max-w-[880px] text-[13px] leading-[1.7] text-virex-muted">
            Important information: the content on this website is for general information only and does not
            constitute investment advice, an offer or a solicitation to buy or sell any security or financial
            instrument. [Final legal wording to be supplied by the company.]
          </p>
        </div>
      </section>
    </div>
  );
}
