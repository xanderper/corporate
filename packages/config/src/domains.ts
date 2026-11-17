export const DOMAINS: Record<string, string> = {
  // Production domains
  "xiholding.nl": "xi-holding",
  "ptholding.nl": "pt-holding",
  "djholding.nl": "dj-holding",
  "dylanholding.nl": "dylan-holding",
  
  // Local development aliases (port 3200)
  "xiholding.localhost:3200": "xi-holding",
  "ptholding.localhost:3200": "pt-holding",
  "djholding.localhost:3200": "dj-holding",
  "dylanholding.localhost:3200": "dylan-holding",

  "xi.localhost:3200": "xi-holding",
  "pt.localhost:3200": "pt-holding",
  "dj.localhost:3200": "dj-holding",
  "dylan.localhost:3200": "dylan-holding",

  // Legacy local development aliases (port 3100)
  "xiholding.localhost:3100": "xi-holding",
  "ptholding.localhost:3100": "pt-holding",
  "djholding.localhost:3100": "dj-holding",
  "dylanholding.localhost:3100": "dylan-holding",

  "xi.localhost:3100": "xi-holding",
  "pt.localhost:3100": "pt-holding",
  "dj.localhost:3100": "dj-holding",
  "dylan.localhost:3100": "dylan-holding",

  // Legacy local development aliases (port 3002)
  "xiholding.localhost:3002": "xi-holding",
  "ptholding.localhost:3002": "pt-holding",
  "djholding.localhost:3002": "dj-holding",
  "dylanholding.localhost:3002": "dylan-holding",

  // For testing convenience
  "xi.localhost:3002": "xi-holding",
  "pt.localhost:3002": "pt-holding",
  "dj.localhost:3002": "dj-holding",
  "dylan.localhost:3002": "dylan-holding",
};

export function getCompanyFromDomain(domain: string): string {
  // Default to xi-holding if not found, or maybe a 404 handler
  return DOMAINS[domain] || "xi-holding";
}
