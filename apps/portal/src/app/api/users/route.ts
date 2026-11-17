import { NextRequest } from "next/server";
import { userController } from "@/services/api/controllers/user.controller";

export async function GET() {
  return userController.listUsers();
}

export async function POST(req: NextRequest) {
  return userController.inviteUser(req);
}
