import { NextRequest } from "next/server";
import { fileController } from "@/services/api/controllers/file.controller";

export async function POST(req: NextRequest) {
  return fileController.uploadFile(req);
}
