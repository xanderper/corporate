import Link from "next/link";
import { buildMetadata } from "../lib/metadata";
import { GROUP, NUMBER_WORDS } from "../lib/group";
import { Accent, Artwork, ButtonLink, ContactBand, Eyebrow, TextLink } from "../components/ui";

export const metadata = buildMetadata({
  title: "Virex Holding",
  description:
    "Virex Holding brings together a group of distinct businesses under one long-term vision, strategy and entrepreneurial philosophy.",
  path: "/",
});

const PILLARS = [
  {
    title: "Build.",
    body: "We start and grow businesses with a clear purpose, sound foundations and room to become leaders in their field.",
  },
  {
    title: "Own.",
    body: "We hold our businesses for the long term. Ownership means responsibility, stability and decisions made with years in mind.",
  },
  {
    title: "Develop.",
    body: "We keep investing in people, products and capabilities, so each business grows stronger with every year.",
  },
];

export default function Home() {
  return (
    <div className="w-full overflow-x-hidden">
      {/* Hero — the header sits above this in its dark (ink) tone. */}
      <section aria-labelledby="hero-title" className="flex min-h-[760px] flex-wrap bg-virex-deepink pt-24 text-virex-warmwhite">
        <div className="flex min-w-0 flex-[1.25_1_520px] flex-col justify-between gap-16 pb-[clamp(56px,6vw,80px)] pl-[max(24px,calc((100%-1232px)/2))] pr-[clamp(24px,5vw,80px)] pt-[clamp(72px,9vw,128px)]">
          <div>
            <Eyebrow tone="dark" className="mb-10">
              Parent company of the Virex group
            </Eyebrow>
            <h1
              id="hero-title"
              className="max-w-[760px] font-serif text-[clamp(44px,5.4vw,86px)] font-light leading-[1.03] tracking-[-0.02em]"
            >
              Building, owning and developing businesses <Accent tone="dark">for the long term.</Accent>
            </h1>
            <p className="mt-10 max-w-[520px] text-lg leading-[1.7] text-virex-stone">
              Virex Holding brings together a group of distinct businesses under one long-term vision, strategy and
              entrepreneurial philosophy.
            </p>
            <div className="mt-11 flex flex-wrap gap-3">
              <ButtonLink href="/group" variant="light" arrow>
                Discover our group
              </ButtonLink>
              <ButtonLink href="/about" variant="ghost">
                About Virex Holding
              </ButtonLink>
            </div>
          </div>
          <nav aria-label="Group companies" className="border-t border-virex-stone/20 pt-6">
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.08em] text-virex-sage">Our businesses</p>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,170px),1fr))] gap-2">
              {GROUP.map((b) => (
                <Link
                  key={b.id}
                  href={`/group#${b.id}`}
                  className="flex flex-col gap-1.5 border border-virex-stone/20 px-[18px] py-4 text-virex-warmwhite transition-colors duration-300 hover:border-virex-warmwhite hover:bg-virex-warmwhite/5"
                >
                  <span className="font-serif text-xl">{b.name}</span>
                  <span className="text-[13px] text-virex-sage">{b.shortSector}</span>
                </Link>
              ))}
            </div>
          </nav>
        </div>
        <Artwork
          src="/images/frame.svg"
          alt="Concrete structural frame of a building rising at dusk"
          position="30% 80%"
          className="relative min-h-[420px] min-w-0 flex-[1_1_380px] bg-virex-forest"
        />
      </section>

      <section aria-labelledby="group-title" className="section-y">
        <div className="container flex flex-wrap gap-x-28 gap-y-12">
          <div className="min-w-0 flex-[1.3_1_480px]">
            <Eyebrow>01 / The group</Eyebrow>
            <h2 id="group-title" className="font-serif text-[clamp(32px,3.4vw,50px)] font-light leading-[1.18] tracking-[-0.01em]">
              One group. Distinct businesses. A shared commitment to building value <Accent>that lasts.</Accent>
            </h2>
          </div>
          <div className="flex min-w-0 flex-[1_1_360px] flex-col gap-6 pt-2 text-base leading-[1.8] text-virex-body">
            <p>
              Virex Holding is the overarching company of the Virex group. It owns the group’s businesses, sets the
              long-term direction and safeguards the values they share.
            </p>
            <p>
              Each business operates under its own name, with its own leadership, market focus and identity. The
              holding provides what they have in common: stability, a long horizon and an entrepreneurial way of
              thinking.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="bod-title" className="pb-[clamp(88px,11vw,160px)]">
        <div className="container">
          <h2 id="bod-title" className="sr-only">
            Build, own, develop
          </h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-12">
            {PILLARS.map((p, i) => (
              <article key={p.title} className="border-t border-virex-deepink pt-7">
                <p className="font-mono text-xs tracking-[0.08em] text-virex-muted">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mb-4 mt-8 font-serif text-[52px] font-light leading-none">{p.title}</h3>
                <p className="max-w-[340px] text-base leading-[1.75] text-virex-muted">{p.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Group structure: parent node with connector lines to each business. */}
      <section aria-labelledby="struct-title" className="section-y bg-virex-white">
        <div className="container">
          <div className="flex flex-wrap items-end justify-between gap-x-24 gap-y-6">
            <div className="min-w-0 flex-[1_1_480px]">
              <Eyebrow>02 / Our group</Eyebrow>
              <h2 id="struct-title" className="type-h2">
                {NUMBER_WORDS[GROUP.length]} businesses, <Accent>one owner.</Accent>
              </h2>
            </div>
            <TextLink href="/group">View the full group</TextLink>
          </div>

          <div className="mt-[72px] flex flex-col items-center">
            <div className="inline-flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1.5 bg-virex-deepink px-7 py-[18px] text-virex-warmwhite max-[760px]:mb-6">
              <span aria-hidden="true" className="inline-block size-[7px] bg-virex-signal" />
              <span className="font-serif text-2xl font-light">Virex Holding</span>
              <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-virex-sage">Parent company</span>
            </div>
            <div aria-hidden="true" className="h-10 w-px bg-virex-deepink max-[760px]:hidden" />
            <div className="relative w-full">
              <div aria-hidden="true" className="absolute inset-x-[16.666%] top-0 h-px bg-virex-deepink max-[760px]:hidden" />
              <ul aria-label="Businesses of the Virex group" className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] items-stretch gap-6">
                {GROUP.map((b) => (
                  <li key={b.id} className="vx-card flex flex-col">
                    <div aria-hidden="true" className="h-10 w-px self-center bg-virex-deepink max-[760px]:hidden" />
                    <article className="flex flex-1 flex-col border border-virex-stone bg-virex-white transition-colors duration-300 hover:border-virex-deepink">
                      <Artwork src={b.image} alt={b.alt} className="aspect-[16/10]" zoom />
                      <div className="flex flex-1 flex-col gap-3 p-7">
                        <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-virex-muted">{b.sector}</p>
                        <h3 className="font-serif text-[34px] font-light leading-[1.05]">{b.name}</h3>
                        <p className="text-[15px] leading-[1.65] text-virex-muted">{b.summary}</p>
                        <div className="mt-auto flex flex-wrap gap-x-6 gap-y-1 border-t border-virex-stone pt-4">
                          {b.url && (
                            <TextLink href={b.url} external>
                              Visit website
                            </TextLink>
                          )}
                          <TextLink href={`/group#${b.id}`} muted>
                            More
                          </TextLink>
                        </div>
                      </div>
                    </article>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="vision-title" className="bg-virex-forest py-[clamp(96px,12vw,176px)] text-virex-warmwhite">
        <div className="container">
          <Eyebrow tone="dark" className="mb-10">
            03 / Our vision
          </Eyebrow>
          <h2
            id="vision-title"
            className="max-w-[1080px] font-serif text-[clamp(36px,4.6vw,68px)] font-light leading-[1.12] tracking-[-0.015em]"
          >
            The most enduring businesses are built with patience, ownership and a{" "}
            <Accent tone="dark">clear sense of direction.</Accent>
          </h2>
          <TextLink href="/about" tone="dark" className="mt-14">
            Our vision and philosophy
          </TextLink>
        </div>
      </section>

      <ContactBand
        id="cta-title"
        eyebrow="Business enquiries & partnerships"
        title="Interested in working with the Virex group?"
      />
    </div>
  );
}
