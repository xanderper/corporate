import { NextRequest } from "next/server";
import { reportController } from "@/services/api/controllers/report.controller";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  return reportController.getReports(slug);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  return reportController.submitReport(slug, req);
}
