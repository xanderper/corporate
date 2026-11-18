import type { MetadataRoute } from "next";
import { PORTFOLIO } from "@virex/content";
import { ARTICLES } from "../lib/insights";
import { SITE_URL } from "../lib/metadata";

type Entry = [path: string, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"], priority: number];

const PAGES: Entry[] = [
  ["/", "yearly", 1],
  ["/about", "monthly", 0.8],
  ["/strategy", "monthly", 0.8],
  ["/portfolio", "monthly", 0.9],
  ["/insights", "weekly", 0.7],
  ["/contact", "yearly", 0.5],
  ["/legal", "yearly", 0.3],
  ["/privacy", "yearly", 0.3],
  ["/terms", "yearly", 0.3],
  ["/cookies", "yearly", 0.3],
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    ...PAGES.map(([path, changeFrequency, priority]) => ({
      url: `${SITE_URL}${path}`,
      lastModified,
      changeFrequency,
      priority,
    })),
    ...PORTFOLIO.map((c) => ({
      url: `${SITE_URL}/portfolio/${c.id}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...ARTICLES.map((a) => ({
      url: `${SITE_URL}/insights/${a.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
