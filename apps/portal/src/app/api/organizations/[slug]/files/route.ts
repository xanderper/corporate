import { NextRequest } from "next/server";
import { fileController } from "@/services/api/controllers/file.controller";
import { getOrganizationBySlug } from "@/services/api/repositories/org.repository";
import { initializeDatabase } from "@/services/api/core/database";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  await initializeDatabase();
  const { slug } = await params;
  const org = await getOrganizationBySlug(slug);
  const organizationId = org ? org.id : slug;

  // Delegate with organizationId in request
  const url = new URL(req.url);
  url.searchParams.set("organizationId", organizationId);
  const newReq = new NextRequest(url, { headers: req.headers });

  return fileController.listFiles(newReq);
}
