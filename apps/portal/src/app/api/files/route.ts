import { NextRequest } from "next/server";
import { fileController } from "@/services/api/controllers/file.controller";

export async function GET(req: NextRequest) {
  return fileController.listFiles(req);
}
