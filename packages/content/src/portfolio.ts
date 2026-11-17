export type PortfolioType = "Direct Ownership" | "Majority Investment" | "Minority Investment" | "Venture";

export interface Company {
  id: string;
  name: string;
  sector: string;
  ownership: number;
  geography: string[];
  type: PortfolioType;
  description: string;
  isDemo: boolean;
}

export const PORTFOLIO_GROUPS: PortfolioType[] = [
  "Direct Ownership",
  "Majority Investment",
  "Minority Investment",
  "Venture",
];

export const PORTFOLIO: Company[] = [
  {
    id: "horizon-logistics",
    name: "Horizon Logistics",
    sector: "Infrastructure",
    ownership: 100,
    geography: ["Benelux", "Germany"],
    type: "Direct Ownership",
    description: "A leading cold-chain logistics provider serving the pharmaceutical and high-value food sectors across Northern Europe.",
    isDemo: true,
  },
  {
    id: "aero-systems",
    name: "Aero Systems Engineering",
    sector: "Technology",
    ownership: 65,
    geography: ["UK", "France"],
    type: "Majority Investment",
    description: "Specialized manufacturer of advanced telemetry systems for civil aviation.",
    isDemo: true,
  },
  {
    id: "lumina-energy",
    name: "Lumina Energy",
    sector: "Infrastructure",
    ownership: 15,
    geography: ["Scandinavia"],
    type: "Minority Investment",
    description: "Grid-scale battery storage operator focusing on frequency response markets.",
    isDemo: true,
  },
  {
    id: "vertex-ai",
    name: "Vertex Analytics",
    sector: "Technology",
    ownership: 25,
    geography: ["DACH"],
    type: "Venture",
    description: "Industrial AI platform optimizing manufacturing throughput for heavy industry.",
    isDemo: true,
  },
];

export function getByType(type: PortfolioType): Company[] {
  return PORTFOLIO.filter((company) => company.type === type);
}

export function getRelatedInvestments(id: string): Company[] {
  const current = PORTFOLIO.find((c) => c.id === id);
  if (!current) return [];
  
  return PORTFOLIO.filter(
    (c) => c.id !== id && (c.sector === current.sector || c.type === current.type)
  ).slice(0, 3);
}
