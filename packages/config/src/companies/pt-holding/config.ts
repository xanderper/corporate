import { CompanyConfig } from "../types";

export const ptConfig: CompanyConfig = {
  id: "pt-holding",
  legalName: "P&T Holding B.V.",
  shortName: "P&T HOLDING",
  domain: "ptholding.nl",
  description: "A private investment and holding company managing participations and assets for the long term.",
  type: "holding",
  address: {
    street: "Straatnaam 1",
    postalCode: "1234 AB",
    city: "Amsterdam",
    country: "The Netherlands",
  },
  kvk: "[KVK number]",
  founded: "2023",
  email: "contact@ptholding.nl",
};
