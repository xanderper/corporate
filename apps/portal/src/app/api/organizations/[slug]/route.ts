import { NextRequest } from "next/server";
import { orgController } from "@/services/api/controllers/org.controller";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  return orgController.getOrganization(slug);
}
