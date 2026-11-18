/**
 * Offices shown on /contact. Add or remove an entry here: each one renders an
 * office card and an option in the form's "Preferred office" field.
 * Replace the bracketed placeholders with approved details before launch.
 */
export interface Office {
  id: string;
  city: string;
  country: string;
  address: string;
  contact: string;
  image: string;
  imagePosition: string;
  alt: string;
  mapsQuery?: string;
}

export const OFFICES: Office[] = [
  {
    id: "amsterdam",
    city: "Amsterdam",
    country: "Netherlands",
    address: "By appointment\nAmsterdam, Netherlands",
    contact: "contact@virexcapital.com\nVisits scheduled on request",
    image: "/images/amsterdam.svg",
    imagePosition: "50% 60%",
    alt: "Illustration of Amsterdam canal houses along the water",
  },
  {
    id: "utrecht",
    city: "Utrecht",
    country: "Netherlands",
    address: "By appointment\nUtrecht, Netherlands",
    contact: "contact@virexcapital.com\nVisits scheduled on request",
    image: "/images/utrecht.svg",
    imagePosition: "50% 0%",
    alt: "Illustration of the Dom tower in Utrecht above the canal wharves",
  },
];
