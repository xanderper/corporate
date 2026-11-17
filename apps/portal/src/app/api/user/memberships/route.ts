import { NextRequest } from "next/server";
import { orgController } from "@/services/api/controllers/org.controller";

export async function GET(req: NextRequest) {
  return orgController.getUserMemberships(req);
}
