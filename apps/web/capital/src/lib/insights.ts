/**
 * Insights — SAMPLE editorial content shown to illustrate the publication
 * format. Replace with approved articles before publishing.
 */

export const IMAGES = {
  tower: "/images/tower.svg",
  facade: "/images/facade.svg",
  colonnade: "/images/colonnade.svg",
  skyline: "/images/skyline.svg",
  bridge: "/images/bridge.svg",
  spiral: "/images/spiral.svg",
} as const;

export const CATEGORIES = [
  "Investment Perspectives",
  "Market Insights",
  "Entrepreneurship",
  "Technology & Innovation",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type ArticleBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "quote"; text: string };

export interface Article {
  slug: string;
  category: Category;
  title: string;
  /** Title split so the tail can be set in the italic accent. */
  titleAccent?: string;
  summary: string;
  standfirst?: string;
  readTime: string;
  image: string;
  alt: string;
  caption?: string;
  body?: ArticleBlock[];
}

export const ARTICLES: Article[] = [
  {
    slug: "patience-as-an-investment-discipline",
    category: "Investment Perspectives",
    title: "On patience as an",
    titleAccent: "investment discipline",
    summary: "Why holding periods, not entry points, often decide the outcome of an investment.",
    standfirst:
      "Why holding periods, not entry points, often decide the outcome of an investment — and what that means for how we work with the businesses we back.",
    readTime: "8 min read",
    image: IMAGES.skyline,
    alt: "Layered European city skyline in morning haze",
    caption: "Cities, like businesses, are built over decades.",
    body: [
      {
        type: "p",
        text: "Much of the conversation about investing focuses on the moment of entry: the valuation paid, the timing, the terms. These matter. But over long periods, the decisive factor is often what happens afterwards — how patiently a position is held, and how thoughtfully the owner behaves while holding it.",
      },
      {
        type: "p",
        text: "Good businesses compound. They reinvest, improve and widen their advantages, frequently in ways that are invisible from one quarter to the next. An investor who demands visible progress on a short timetable can end up interrupting the very process that creates value.",
      },
      { type: "h2", text: "Patience is not passivity" },
      {
        type: "p",
        text: "Patience is sometimes mistaken for inactivity. In practice it demands more work, not less: a clear understanding of why a position is held, regular and honest review, and the discipline to act when the original reasons no longer apply.",
      },
      { type: "quote", text: "The most valuable decision is often the one not to act." },
      {
        type: "p",
        text: "For private businesses, this means giving management the room and stability to execute on a long-term plan. For listed equities, it means looking through short-term price movements towards the fundamentals that drive value over years.",
      },
      { type: "h2", text: "What this means in practice" },
      {
        type: "p",
        text: "We choose fewer positions and know them well. We agree on direction with the businesses we partner with, and we measure progress against that direction rather than against the market’s mood. Patience, practised this way, is a competitive advantage that cannot easily be copied.",
      },
    ],
  },
  {
    slug: "infrastructure-quiet-engine-of-digital-growth",
    category: "Market Insights",
    title: "Infrastructure as the quiet engine of digital growth",
    summary: "How the physical layer beneath digital services shapes long-term opportunity.",
    readTime: "7 min read",
    image: IMAGES.bridge,
    alt: "Cable-stayed bridge over still water at dawn",
  },
  {
    slug: "what-founders-should-expect-from-a-long-term-partner",
    category: "Entrepreneurship",
    title: "What founders should expect from a long-term partner",
    summary: "Alignment, involvement and the conversations worth having before capital is committed.",
    readTime: "6 min read",
    image: IMAGES.spiral,
    alt: "Concentric ramps of a spiral structure seen from above",
  },
  {
    slug: "private-and-public-one-discipline-two-markets",
    category: "Investment Perspectives",
    title: "Private and public: one discipline, two markets",
    summary: "Why we apply the same fundamental questions to listed equities and private businesses.",
    readTime: "9 min read",
    image: IMAGES.facade,
    alt: "Recessed windows in a pale concrete facade",
  },
  {
    slug: "durable-advantage-vs-early-momentum",
    category: "Technology & Innovation",
    title: "Separating durable advantage from early momentum",
    summary: "A framework for judging which technology businesses can defend their position over time.",
    readTime: "8 min read",
    image: IMAGES.tower,
    alt: "Vertical fins of an office tower at dusk",
  },
  {
    slug: "reading-markets-without-being-ruled-by-them",
    category: "Market Insights",
    title: "Reading markets without being ruled by them",
    summary: "On volatility, conviction and the discipline of not acting.",
    readTime: "5 min read",
    image: IMAGES.colonnade,
    alt: "Colonnade with long afternoon shadows",
  },
  {
    slug: "succession-and-growth-for-family-businesses",
    category: "Entrepreneurship",
    title: "The next chapter: succession and growth for family businesses",
    summary: "What owners weigh when bringing in a partner, and how to keep what matters.",
    readTime: "7 min read",
    image: IMAGES.skyline,
    alt: "European city skyline in morning haze",
  },
];

export function fullTitle(article: Article) {
  return article.titleAccent ? `${article.title} ${article.titleAccent}` : article.title;
}

export function getArticle(slug: string) {
  return ARTICLES.find((a) => a.slug === slug);
}

export function getRelated(article: Article, count = 3) {
  return ARTICLES.filter((a) => a.slug !== article.slug).slice(2, 2 + count);
}
