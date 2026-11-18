import { buildMetadata } from "../../lib/metadata";
import { Accent, ButtonLink, Eyebrow } from "../../components/ui";

export const metadata = buildMetadata({
  title: "About",
  description:
    "Virex Holding is the parent company of the Virex group. It represents the group’s long-term vision, strategy and entrepreneurial philosophy.",
  path: "/about",
});

const STATEMENTS = [
  {
    label: "01 — Vision",
    text: "A group of enduring businesses that create lasting value for customers, employees and partners.",
  },
  {
    label: "02 — Mission",
    text: "To build, own and develop businesses with patience and discipline — giving each the stability and direction to grow.",
  },
  {
    label: "03 — Ambition",
    text: "To grow the Virex group steadily: strengthening the businesses we have, and adding new ones that share our long-term philosophy.",
  },
];

const APPROACH = [
  {
    label: "01 / Build",
    title: "Start with foundations",
    body: "We build businesses around a clear purpose and a real need in the market. We take the time to get the foundations right — the team, the product, the way of working — before we scale.",
  },
  {
    label: "02 / Own",
    title: "Hold with responsibility",
    body: "We own our businesses without a set exit date. That lets leadership plan for the long run, invest when it matters and make decisions that are right for the company, not just for this year.",
  },
  {
    label: "03 / Develop",
    title: "Keep improving",
    body: "We continue to invest in people, products and capabilities, and we share what we learn across the group, so that every business grows stronger over time.",
  },
];

const PHILOSOPHY = [
  { n: "I", title: "Think in decades", body: "We judge choices by what they mean for the business years from now." },
  {
    n: "II",
    title: "Entrepreneurship at the core",
    body: "We value initiative, ownership and the courage to build something new.",
  },
  {
    n: "III",
    title: "Independence within a group",
    body: "Each business keeps its own identity; the group gives it strength.",
  },
  {
    n: "IV",
    title: "Responsibility",
    body: "Towards customers, employees, partners and the communities we work in.",
  },
];

export default function AboutPage() {
  return (
    <div className="w-full">
      <section aria-labelledby="ab-title" className="pb-[clamp(64px,8vw,112px)] pt-[clamp(72px,9vw,128px)]">
        <div className="container">
          <Eyebrow className="mb-9">About Virex Holding</Eyebrow>
          <h1
            id="ab-title"
            className="max-w-[1100px] font-serif text-[clamp(44px,6vw,92px)] font-light leading-[1.03] tracking-[-0.02em]"
          >
            A group built for <Accent>the long term.</Accent>
          </h1>
          <div className="mt-20 flex flex-wrap gap-x-24 gap-y-10 border-t border-virex-deepink pt-10">
            <p className="min-w-0 flex-[1_1_460px] font-serif text-[28px] font-light leading-[1.4]">
              Virex Holding is the parent company of the Virex group. It represents the group’s long-term vision,
              strategy and entrepreneurial philosophy.
            </p>
            <div className="flex min-w-0 flex-[1_1_380px] flex-col gap-6 text-base leading-[1.8] text-virex-body">
              <p>
                We are not a product brand or a service provider. We are the owner behind a group of businesses — each
                with its own identity, its own customers and its own path to growth.
              </p>
              <p>
                Our role is to give those businesses what they need to last: stable ownership, a clear direction and
                the freedom to build.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="vm-title" className="pb-[clamp(88px,11vw,160px)]">
        <div className="container">
          <h2 id="vm-title" className="mb-14 font-mono text-xs font-normal uppercase tracking-[0.08em] text-virex-muted">
            Vision, mission &amp; ambition
          </h2>
          <dl className="border-t border-virex-deepink">
            {STATEMENTS.map((s) => (
              <div key={s.label} className="flex flex-wrap gap-x-16 gap-y-4 border-b border-virex-stone py-12">
                <dt className="flex-[0_0_220px] font-mono text-xs uppercase tracking-[0.08em] text-virex-forest">
                  {s.label}
                </dt>
                <dd className="min-w-0 flex-[1_1_520px] font-serif text-[clamp(26px,2.6vw,36px)] font-light leading-[1.3]">
                  {s.text}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section aria-labelledby="ap-title" className="section-y bg-virex-deepink text-virex-warmwhite">
        <div className="container">
          <Eyebrow tone="dark">Our approach</Eyebrow>
          <h2 id="ap-title" className="type-h2 max-w-[820px]">
            Building, owning and developing — <Accent tone="dark">in that order.</Accent>
          </h2>
          <div className="mt-[88px] grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-14">
            {APPROACH.map((a) => (
              <article key={a.label} className="border-t border-virex-sage/40 pt-8">
                <p className="font-mono text-[11px] uppercase text-virex-signal">{a.label}</p>
                <h3 className="mb-4 mt-7 font-serif text-[32px] font-light">{a.title}</h3>
                <p className="text-[15px] leading-[1.8] text-virex-stone">{a.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="ph-title" className="section-y">
        <div className="container flex flex-wrap gap-x-24 gap-y-12">
          <div className="min-w-0 flex-[1_1_340px]">
            <Eyebrow>Entrepreneurial philosophy</Eyebrow>
            <h2 id="ph-title" className="type-h2-sm">
              Owners who think like <Accent>entrepreneurs.</Accent>
            </h2>
          </div>
          <ol className="grid min-w-0 flex-[1.6_1_520px] grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-x-12">
            {PHILOSOPHY.map((p, i) => (
              <li key={p.n} className={`border-t py-8 ${i < 2 ? "border-virex-deepink" : "border-virex-stone"}`}>
                <p className="mb-5 font-mono text-[11px] text-virex-muted">{p.n}</p>
                <h3 className="mb-2.5 text-lg font-semibold">{p.title}</h3>
                <p className="text-[15px] leading-[1.75] text-virex-muted">{p.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="cta-title" className="bg-virex-forest py-[clamp(88px,11vw,144px)] text-virex-warmwhite">
        <div className="container flex flex-wrap items-end justify-between gap-x-24 gap-y-10">
          <h2
            id="cta-title"
            className="min-w-0 flex-[1_1_560px] font-serif text-[clamp(38px,4.6vw,68px)] font-light leading-[1.06] tracking-[-0.02em]"
          >
            Get to know <Accent tone="dark">the group.</Accent>
          </h2>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/group" variant="light" arrow>
              Our group
            </ButtonLink>
            <ButtonLink href="/contact" variant="ghost">
              Contact
            </ButtonLink>
          </div>
        </div>
      </section>
    </div>
  );
}
