import { NextRequest } from "next/server";
import { reportController } from "@/services/api/controllers/report.controller";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; reportId: string }> }
) {
  const { slug, reportId } = await params;
  return reportController.reviewReport(slug, reportId, req);
}
