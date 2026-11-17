export interface PortfolioCompany {
  name: string;
  sector: string;
}

export interface CompanyConfig {
  id: string;
  legalName: string;
  domain: string;
  shortName: string;
  description: string;
  type: 'group' | 'capital' | 'holding';
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  kvk?: string;
  vat?: string;
  founded?: string;
  email?: string;
  portfolio?: PortfolioCompany[];
}
