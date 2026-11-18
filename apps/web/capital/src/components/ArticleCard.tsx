import Link from "next/link";
import { Arrow, Artwork } from "./ui";
import { fullTitle, type Article } from "../lib/insights";

export function ArticleCard({
  article,
  aspect = "aspect-[3/2]",
  compact = false,
}: {
  article: Article;
  aspect?: string;
  /** Related-articles variant: category + title only. */
  compact?: boolean;
}) {
  return (
    <article className="vx-card">
      <Link href={`/insights/${article.slug}`} className="block text-virex-deepink">
        <Artwork src={article.image} alt={article.alt} className={aspect} zoom />
        {compact ? (
          <>
            <p className="mt-[22px] text-xs uppercase tracking-[0.14em] text-virex-muted">{article.category}</p>
            <h3 className="mt-3 font-serif text-2xl leading-[1.25]">{fullTitle(article)}</h3>
          </>
        ) : (
          <>
            <p className="mt-6 flex justify-between gap-4 text-xs uppercase tracking-[0.14em] text-virex-muted">
              <span>{article.category}</span>
              <span className="normal-case tracking-[0.04em]">{article.readTime}</span>
            </p>
            <h3 className="mb-3 mt-3.5 font-serif text-[25px] leading-[1.25]">{fullTitle(article)}</h3>
            <p className="text-[15px] leading-[1.7] text-virex-muted">{article.summary}</p>
            <p className="mt-5 text-sm font-semibold text-virex-forest">
              <span className="vx-link">Read article</span> <Arrow />
            </p>
          </>
        )}
      </Link>
    </article>
  );
}
