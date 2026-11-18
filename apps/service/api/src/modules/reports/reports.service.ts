import { Injectable, NotFoundException } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import {
  organizations,
  companyReports,
  auditLogs,
  users,
} from "../../database/schema";
import { eq, desc } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { CreateReportDto } from "./dto/create-report.dto";
import { ReviewReportDto } from "./dto/review-report.dto";

@Injectable()
export class ReportsService {
  constructor(private readonly db: DatabaseService) {}

  private get orm() {
    return this.db.db;
  }

  private async findOrgBySlug(slug: string) {
    const org = await this.orm.query.organizations.findFirst({
      where: eq(organizations.slug, slug),
    });
    if (!org) throw new NotFoundException("Organization not found");
    return org;
  }

  async getReportsByOrgSlug(slug: string) {
    const org = await this.findOrgBySlug(slug);

    const submitter = alias(users, "submitter");
    const reviewer = alias(users, "reviewer");

    const reports = await this.orm
      .select({
        id: companyReports.id,
        organizationId: companyReports.organizationId,
        title: companyReports.title,
        period: companyReports.period,
        status: companyReports.status,
        revenue: companyReports.revenue,
        expenses: companyReports.expenses,
        ebitda: companyReports.ebitda,
        cash: companyReports.cash,
        headcount: companyReports.headcount,
        majorProjects: companyReports.majorProjects,
        risksCount: companyReports.risksCount,
        notes: companyReports.notes,
        submittedById: companyReports.submittedById,
        submittedAt: companyReports.submittedAt,
        reviewedById: companyReports.reviewedById,
        reviewedAt: companyReports.reviewedAt,
        createdAt: companyReports.createdAt,
        updatedAt: companyReports.updatedAt,
        submittedByName: submitter.name,
        reviewedByName: reviewer.name,
        organizationName: organizations.name,
      })
      .from(companyReports)
      .innerJoin(organizations, eq(companyReports.organizationId, organizations.id))
      .leftJoin(submitter, eq(companyReports.submittedById, submitter.id))
      .leftJoin(reviewer, eq(companyReports.reviewedById, reviewer.id))
      .where(eq(companyReports.organizationId, org.id))
      .orderBy(desc(companyReports.createdAt));

    return { reports };
  }

  async submitReport(slug: string, dto: CreateReportDto) {
    const org = await this.findOrgBySlug(slug);

    const rev = Number(dto.revenue) || 0;
    const exp = Number(dto.expenses) || 0;
    const calculatedEbitda = dto.ebitda !== undefined ? Number(dto.ebitda) : rev - exp;
    const status = dto.status || "SUBMITTED";

    const [report] = await this.orm
      .insert(companyReports)
      .values({
        id: this.db.generateId("rep"),
        organizationId: org.id,
        title: dto.title,
        period: dto.period,
        status,
        revenue: String(rev),
        expenses: String(exp),
        ebitda: String(calculatedEbitda),
        cash: String(Number(dto.cash) || 0),
        headcount: Number(dto.headcount) || 0,
        majorProjects: Number(dto.majorProjects) || 0,
        risksCount: Number(dto.risksCount) || 0,
        notes: dto.notes || null,
        submittedById: dto.submittedById || null,
        submittedAt: status === "SUBMITTED" ? new Date() : null,
      })
      .returning();

    await this.orm.insert(auditLogs).values({
      id: this.db.generateId("aud"),
      actorId: dto.submittedById || "anonymous",
      action: "report.submitted",
      targetId: report.id,
      details: {
        organization: org.name,
        period: dto.period,
        revenue: rev,
        ebitda: calculatedEbitda,
        status: report.status,
      },
    });

    return { success: true, report };
  }

  async reviewReport(slug: string, reportId: string, dto: ReviewReportDto) {
    const [report] = await this.orm
      .update(companyReports)
      .set({
        status: dto.status,
        reviewedById: dto.reviewerId,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(companyReports.id, reportId))
      .returning();

    if (!report) throw new NotFoundException("Report not found");

    await this.orm.insert(auditLogs).values({
      id: this.db.generateId("aud"),
      actorId: dto.reviewerId,
      action: `report.${dto.status.toLowerCase()}`,
      targetId: reportId,
      details: { status: dto.status, reviewedAt: report.reviewedAt },
    });

    return { success: true, report };
  }
}
