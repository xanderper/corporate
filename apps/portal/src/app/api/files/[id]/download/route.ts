import { NextRequest } from "next/server";
import { fileController } from "@/services/api/controllers/file.controller";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return fileController.getDownloadUrl(id);
}
