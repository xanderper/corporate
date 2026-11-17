import { getOrganizationBySlug } from "../repositories/org.repository";
import {
  getCompanyReports,
  createCompanyReport,
  updateReportStatus as updateReportStatusDb,
} from "../repositories/report.repository";
import { recordAuditLog } from "../repositories/audit.repository";
import { CompanyReport, ReportStatus } from "../types/models";

export interface SubmitReportInput {
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

export class ReportService {
  /**
   * Retrieves company reports for an organization slug
   */
  async getReportsForOrg(slug: string): Promise<CompanyReport[] | null> {
    const org = await getOrganizationBySlug(slug);
    if (!org) return null;
    return getCompanyReports(org.id);
  }

  /**
   * Submits a financial report for an organization
   */
  async submitReport(
    slug: string,
    input: SubmitReportInput
  ): Promise<{ success: boolean; report?: CompanyReport; error?: string }> {
    const organization = await getOrganizationBySlug(slug);
    if (!organization) {
      return { success: false, error: "Organization not found" };
    }

    if (!input.title || !input.period) {
      return { success: false, error: "Title and period are required" };
    }

    const rev = Number(input.revenue) || 0;
    const exp = Number(input.expenses) || 0;
    const calculatedEbitda =
      input.ebitda !== undefined ? Number(input.ebitda) : rev - exp;

    const report = await createCompanyReport({
      organizationId: organization.id,
      title: input.title,
      period: input.period,
      status: input.status || "SUBMITTED",
      revenue: rev,
      expenses: exp,
      ebitda: calculatedEbitda,
      cash: Number(input.cash) || 0,
      headcount: Number(input.headcount) || 0,
      majorProjects: Number(input.majorProjects) || 0,
      risksCount: Number(input.risksCount) || 0,
      notes: input.notes,
      submittedById: input.submittedById,
    });

    await recordAuditLog({
      actorId: input.submittedById || "anonymous",
      action: "report.submitted",
      targetId: report.id,
      details: {
        organization: organization.name,
        period: input.period,
        revenue: rev,
        ebitda: calculatedEbitda,
        status: report.status,
      },
    });

    return { success: true, report };
  }

  /**
   * Reviews (Approves or Rejects) a report
   */
  async reviewReport(
    reportId: string,
    status: ReportStatus,
    reviewerId: string
  ): Promise<{ success: boolean; report?: CompanyReport; error?: string }> {
    const report = await updateReportStatusDb(reportId, status, reviewerId);
    if (!report) {
      return { success: false, error: "Report not found" };
    }

    await recordAuditLog({
      actorId: reviewerId,
      action: `report.${status.toLowerCase()}`,
      targetId: reportId,
      details: {
        status,
        reviewedAt: report.reviewed_at,
      },
    });

    return { success: true, report };
  }
}

export const reportService = new ReportService();
