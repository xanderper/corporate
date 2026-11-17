import { NextRequest } from "next/server";
import { BaseController } from "./base.controller";
import { reportService } from "../services/report.service";
import { initializeDatabase } from "../core/database";

export class ReportController extends BaseController {
  /**
   * GET /api/organizations/[slug]/reports
   */
  async getReports(slug: string) {
    try {
      await initializeDatabase();
      const reports = await reportService.getReportsForOrg(slug);
      if (!reports) {
        return this.error("Organization not found", "NOT_FOUND", 404);
      }
      return this.ok({ reports });
    } catch (err) {
      return this.internalError(err, "Failed to retrieve reports");
    }
  }

  /**
   * POST /api/organizations/[slug]/reports
   */
  async submitReport(slug: string, req: NextRequest) {
    try {
      await initializeDatabase();
      const body = await req.json();
      const result = await reportService.submitReport(slug, body);

      if (!result.success || !result.report) {
        return this.error(
          result.error || "Failed to submit report",
          "REPORT_SUBMISSION_ERROR",
          400
        );
      }

      return this.ok({ success: true, report: result.report }, 201);
    } catch (err) {
      return this.internalError(err, "Failed to submit financial report");
    }
  }

  /**
   * POST /api/organizations/[slug]/reports/[reportId]/review
   */
  async reviewReport(slug: string, reportId: string, req: NextRequest) {
    try {
      await initializeDatabase();
      const body = await req.json();
      const { status, reviewerId } = body;

      if (!status || !reviewerId) {
        return this.error(
          "status and reviewerId are required",
          "VALIDATION_ERROR",
          400
        );
      }

      const result = await reportService.reviewReport(
        reportId,
        status,
        reviewerId
      );

      if (!result.success || !result.report) {
        return this.error(
          result.error || "Failed to review report",
          "REPORT_REVIEW_ERROR",
          404
        );
      }

      return this.ok({ success: true, report: result.report });
    } catch (err) {
      return this.internalError(err, "Failed to update review status");
    }
  }
}

export const reportController = new ReportController();
