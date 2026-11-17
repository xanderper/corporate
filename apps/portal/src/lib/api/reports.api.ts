import { request } from "./client";
import { CompanyReport, ReportStatus } from "./types";

export interface SubmitReportPayload {
  title: string;
  period: string;
  status?: ReportStatus;
  revenue?: number;
  expenses?: number;
  ebitda?: number;
  cash?: number;
  headcount?: number;
  majorProjects?: number;
  risksCount?: number;
  notes?: string;
  submittedById?: string;
}

export const reportsApi = {
  async list(slug: string): Promise<{ reports: CompanyReport[] }> {
    return request<{ reports: CompanyReport[] }>(
      `organizations/${slug}/reports`,
      {
        method: "GET",
      }
    );
  },

  async submit(
    slug: string,
    payload: SubmitReportPayload
  ): Promise<{ success: boolean; report: CompanyReport }> {
    return request<{ success: boolean; report: CompanyReport }>(
      `organizations/${slug}/reports`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  },

  async review(
    slug: string,
    reportId: string,
    status: "APPROVED" | "REJECTED",
    reviewerId: string
  ): Promise<{ success: boolean; report: CompanyReport }> {
    return request<{ success: boolean; report: CompanyReport }>(
      `organizations/${slug}/reports/${reportId}/review`,
      {
        method: "POST",
        body: JSON.stringify({ status, reviewerId }),
      }
    );
  },
};
