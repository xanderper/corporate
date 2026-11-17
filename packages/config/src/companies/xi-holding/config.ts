import { CompanyConfig } from "../types";

export const xiConfig: CompanyConfig = {
  id: "xi-holding",
  legalName: "X&I Holding B.V.",
  shortName: "X&I HOLDING",
  domain: "xiholding.nl",
  description: "A privately held Dutch holding company focused on long-term ownership and the development of business interests.",
  type: "holding",
  address: {
    street: "Straatnaam 1",
    postalCode: "1234 AB",
    city: "Amsterdam",
    country: "The Netherlands",
  },
  kvk: "[KVK number]",
  founded: "2023",
  email: "contact@xiholding.nl",
  portfolio: [
    {
      name: "Company A",
      sector: "Technology",
    },
    {
      name: "Company B",
      sector: "Real Estate",
    }
  ]
};
