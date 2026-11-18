import Link from "next/link";
import { buildMetadata } from "../../lib/metadata";
import { ARTICLES, fullTitle } from "../../lib/insights";
import { Accent, Arrow, Artwork, Eyebrow, PlaceholderBadge } from "../../components/ui";
import { InsightsList } from "./InsightsList";

export const metadata = buildMetadata({
  title: "Insights",
  description: "Considered writing on investing, markets and building businesses for the long term.",
  path: "/insights",
});

export default function InsightsPage() {
  const [featured, ...rest] = ARTICLES;

  return (
    <div className="w-full">
      <section aria-labelledby="in-title" className="pb-[72px] pt-[clamp(72px,9vw,128px)]">
        <div className="container flex flex-wrap items-end gap-x-24 gap-y-10">
          <div className="min-w-0 flex-[1_1_480px]">
            <Eyebrow className="mb-9">Insights</Eyebrow>
            <h1 id="in-title" className="type-display">
              Perspectives on capital, business and <Accent>innovation.</Accent>
            </h1>
          </div>
          <p className="min-w-0 flex-[0_1_360px] text-base leading-[1.8] text-virex-muted">
            Considered writing on investing, markets and building businesses for the long term.
          </p>
        </div>
        <div className="container mt-12">
          <PlaceholderBadge>Sample editorial content — replace before publishing</PlaceholderBadge>
        </div>
      </section>

      <section aria-label="Featured article" className="pb-[120px]">
        <div className="container">
          <Link
            href={`/insights/${featured.slug}`}
            className="vx-card flex flex-wrap border border-virex-stone bg-virex-white text-virex-deepink"
          >
            <Artwork src={featured.image} alt={featured.alt} className="min-h-[340px] min-w-0 flex-[3_1_440px]" zoom />
            <div className="flex min-w-0 flex-[2_1_340px] flex-col gap-5 p-[clamp(28px,4.5vw,56px)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-virex-forest">
                Featured · {featured.category}
              </p>
              <h2 className="mt-2 font-serif text-[42px] font-light leading-[1.12] tracking-[-0.01em]">
                {fullTitle(featured)}
              </h2>
              <p className="text-base leading-[1.8] text-virex-muted">{featured.standfirst ?? featured.summary}</p>
              <p className="mt-auto flex flex-wrap gap-x-6 gap-y-2 pt-8 text-[13px] text-virex-muted">
                <span>[Publication date]</span>
                <span>{featured.readTime}</span>
              </p>
              <p className="text-sm font-semibold text-virex-forest">
                <span className="vx-link">Read article</span> <Arrow />
              </p>
            </div>
          </Link>
        </div>
      </section>

      <InsightsList articles={rest} />
    </div>
  );
}
