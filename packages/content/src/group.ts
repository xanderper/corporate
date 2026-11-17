export interface GroupCompany {
  id: string;
  name: string;
  description: string;
  descriptor: string;
  overview: string;
  ownership: number;
  url: string;
  coOwner?: string;
  coOwnerPercentage?: number;
}

export const GROUP_COMPANIES: GroupCompany[] = [
  {
    id: "virex-capital",
    name: "Virex Capital B.V.",
    description: "The dedicated investment and capital allocation arm of the group, focused on long-term ownership of cash-generative businesses.",
    descriptor: "Investment Group",
    overview: "Virex Capital acts as the investment and operating group, managing a proprietary portfolio of businesses, infrastructure, and strategic real assets to compound capital across generations.",
    ownership: 100,
    url: "https://virexcapital.com",
  },
  {
    id: "qorve",
    name: "Qorve Holding B.V.",
    description: "A specialized financial infrastructure platform providing core systems for European institutions.",
    descriptor: "Financial Infrastructure",
    overview: "Qorve builds the underlying technology and frameworks required for next-generation financial services, bridging the gap between traditional banking primitives and modern technological capabilities.",
    ownership: 51,
    url: "https://qorve.com",

    coOwner: "Other investors",
    coOwnerPercentage: 49,
  },
  {
    id: "northgrid",
    name: "Northgrid Holding B.V.",
    description: "Digital infrastructure and critical cloud networking operator across the Nordic and Benelux regions.",
    descriptor: "Digital Infrastructure",
    overview: "Northgrid develops and manages critical digital infrastructure components necessary for institutional technology scale, ensuring unparalleled uptime, security, and computational reliability.",
    ownership: 51,
    url: "https://northgrid.eu",

    coOwner: "Qorve Holding B.V.",
    coOwnerPercentage: 49,

  },
];
