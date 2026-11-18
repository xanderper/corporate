import { FadeIn } from "@virex/ui";
import { buildMetadata } from "../../lib/metadata";
import { IMAGES } from "../../lib/insights";
import { Accent, Artwork, CtaBand, Eyebrow } from "../../components/ui";

export const metadata = buildMetadata({
  title: "About",
  description:
    "Virex Capital is a private investment firm focused on identifying opportunities, supporting ambitious businesses and creating sustainable long-term value.",
  path: "/about",
});

const PRINCIPLES = [
  {
    numeral: "I.",
    title: "Discipline",
    body: "Careful research and clear criteria come before every commitment. We would rather miss an opportunity than misjudge one.",
  },
  {
    numeral: "II.",
    title: "Partnership",
    body: "We work alongside founders and management, with candour and mutual respect, towards goals we share.",
  },
  {
    numeral: "III.",
    title: "Discretion",
    body: "Conversations with us are handled with care and confidentiality, from first introduction onwards.",
  },
  {
    numeral: "IV.",
    title: "Long-term perspective",
    body: "We judge decisions by their effect over years. Sustainable growth matters more to us than short-term outcomes.",
  },
];

const CULTURE = [
  { title: "Rigorous preparation", body: "Every decision rests on research we can explain and defend." },
  {
    title: "Candid dialogue",
    body: "We say what we think, and we listen carefully to those who know their business best.",
  },
  { title: "Patient capital", body: "We give good businesses the time they need to compound value." },
];

export default function AboutPage() {
  return (
    <div className="w-full overflow-x-hidden">
      <section aria-labelledby="about-title" className="pb-[120px] pt-[clamp(80px,10vw,144px)]">
        <div className="container">
          <FadeIn>
            <Eyebrow className="mb-9">About Virex Capital</Eyebrow>
            <h1
              id="about-title"
              className="max-w-[1120px] font-serif text-[clamp(44px,6vw,92px)] font-light leading-[1.03] tracking-[-0.02em]"
            >
              A long-term partner for businesses with <Accent>lasting ambition.</Accent>
            </h1>
          </FadeIn>
          <div className="mt-[88px] flex flex-wrap gap-x-24 gap-y-10 border-t border-virex-stone pt-12">
            <p className="min-w-0 flex-[1_1_400px] font-serif text-[28px] font-light leading-[1.4]">
              Virex Capital is a private investment firm focused on identifying opportunities, supporting ambitious
              businesses and creating sustainable long-term value.
            </p>
            <div className="flex min-w-0 flex-[1_1_400px] flex-col gap-6 text-base leading-[1.8] text-virex-body">
              <p>
                We invest in private businesses and in listed companies. In both, we look for the same things: sound
                fundamentals, capable leadership and a credible path to durable growth.
              </p>
              <p>
                We see ourselves as a partner rather than simply a source of capital. That means taking the time to
                understand a business, contributing perspective where it helps, and staying the course when patience
                is required.
              </p>
            </div>
          </div>
        </div>
      </section>

      <figure>
        <Artwork
          src={IMAGES.skyline}
          alt="Layered European city skyline in soft morning haze"
          className="h-[clamp(280px,42vw,620px)]"
        />
        <figcaption className="container pt-4 text-xs tracking-[0.04em] text-virex-muted">
          A European perspective, an international outlook.
        </figcaption>
      </figure>

      <section aria-labelledby="phil-title" className="section-y">
        <div className="container flex flex-wrap gap-x-24 gap-y-12">
          <div className="min-w-0 flex-[1_1_320px]">
            <Eyebrow rule={false}>01 — Philosophy</Eyebrow>
            <h2 id="phil-title" className="type-h2-sm">
              Capital is only the beginning.
            </h2>
          </div>
          <div className="flex min-w-0 max-w-[720px] flex-[2_1_440px] flex-col gap-7 text-[17px] leading-[1.85] text-virex-body">
            <p>
              Meaningful investment extends beyond a financial commitment. The value we aim to create comes from
              alignment: between our capital and a company’s ambitions, between short-term decisions and long-term
              direction.
            </p>
            <p>
              We favour depth over breadth. A focused set of well-understood positions allows us to be genuinely
              useful to the businesses we support, and accountable for the decisions we make.
            </p>
            <blockquote className="mt-6 border-t border-virex-stone pt-8 font-serif text-[30px] font-light italic leading-[1.35] text-virex-forest">
              “We measure success in years, not quarters.”
            </blockquote>
          </div>
        </div>
      </section>

      <section aria-labelledby="princ-title" className="section-y bg-virex-white">
        <div className="container">
          <Eyebrow rule={false}>02 — Core principles</Eyebrow>
          <h2 id="princ-title" className="type-h2-sm max-w-[680px]">
            What guides every decision we make.
          </h2>
          <div className="mt-20 grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] border-t border-virex-stone">
            {PRINCIPLES.map((p) => (
              <article key={p.title} className="border-b border-virex-stone py-12 pr-12">
                <p aria-hidden="true" className="mb-8 font-serif text-xl text-virex-forest">
                  {p.numeral}
                </p>
                <h3 className="mb-3.5 text-xl font-semibold">{p.title}</h3>
                <p className="max-w-[460px] text-base leading-[1.75] text-virex-muted">{p.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="culture-title" className="section-y bg-virex-forest text-virex-warmwhite">
        <div className="container flex flex-wrap items-center gap-x-28 gap-y-16">
          <Artwork
            src={IMAGES.colonnade}
            alt="Colonnade with long afternoon shadows"
            className="aspect-[5/4] min-w-0 flex-[1_1_360px] bg-virex-deepink"
            imgClassName="opacity-90"
          />
          <div className="min-w-0 flex-[1_1_360px]">
            <Eyebrow tone="dark" rule={false}>
              03 — Investment culture
            </Eyebrow>
            <h2 id="culture-title" className="type-h2-sm">
              Considered, candid and <Accent tone="dark">patient.</Accent>
            </h2>
            <ul className="mt-12 border-b border-virex-sage/35">
              {CULTURE.map((c) => (
                <li key={c.title} className="border-t border-virex-sage/35 py-6">
                  <h3 className="mb-2 text-base font-semibold">{c.title}</h3>
                  <p className="text-[15px] leading-[1.7] text-virex-stone">{c.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section aria-labelledby="eco-title" className="section-y">
        <div className="container flex flex-wrap gap-x-24 gap-y-12">
          <div className="min-w-0 flex-[1_1_320px]">
            <Eyebrow rule={false}>04 — The Virex ecosystem</Eyebrow>
            <h2 id="eco-title" className="type-h2-sm">
              Part of something broader.
            </h2>
          </div>
          <div className="min-w-0 max-w-[720px] flex-[2_1_440px]">
            <p className="text-[17px] leading-[1.85] text-virex-body">
              Virex Capital operates within the wider Virex ecosystem. This gives the businesses we work with access
              to a broader network of perspective and experience, while Virex Capital retains its own investment
              discipline and decision-making.
            </p>
            <p className="mt-7 border border-virex-stone bg-virex-white px-6 py-5 text-sm leading-relaxed text-virex-muted">
              [Description of the Virex ecosystem and its entities — to be supplied and approved by the company.]
            </p>
          </div>
        </div>
      </section>

      <CtaBand id="cta-title" title={<>Let’s explore what we could <Accent tone="dark">build together.</Accent></>} />
    </div>
  );
}
