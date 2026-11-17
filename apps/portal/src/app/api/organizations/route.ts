import { NextRequest } from "next/server";
import { orgController } from "@/services/api/controllers/org.controller";

export async function GET() {
  return orgController.getStructure();
}

export async function POST(req: NextRequest) {
  return orgController.createOrganization(req);
}
