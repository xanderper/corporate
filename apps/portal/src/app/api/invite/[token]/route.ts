import { NextRequest } from "next/server";
import { authController } from "@/services/api/controllers/auth.controller";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  return authController.getInvite(token);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  return authController.acceptInvite(token, req);
}
