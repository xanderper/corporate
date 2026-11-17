import { Controller, Get, Post, Param, Body } from "@nestjs/common";
import { ReportsService } from "./reports.service";
import { CreateReportDto } from "./dto/create-report.dto";
import { ReviewReportDto } from "./dto/review-report.dto";

@Controller("organizations/:slug/reports")
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  async getReports(@Param("slug") slug: string) {
    return this.reportsService.getReportsByOrgSlug(slug);
  }

  @Post()
  async submitReport(
    @Param("slug") slug: string,
    @Body() dto: CreateReportDto
  ) {
    return this.reportsService.submitReport(slug, dto);
  }

  @Post(":reportId/review")
  async reviewReport(
    @Param("slug") slug: string,
    @Param("reportId") reportId: string,
    @Body() dto: ReviewReportDto
  ) {
    return this.reportsService.reviewReport(slug, reportId, dto);
  }
}
