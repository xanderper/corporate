import { buildMetadata } from "../../lib/metadata";
import { GROUP, NUMBER_WORDS } from "../../lib/group";
import { Accent, Artwork, ButtonLink, ContactBand, Eyebrow } from "../../components/ui";

export const metadata = buildMetadata({
  title: "Our Group",
  description:
    "The Virex group consists of distinct businesses — each with its own name, leadership and market, and each owned and supported by Virex Holding for the long term.",
  path: "/group",
});

const ROLE = [
  { title: "Long-term ownership", body: "Stability to make decisions that pay off over years, not quarters." },
  { title: "Strategic direction", body: "A clear group vision that each business translates into its own plans." },
  { title: "Governance", body: "Sound oversight and shared standards across the group." },
  { title: "Shared knowledge", body: "Experience and relationships that travel between the businesses." },
];

const LETTERS = "ABCDEFGH";

export default function GroupPage() {
  return (
    <div className="w-full">
      <section aria-labelledby="gr-title" className="pt-[clamp(72px,9vw,128px)]">
        <div className="container flex flex-wrap items-end gap-x-24 gap-y-10">
          <div className="min-w-0 flex-[1_1_520px]">
            <Eyebrow className="mb-9">Our group</Eyebrow>
            <h1 id="gr-title" className="type-display">
              Distinct businesses, <Accent>one long-term vision.</Accent>
            </h1>
          </div>
          <p className="min-w-0 flex-[0_1_380px] text-[17px] leading-[1.8] text-virex-body">
            The Virex group consists of {NUMBER_WORDS[GROUP.length].toLowerCase()} businesses. Each has its own name,
            leadership and market — and each is owned and supported by Virex Holding for the long term.
          </p>
        </div>
        <div className="container mt-[clamp(56px,7vw,96px)]">
          <div className="relative">
            <Artwork
              src="/images/city-grid.svg"
              alt="Aerial view of a city grid with one block highlighted"
              className="h-[clamp(240px,32vw,460px)]"
            />
            <p className="absolute bottom-5 left-5 bg-virex-warmwhite/95 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.08em]">
              Fig. 02 — Many parts, one plan
            </p>
          </div>
        </div>
      </section>

      {/* Sticky company index, docked under the fixed site header. */}
      <nav
        aria-label="Companies on this page"
        className="sticky top-24 z-30 mt-[clamp(56px,7vw,88px)] border-y border-virex-stone bg-virex-warmwhite/95 backdrop-blur-sm"
      >
        <ol className="container flex overflow-x-auto">
          {GROUP.map((b, i) => (
            <li key={b.id} className="flex-[1_0_auto]">
              <a href={`#${b.id}`} className="group flex items-baseline gap-3.5 whitespace-nowrap py-[22px] pr-8 text-virex-deepink">
                <span className="font-mono text-[11px] text-virex-muted">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-serif text-[22px] transition-colors duration-300 group-hover:text-virex-forest">
                  {b.name}
                </span>
                <span className="text-[13px] text-virex-muted">{b.sector}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {GROUP.map((b, i) => (
        <section
          key={b.id}
          id={b.id}
          aria-labelledby={`${b.id}-title`}
          className={`section-y-sm scroll-mt-44 ${i % 2 === 0 ? "bg-virex-white" : ""} ${i > 0 && i % 2 === 0 ? "border-t border-virex-stone" : ""}`}
        >
          <div className="container flex flex-wrap gap-x-24 gap-y-12">
            <div className="min-w-0 flex-[1_1_340px]">
              <p className="font-mono text-xs uppercase tracking-[0.08em] text-virex-muted">
                {String(i + 1).padStart(2, "0")} / {b.sector}
              </p>
              <h2 id={`${b.id}-title`} className="mt-7 font-serif text-[clamp(44px,5vw,72px)] font-light leading-none">
                {b.name}
              </h2>
              <p className="mt-7 max-w-[380px] font-serif text-[22px] font-light italic leading-[1.45] text-virex-forest">
                {b.tagline}
              </p>
              {b.url ? (
                <ButtonLink href={b.url} external className="mt-10">
                  Visit {b.name}
                </ButtonLink>
              ) : (
                <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.08em] text-virex-muted">
                  [Website — to be supplied]
                </p>
              )}
            </div>
            <div className="min-w-0 flex-[1.4_1_480px]">
              <Artwork src={b.image} alt={b.alt} className={`aspect-video ${i === 0 ? "bg-virex-warmstone" : ""}`} />
              <p className="mt-10 text-[17px] leading-[1.8] text-virex-body">{b.description}</p>
              <ul className="mt-10 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-x-8 border-t border-virex-deepink">
                {b.focus.map((item, j) => (
                  <li key={item} className="border-b border-virex-stone py-5 text-[15px]">
                    <span className="mr-3 font-mono text-[11px] text-virex-muted">{LETTERS[j]}</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ))}

      <section aria-labelledby="role-title" className="section-y bg-virex-deepink text-virex-warmwhite">
        <div className="container">
          <div className="flex flex-wrap items-end justify-between gap-x-24 gap-y-6">
            <div className="min-w-0 flex-[1_1_520px]">
              <Eyebrow tone="dark">The role of the holding</Eyebrow>
              <h2 id="role-title" className="type-h2">
                Independent businesses, <Accent tone="dark">a shared foundation.</Accent>
              </h2>
            </div>
            <p className="flex-[0_1_380px] text-base leading-[1.75] text-virex-stone">
              What Virex Holding contributes, so each business can focus on its own customers and markets.
            </p>
          </div>
          <div className="mt-20 grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-12">
            {ROLE.map((r, i) => (
              <div key={r.title} className="border-t border-virex-sage/40 pt-7">
                <p className="mb-6 font-mono text-[11px] text-virex-signal">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mb-3 text-lg font-semibold">{r.title}</h3>
                <p className="text-[15px] leading-[1.75] text-virex-stone">{r.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ContactBand id="cta-title" title="A question for the group, or a partnership in mind?" />
    </div>
  );
}
