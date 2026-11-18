"use client";

import { useState } from "react";
import { ArticleCard } from "../../components/ArticleCard";
import { CATEGORIES, type Article } from "../../lib/insights";

const FILTERS = ["All", ...CATEGORIES] as const;
type Filter = (typeof FILTERS)[number];

export function InsightsList({ articles }: { articles: Article[] }) {
  const [current, setCurrent] = useState<Filter>("All");
  const list = current === "All" ? articles : articles.filter((a) => a.category === current);
  const count = `${list.length} ${list.length === 1 ? "article" : "articles"}${current === "All" ? "" : ` in ${current}`}`;

  return (
    <section aria-labelledby="latest-title" className="pb-40">
      <div className="container">
        <div className="flex flex-wrap items-center justify-between gap-x-12 gap-y-6 border-b border-virex-deepink pb-7">
          <h2 id="latest-title" className="font-serif text-[32px] font-light">
            Latest
          </h2>
          <div role="group" aria-label="Filter by category" className="flex max-w-full gap-2 overflow-x-auto pb-1">
            {FILTERS.map((filter) => {
              const active = filter === current;
              return (
                <button
                  key={filter}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCurrent(filter)}
                  className={`min-h-10 flex-none whitespace-nowrap border px-4 text-[13px] font-medium transition-colors duration-200 ${
                    active
                      ? "border-virex-forest bg-virex-forest text-virex-warmwhite"
                      : "border-virex-stone text-virex-body hover:border-virex-forest"
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        </div>
        <p aria-live="polite" className="mt-5 text-[13px] text-virex-muted">
          {count}
        </p>
        <div className="mt-10 grid grid-cols-[repeat(auto-fill,minmax(min(320px,100%),1fr))] gap-x-10 gap-y-16">
          {list.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      </div>
    </section>
  );
}
