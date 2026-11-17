import { pool, generateId } from "../core/database";
import { CompanyReport, ReportStatus } from "../types/models";

export async function getCompanyReports(organizationId: string): Promise<CompanyReport[]> {
  const result = await pool.query<CompanyReport>(`
    SELECT r.*,
           u_sub.name as submitted_by_name,
           u_rev.name as reviewed_by_name,
           o.name as organization_name
    FROM company_reports r
    JOIN organizations o ON r.organization_id = o.id
    LEFT JOIN users u_sub ON r.submitted_by_id = u_sub.id
    LEFT JOIN users u_rev ON r.reviewed_by_id = u_rev.id
    WHERE r.organization_id = $1
    ORDER BY r.created_at DESC
  `, [organizationId]);
  return result.rows;
}

export async function getAllGroupReports(): Promise<CompanyReport[]> {
  const result = await pool.query<CompanyReport>(`
    SELECT r.*,
           u_sub.name as submitted_by_name,
           u_rev.name as reviewed_by_name,
           o.name as organization_name
    FROM company_reports r
    JOIN organizations o ON r.organization_id = o.id
    LEFT JOIN users u_sub ON r.submitted_by_id = u_sub.id
    LEFT JOIN users u_rev ON r.reviewed_by_id = u_rev.id
    ORDER BY r.created_at DESC
  `);
  return result.rows;
}

export async function createCompanyReport(params: {
  organizationId: string;
  title: string;
  period: string;
  status: ReportStatus;
  revenue: number;
  expenses: number;
  ebitda: number;
  cash: number;
  headcount: number;
  majorProjects: number;
  risksCount: number;
  notes?: string;
  submittedById?: string;
}): Promise<CompanyReport> {
  const id = generateId("rep");
  const result = await pool.query<CompanyReport>(`
    INSERT INTO company_reports (
      id, organization_id, title, period, status,
      revenue, expenses, ebitda, cash, headcount,
      major_projects, risks_count, notes, submitted_by_id, submitted_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CASE WHEN $5 = 'SUBMITTED' THEN NOW() ELSE NULL END)
    RETURNING *
  `, [
    id,
    params.organizationId,
    params.title,
    params.period,
    params.status,
    params.revenue,
    params.expenses,
    params.ebitda,
    params.cash,
    params.headcount,
    params.majorProjects,
    params.risksCount,
    params.notes || null,
    params.submittedById || null,
  ]);
  return result.rows[0];
}

export async function updateReportStatus(
  reportId: string,
  status: ReportStatus,
  reviewerId: string
): Promise<CompanyReport | null> {
  const result = await pool.query<CompanyReport>(`
    UPDATE company_reports
    SET status = $1,
        reviewed_by_id = $2,
        reviewed_at = NOW(),
        updated_at = NOW()
    WHERE id = $3
    RETURNING *
  `, [status, reviewerId, reportId]);
  return result.rows[0] || null;
}
