import {
  createFileRecord,
  getFilesByOrganization,
  getFileById,
  archiveFile as repoArchiveFile,
} from "../repositories/file.repository";
import { recordAuditLog } from "../repositories/audit.repository";
import { minioService } from "../storage/minio.service";
import { FileRecord } from "../types/models";

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/csv",
  "image/png",
  "image/jpeg",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
]);

export class FileService {
  /**
   * Upload and register a document in Virex document registry
   */
  async uploadFile(params: {
    buffer: Buffer;
    fileName: string;
    mimeType: string;
    organizationId: string;
    uploaderUserId: string;
    category?: FileRecord["category"];
  }): Promise<{ success: boolean; file?: FileRecord; error?: string }> {
    const { buffer, fileName, mimeType, organizationId, uploaderUserId, category } = params;

    // 1. Validate file size
    if (buffer.length > MAX_FILE_SIZE_BYTES) {
      return {
        success: false,
        error: `File size exceeds maximum allowed threshold of 50MB (received: ${(
          buffer.length /
          (1024 * 1024)
        ).toFixed(2)}MB)`,
      };
    }

    // 2. Validate MIME type
    if (!ALLOWED_MIME_TYPES.has(mimeType.toLowerCase())) {
      return {
        success: false,
        error: `Unsupported file type: ${mimeType}. Allowed formats: PDF, XLSX, XLS, CSV, PNG, JPG, DOCX`,
      };
    }

    // 3. Upload to MinIO / S3 storage
    const uploadResult = await minioService.uploadFile({
      buffer,
      fileName,
      mimeType,
      folder: organizationId,
    });

    // 4. Save metadata record to database
    const fileRecord = await createFileRecord({
      organizationId,
      uploaderUserId,
      fileName,
      fileSize: uploadResult.fileSize,
      mimeType,
      s3Key: uploadResult.s3Key,
      bucketName: uploadResult.bucketName,
      category: category || "GENERAL",
    });

    // 5. Record audit trail
    await recordAuditLog({
      actorId: uploaderUserId,
      action: "file.uploaded",
      targetId: fileRecord.id,
      details: {
        fileName,
        fileSize: uploadResult.fileSize,
        category: fileRecord.category,
        organizationId,
      },
    });

    return {
      success: true,
      file: fileRecord,
    };
  }

  /**
   * List active files for an organization
   */
  async listFilesByOrganization(organizationId: string): Promise<FileRecord[]> {
    return getFilesByOrganization(organizationId);
  }

  /**
   * Generate download URL for a file
   */
  async getDownloadUrl(fileId: string): Promise<{ downloadUrl: string; file: FileRecord } | null> {
    const file = await getFileById(fileId);
    if (!file) return null;

    const downloadUrl = await minioService.getPresignedDownloadUrl(file.s3_key);
    return { downloadUrl, file };
  }

  /**
   * Archive a file
   */
  async archiveFile(fileId: string, actorId: string): Promise<FileRecord | null> {
    const file = await repoArchiveFile(fileId);
    if (!file) return null;

    await recordAuditLog({
      actorId,
      action: "file.archived",
      targetId: fileId,
      details: { fileName: file.file_name, organizationId: file.organization_id },
    });

    return file;
  }
}

export const fileService = new FileService();
