/**
 * The businesses of the Virex group, as presented on virex.group.
 * Bracketed text awaits approved copy from each company.
 */
export interface GroupBusiness {
  id: string;
  name: string;
  sector: string;
  /** Short label for quick links and tabs. */
  shortSector: string;
  summary: string;
  tagline: string;
  description: string;
  focus: string[];
  /** Line shown in the contact directory. */
  contactLine: string;
  url?: string;
  image: string;
  alt: string;
}

export const GROUP: GroupBusiness[] = [
  {
    id: "capital",
    name: "Virex Capital",
    sector: "Investments",
    shortSector: "Investments",
    summary: "Investment activities, participations and capital strategy for the group.",
    tagline: "Strategic investment and long-term value creation.",
    description:
      "Virex Capital is the investment company of the Virex group. It is responsible for the group’s investment activities and participations, and for allocating capital with a long-term perspective.",
    focus: ["Investment activities", "Participations", "Capital strategy"],
    contactLine: "Investments, participations and partnership enquiries",
    url: "https://virexcapital.com",
    image: "/images/colonnade.svg",
    alt: "Colonnade with long afternoon shadows",
  },
  {
    id: "qorve",
    name: "Qorve",
    sector: "Fintech",
    shortSector: "Fintech & payments",
    summary: "Financial technology and payment infrastructure for modern businesses.",
    tagline: "Financial technology and payment infrastructure.",
    description:
      "Qorve operates in fintech and payment infrastructure. It develops the technology that allows businesses to process payments and manage financial flows. [Further company description to be supplied by Qorve.]",
    focus: ["Fintech", "Payment infrastructure"],
    contactLine: "Fintech and payment infrastructure",
    url: "https://qorve.com",
    image: "/images/bridge.svg",
    alt: "Cable-stayed bridge over still water at dawn",
  },
  {
    id: "dovelle",
    name: "Dovelle",
    sector: "Hospitality software",
    shortSector: "Hospitality software",
    summary: "Booking and hospitality software for businesses that welcome guests.",
    tagline: "Booking and hospitality software.",
    description:
      "Dovelle develops booking and hospitality software for businesses that welcome guests, helping them manage bookings and the guest experience. [Further company description to be supplied by Dovelle.]",
    focus: ["Booking software", "Hospitality software"],
    contactLine: "Booking and hospitality software",
    // url: "[Dovelle website — to be supplied]",
    image: "/images/spiral.svg",
    alt: "Concentric ramps of a spiral atrium seen from above",
  },
];

export const NUMBER_WORDS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six"];
