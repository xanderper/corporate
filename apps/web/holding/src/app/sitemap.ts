import type { MetadataRoute } from "next";
import { SITE_URL } from "../lib/metadata";

type Entry = [path: string, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"], priority: number];

const PAGES: Entry[] = [
  ["/", "yearly", 1],
  ["/group", "monthly", 0.9],
  ["/about", "monthly", 0.8],
  ["/contact", "yearly", 0.5],
  ["/legal", "yearly", 0.3],
  ["/privacy", "yearly", 0.3],
  ["/terms", "yearly", 0.3],
  ["/cookies", "yearly", 0.3],
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return PAGES.map(([path, changeFrequency, priority]) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
