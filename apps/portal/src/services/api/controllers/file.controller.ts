import { NextRequest } from "next/server";
import { BaseController } from "./base.controller";
import { fileService } from "../services/file.service";
import { initializeDatabase } from "../core/database";

export class FileController extends BaseController {
  /**
   * GET /api/files?organizationId=...
   */
  async listFiles(req: NextRequest) {
    try {
      await initializeDatabase();
      const organizationId = req.nextUrl.searchParams.get("organizationId");
      if (!organizationId) {
        return this.error("organizationId is required", "VALIDATION_ERROR", 400);
      }

      const files = await fileService.listFilesByOrganization(organizationId);
      return this.ok({ files });
    } catch (err) {
      return this.internalError(err, "Failed to retrieve documents");
    }
  }

  /**
   * POST /api/files/upload
   */
  async uploadFile(req: NextRequest) {
    try {
      await initializeDatabase();
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const organizationId = formData.get("organizationId") as string | null;
      const category = formData.get("category") as
        | "FINANCIAL_REPORT"
        | "CAP_TABLE"
        | "LEGAL"
        | "GOVERNANCE"
        | "GENERAL"
        | null;
      const uploaderUserId =
        (formData.get("uploaderUserId") as string | null) ||
        req.headers.get("x-qorve-user-id") ||
        "Virex User";

      if (!file || !organizationId) {
        return this.error("file and organizationId are required", "VALIDATION_ERROR", 400);
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const result = await fileService.uploadFile({
        buffer,
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        organizationId,
        uploaderUserId,
        category: category || "GENERAL",
      });

      if (!result.success || !result.file) {
        return this.error(result.error || "Upload failed", "UPLOAD_ERROR", 400);
      }

      return this.ok({ success: true, file: result.file }, 201);
    } catch (err) {
      return this.internalError(err, "Failed to process document upload");
    }
  }

  /**
   * GET /api/files/[id]/download
   */
  async getDownloadUrl(fileId: string) {
    try {
      await initializeDatabase();
      if (!fileId) {
        return this.error("File ID is required", "VALIDATION_ERROR", 400);
      }

      const result = await fileService.getDownloadUrl(fileId);
      if (!result) {
        return this.error("Document not found", "NOT_FOUND", 404);
      }

      return this.ok({ downloadUrl: result.downloadUrl, file: result.file });
    } catch (err) {
      return this.internalError(err, "Failed to generate document download link");
    }
  }

  /**
   * DELETE /api/files/[id]
   */
  async archiveFile(fileId: string, req: NextRequest) {
    try {
      await initializeDatabase();
      const body = await req.json().catch(() => ({}));
      const actorId = body.actorId || "Virex Administrator";

      const file = await fileService.archiveFile(fileId, actorId);
      if (!file) {
        return this.error("Document not found", "NOT_FOUND", 404);
      }

      return this.ok({ success: true, file });
    } catch (err) {
      return this.internalError(err, "Failed to archive document");
    }
  }
}

export const fileController = new FileController();
