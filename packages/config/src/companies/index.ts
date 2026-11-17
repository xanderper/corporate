import { xiConfig } from "./xi-holding/config";
import { ptConfig } from "./pt-holding/config";
import { djConfig } from "./dj-holding/config";
import { dylanConfig } from "./dylan-holding/config";
import { CompanyConfig } from "./types";
import { getCompanyFromDomain } from "../domains";

export const COMPANIES: Record<string, CompanyConfig> = {
  "xi-holding": xiConfig,
  "pt-holding": ptConfig,
  "dj-holding": djConfig,
  "dylan-holding": dylanConfig,
};

export function getCompanyConfig(domain: string): CompanyConfig {
  const companyId = getCompanyFromDomain(domain);
  return COMPANIES[companyId] || xiConfig;
}
