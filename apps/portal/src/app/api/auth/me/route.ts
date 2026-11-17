import { NextRequest } from "next/server";
import { authController } from "@/services/api/controllers/auth.controller";

export async function GET(req: NextRequest) {
  return authController.getMe(req);
}
