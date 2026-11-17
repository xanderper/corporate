import { NextRequest } from "next/server";
import { authController } from "@/services/api/controllers/auth.controller";

export async function POST(req: NextRequest) {
  return authController.synchronize(req);
}
