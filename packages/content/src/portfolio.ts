export type PortfolioMarket = "Private markets" | "Public markets";

export type PortfolioType =
  | "Growth Investment"
  | "Venture Capital"
  | "Private Investment"
  | "Strategic Partnership"
  | "Long-term Holding";

export interface Company {
  id: string;
  name: string;
  market: PortfolioMarket;
  sector: string;
  geography: string[];
  type: PortfolioType;
  description: string;
  virexPosition: string;
  isDemo: boolean;
}

export const PORTFOLIO_MARKETS: {
  market: PortfolioMarket;
  subtitle: string;
  description: string;
}[] = [
  {
    market: "Private markets",
    subtitle: "Investing in businesses",
    description:
      "Direct growth investments, venture partnerships, and strategic collaborations with ambitious private businesses.",
  },
  {
    market: "Public markets",
    subtitle: "Investing in listed equities",
    description:
      "Long-term positions in high-quality, publicly listed global leaders selected through fundamental research.",
  },
];

export const PORTFOLIO_GROUPS: PortfolioType[] = [
  "Growth Investment",
  "Venture Capital",
  "Private Investment",
  "Strategic Partnership",
  "Long-term Holding",
];

export const PORTFOLIO: Company[] = [
  // Private markets
  {
    id: "nordhaven-technologies",
    name: "Nordhaven Technologies",
    market: "Private markets",
    sector: "Enterprise Software",
    geography: ["Nordics", "Europe"],
    type: "Growth Investment",
    description:
      "Mission-critical workflow and compliance software for mid-market industrial and financial enterprises across Northern Europe.",
    virexPosition:
      "Growth equity partner supporting product expansion, international go-to-market, and disciplined M&A.",
    isDemo: false,
  },
  {
    id: "avelon-systems",
    name: "Avelon Systems",
    market: "Private markets",
    sector: "Cybersecurity",
    geography: ["Benelux", "DACH"],
    type: "Venture Capital",
    description:
      "Zero-trust network defense and automated threat-detection platform protecting critical enterprise infrastructure.",
    virexPosition:
      "Early venture backer working alongside the founding team on enterprise adoption and security architecture.",
    isDemo: false,
  },
  {
    id: "meridia-logistics",
    name: "Meridia Logistics",
    market: "Private markets",
    sector: "Logistics & Supply Chain",
    geography: ["Benelux", "Germany"],
    type: "Private Investment",
    description:
      "Integrated European freight forwarding, warehousing, and cold-chain distribution network.",
    virexPosition:
      "Long-term private capital partner focused on operational resilience, route optimization, and hub expansion.",
    isDemo: false,
  },
  {
    id: "noventra-energy",
    name: "Noventra Energy",
    market: "Private markets",
    sector: "Renewable Energy",
    geography: ["Scandinavia", "UK"],
    type: "Growth Investment",
    description:
      "Developer and operator of utility-scale renewable generation and grid-balancing storage assets.",
    virexPosition:
      "Growth investment supporting project pipeline development and long-term industrial power purchase agreements.",
    isDemo: false,
  },
  {
    id: "calder-and-co",
    name: "Calder & Co.",
    market: "Private markets",
    sector: "Financial Technology",
    geography: ["UK", "Europe"],
    type: "Strategic Partnership",
    description:
      "Institutional treasury, liquidity management, and cross-border settlement infrastructure for corporate finance teams.",
    virexPosition:
      "Strategic partner contributing capital, regulatory perspective, and institutional network access.",
    isDemo: false,
  },
  {
    id: "ardent-robotics",
    name: "Ardent Robotics",
    market: "Private markets",
    sector: "Industrial Automation",
    geography: ["DACH", "Benelux"],
    type: "Venture Capital",
    description:
      "Autonomous mobile robotics and vision-guided assembly systems for precision manufacturing.",
    virexPosition:
      "Venture investor backing hardware-software integration and commercial deployment across European plants.",
    isDemo: false,
  },
  {
    id: "solvanta-health",
    name: "Solvanta Health",
    market: "Private markets",
    sector: "Healthcare Technology",
    geography: ["Europe"],
    type: "Growth Investment",
    description:
      "Clinical data interoperability and diagnostic workflow software serving hospitals and specialist clinics.",
    virexPosition:
      "Growth partner supporting clinical validation, regulatory compliance, and cross-border rollout.",
    isDemo: false,
  },
  {
    id: "westbridge-developments",
    name: "Westbridge Developments",
    market: "Private markets",
    sector: "Real Estate",
    geography: ["Benelux", "UK"],
    type: "Private Investment",
    description:
      "Sustainable commercial and mixed-use urban developments focused on energy-positive building standards.",
    virexPosition:
      "Private capital partner backing selective, long-horizon urban regeneration and logistics real estate.",
    isDemo: false,
  },
  {
    id: "orvian-data",
    name: "Orvian Data",
    market: "Private markets",
    sector: "Data Infrastructure",
    geography: ["Europe", "North America"],
    type: "Venture Capital",
    description:
      "High-throughput data pipeline, governance, and analytical storage infrastructure for regulated industries.",
    virexPosition:
      "Venture capital partner advising on enterprise positioning and strategic commercial partnerships.",
    isDemo: false,
  },
  {
    id: "bellmont-industries",
    name: "Bellmont Industries",
    market: "Private markets",
    sector: "Industrial Manufacturing",
    geography: ["DACH", "Benelux"],
    type: "Strategic Partnership",
    description:
      "Precision-engineered components and specialized industrial equipment for European infrastructure and mobility.",
    virexPosition:
      "Strategic partner supporting succession, manufacturing modernization, and long-term capital allocation.",
    isDemo: false,
  },

  // Public markets
  {
    id: "microsoft",
    name: "Microsoft",
    market: "Public markets",
    sector: "Technology",
    geography: ["Global"],
    type: "Long-term Holding",
    description:
      "Global leader in enterprise cloud infrastructure, productivity software, and foundational AI platforms.",
    virexPosition:
      "Long-term listed equity holding anchored by durable enterprise cash flows and platform ecosystem strength.",
    isDemo: false,
  },
  {
    id: "asml",
    name: "ASML",
    market: "Public markets",
    sector: "Semiconductor Equipment",
    geography: ["Global"],
    type: "Long-term Holding",
    description:
      "Sole global supplier of extreme ultraviolet (EUV) lithography systems essential to advanced semiconductor manufacturing.",
    virexPosition:
      "Long-term listed equity holding backed by irreplaceable technological moat and secular compute demand.",
    isDemo: false,
  },
  {
    id: "berkshire-hathaway",
    name: "Berkshire Hathaway",
    market: "Public markets",
    sector: "Financials",
    geography: ["North America", "Global"],
    type: "Long-term Holding",
    description:
      "Diversified holding company spanning insurance, rail, energy, manufacturing, and disciplined capital allocation.",
    virexPosition:
      "Long-term listed equity holding aligned with permanent capital principles and conservative balance-sheet strength.",
    isDemo: false,
  },
  {
    id: "schneider-electric",
    name: "Schneider Electric",
    market: "Public markets",
    sector: "Energy Management",
    geography: ["Global"],
    type: "Long-term Holding",
    description:
      "Global specialist in energy management, industrial automation, and grid electrification infrastructure.",
    virexPosition:
      "Long-term listed equity holding positioned for structural electrification and industrial efficiency.",
    isDemo: false,
  },
  {
    id: "novo-nordisk",
    name: "Novo Nordisk",
    market: "Public markets",
    sector: "Healthcare",
    geography: ["Global"],
    type: "Long-term Holding",
    description:
      "Global healthcare company leading innovation in metabolic, diabetes, and chronic disease therapies.",
    virexPosition:
      "Long-term listed equity holding supported by deep R&D execution and global therapeutic demand.",
    isDemo: false,
  },
  {
    id: "alphabet",
    name: "Alphabet",
    market: "Public markets",
    sector: "Technology",
    geography: ["Global"],
    type: "Long-term Holding",
    description:
      "Technology leader across digital information, cloud computing, and foundational artificial intelligence research.",
    virexPosition:
      "Long-term listed equity holding grounded in core search economics, cloud scale, and balance-sheet optionality.",
    isDemo: false,
  },
  {
    id: "lvmh",
    name: "LVMH",
    market: "Public markets",
    sector: "Luxury Goods",
    geography: ["Global"],
    type: "Long-term Holding",
    description:
      "World's leading luxury group stewarding heritage maisons across fashion, leather goods, watches, and wines.",
    virexPosition:
      "Long-term listed equity holding driven by brand permanence, pricing power, and family-stewarded governance.",
    isDemo: false,
  },
  {
    id: "siemens",
    name: "Siemens",
    market: "Public markets",
    sector: "Industrial Technology",
    geography: ["Global"],
    type: "Long-term Holding",
    description:
      "Industrial technology leader focusing on factory automation, digital industries, smart infrastructure, and mobility.",
    virexPosition:
      "Long-term listed equity holding reflecting Europe's industrial software and electrification backbone.",
    isDemo: false,
  },
  {
    id: "visa",
    name: "Visa",
    market: "Public markets",
    sector: "Financial Technology",
    geography: ["Global"],
    type: "Long-term Holding",
    description:
      "Global digital payments network connecting consumers, merchants, financial institutions, and governments.",
    virexPosition:
      "Long-term listed equity holding benefiting from global payment digitization and high-margin network effects.",
    isDemo: false,
  },
  {
    id: "relx",
    name: "RELX",
    market: "Public markets",
    sector: "Information Services",
    geography: ["Global"],
    type: "Long-term Holding",
    description:
      "Global provider of information-based analytics and decision tools for scientific, legal, and risk professionals.",
    virexPosition:
      "Long-term listed equity holding with recurring subscription revenues and embedded workflow data assets.",
    isDemo: false,
  },
];

export function getByMarket(market: PortfolioMarket): Company[] {
  return PORTFOLIO.filter((company) => company.market === market);
}

export function getByType(type: PortfolioType): Company[] {
  return PORTFOLIO.filter((company) => company.type === type);
}

export function getRelatedInvestments(id: string): Company[] {
  const current = PORTFOLIO.find((c) => c.id === id);
  if (!current) return [];

  return PORTFOLIO.filter(
    (c) => c.id !== id && (c.market === current.market || c.sector === current.sector)
  ).slice(0, 3);
}
