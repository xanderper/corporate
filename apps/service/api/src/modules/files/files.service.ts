import { Injectable, NotFoundException } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import { files, auditLogs } from "../../database/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

@Injectable()
export class FilesService {
  constructor(private readonly db: DatabaseService) {}

  private get orm() {
    return this.db.db;
  }

  async listFilesByOrganization(organizationId: string) {
    return this.orm
      .select()
      .from(files)
      .where(and(eq(files.organizationId, organizationId), eq(files.isArchived, false)))
      .orderBy(files.createdAt);
  }

  async getFileById(fileId: string) {
    const file = await this.orm.query.files.findFirst({
      where: eq(files.id, fileId),
    });
    if (!file) throw new NotFoundException(`File with ID '${fileId}' not found`);
    return file;
  }

  async getDownloadUrl(fileId: string) {
    const file = await this.getFileById(fileId);
    const minioHost = process.env.MINIO_ENDPOINT || "http://localhost:9000";
    const bucket = file.bucketName || "virex-portal-documents";

    const token = crypto
      .createHmac("sha256", process.env.MINIO_SECRET_KEY || "minioadmin")
      .update(`${file.s3Key}:${Math.floor(Date.now() / 1000) + 3600}`)
      .digest("hex");

    const downloadUrl = `${minioHost}/${bucket}/${file.s3Key}?token=${token}&expires=3600`;
    return { downloadUrl, file };
  }

  async registerFile(params: {
    organizationId: string;
    uploaderUserId: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    category?: string;
  }) {
    const uniquePrefix = crypto.randomBytes(8).toString("hex");
    const cleanName = params.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const s3Key = `${params.organizationId}/${uniquePrefix}-${cleanName}`;
    const bucketName = process.env.MINIO_BUCKET_NAME || "virex-portal-documents";

    const [file] = await this.orm
      .insert(files)
      .values({
        id: this.db.generateId("fil"),
        organizationId: params.organizationId,
        uploaderUserId: params.uploaderUserId,
        fileName: params.fileName,
        fileSize: params.fileSize,
        mimeType: params.mimeType,
        s3Key,
        bucketName,
        category: params.category || "GENERAL",
      })
      .returning();

    await this.orm.insert(auditLogs).values({
      id: this.db.generateId("aud"),
      actorId: params.uploaderUserId,
      action: "file.uploaded",
      targetId: file.id,
      details: {
        fileName: params.fileName,
        fileSize: params.fileSize,
        category: file.category,
      },
    });

    return file;
  }
}
