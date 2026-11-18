import Link from "next/link";
import { notFound } from "next/navigation";
import { SITE_URL, buildMetadata } from "../../../lib/metadata";
import { ARTICLES, fullTitle, getArticle, getRelated } from "../../../lib/insights";
import { Accent, Artwork, TextLink } from "../../../components/ui";
import { ArticleCard } from "../../../components/ArticleCard";
import { ShareLinks } from "./ShareLinks";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return { title: "Insights" };
  return buildMetadata({
    title: fullTitle(article),
    description: article.standfirst ?? article.summary,
    path: `/insights/${article.slug}`,
  });
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  return (
    <div className="w-full">
      <article>
        <header className="pb-[72px] pt-24">
          <div className="mx-auto max-w-[1040px] px-6">
            <nav aria-label="Breadcrumb" className="flex flex-wrap gap-2.5 text-[13px] text-virex-muted">
              <Link href="/insights" className="text-virex-muted hover:text-virex-deepink">
                <span className="vx-link">Insights</span>
              </Link>
              <span aria-hidden="true">/</span>
              <span>{article.category}</span>
            </nav>
            <p className="mt-14 text-xs font-semibold uppercase tracking-[0.24em] text-virex-forest">
              {article.category}
            </p>
            <h1 className="mt-6 font-serif text-[clamp(42px,5.4vw,80px)] font-light leading-[1.04] tracking-[-0.02em]">
              {article.title}
              {article.titleAccent && (
                <>
                  {" "}
                  <Accent>{article.titleAccent}</Accent>
                </>
              )}
            </h1>
            <p className="mt-9 max-w-[820px] font-serif text-2xl font-light leading-normal text-virex-body">
              {article.standfirst ?? article.summary}
            </p>
            <div className="mt-12 flex flex-wrap gap-x-10 gap-y-3 border-t border-virex-stone pt-6 text-[13px] text-virex-muted">
              <span>
                By <span className="text-virex-deepink">[Author]</span>
              </span>
              <span>[Publication date]</span>
              <span>{article.readTime}</span>
              <span className="ml-auto">Sample editorial content</span>
            </div>
          </div>
        </header>

        <figure className="container">
          <Artwork src={article.image} alt={article.alt} className="h-[clamp(280px,42vw,620px)]" />
          {article.caption && <figcaption className="mt-3.5 text-xs text-virex-muted">{article.caption}</figcaption>}
        </figure>

        <div className="mx-auto flex max-w-[1040px] flex-wrap gap-x-20 gap-y-12 px-6 pb-32 pt-24">
          <ShareLinks title={fullTitle(article)} url={`${SITE_URL}/insights/${article.slug}`} />
          <div className="vx-prose min-w-0 max-w-[680px] flex-[1_1_420px] font-serif text-[21px] font-light leading-[1.75] text-[#1f2826]">
            {article.body ? (
              article.body.map((block, i) => {
                if (block.type === "h2") {
                  return (
                    <h2 key={i} className="mb-5 mt-14 font-sans text-[22px] font-semibold leading-[1.35] text-virex-deepink">
                      {block.text}
                    </h2>
                  );
                }
                if (block.type === "quote") {
                  return (
                    <blockquote
                      key={i}
                      className="my-14 border-b border-t border-b-virex-stone border-t-virex-deepink py-10 text-[34px] italic leading-[1.3] text-virex-forest"
                    >
                      {block.text}
                    </blockquote>
                  );
                }
                return (
                  <p key={i} className="mb-7">
                    {block.text}
                  </p>
                );
              })
            ) : (
              <p className="mb-7">[Full article text — to be supplied.]</p>
            )}
            <p className="mt-10 border border-virex-stone bg-virex-white px-6 py-5 font-sans text-[13px] leading-[1.65] text-virex-muted">
              This article is sample content for design purposes. It does not constitute investment advice.
            </p>
          </div>
        </div>
      </article>

      <section aria-labelledby="rel-title" className="bg-virex-white py-[clamp(72px,9vw,128px)]">
        <div className="container">
          <div className="flex flex-wrap items-end justify-between gap-6 border-b border-virex-deepink pb-7">
            <h2 id="rel-title" className="font-serif text-4xl font-light">
              Related perspectives
            </h2>
            <TextLink href="/insights">All insights</TextLink>
          </div>
          <div className="mt-14 grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-x-10 gap-y-12">
            {getRelated(article).map((related) => (
              <ArticleCard key={related.slug} article={related} compact />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
