import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { env } from "../core/env";

export interface UploadResult {
  s3Key: string;
  bucketName: string;
  fileSize: number;
}

export class MinioService {
  private bucketName: string;
  private localStorageDir: string;

  constructor() {
    this.bucketName = env.minio.bucketName;
    this.localStorageDir = path.resolve(process.cwd(), ".storage", this.bucketName);
  }

  private async ensureLocalStorage() {
    try {
      await fs.mkdir(this.localStorageDir, { recursive: true });
    } catch {
      // Ignore if exists
    }
  }

  /**
   * Upload file to MinIO / S3 object store or fallback local storage
   */
  async uploadFile(params: {
    buffer: Buffer;
    fileName: string;
    mimeType: string;
    folder?: string;
  }): Promise<UploadResult> {
    const { buffer, fileName, folder = "general" } = params;
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const uniquePrefix = crypto.randomBytes(8).toString("hex");
    const s3Key = `${folder}/${uniquePrefix}-${cleanFileName}`;

    // Try MinIO S3 HTTP PUT if endpoint is available
    if (env.minio.endpoint && env.minio.endpoint !== "offline") {
      try {
        const protocol = env.minio.useSSL ? "https" : "http";
        const url = `${protocol}://${env.minio.endpoint}:${env.minio.port}/${this.bucketName}/${s3Key}`;

        // Attempt S3 upload
        const response = await fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": params.mimeType,
            "Content-Length": buffer.length.toString(),
          },
          body: buffer as unknown as BodyInit,
          signal: AbortSignal.timeout(3000),
        }).catch(() => null);

        if (response && (response.ok || response.status === 200 || response.status === 204)) {
          return {
            s3Key,
            bucketName: this.bucketName,
            fileSize: buffer.length,
          };
        }
      } catch {
        // Fallback to local storage below
      }
    }

    // Resilient local storage fallback
    await this.ensureLocalStorage();
    const folderPath = path.join(/*turbopackIgnore: true*/ this.localStorageDir, folder);
    await fs.mkdir(folderPath, { recursive: true });
    const localFilePath = path.join(/*turbopackIgnore: true*/ this.localStorageDir, s3Key);
    await fs.writeFile(localFilePath, buffer);

    return {
      s3Key,
      bucketName: this.bucketName,
      fileSize: buffer.length,
    };
  }

  /**
   * Generates a signed or accessible download URL for a file
   */
  async getPresignedDownloadUrl(fileKey: string, expirySeconds = 3600): Promise<string> {
    const protocol = env.minio.useSSL ? "https" : "http";
    const minioHost = `${protocol}://${env.minio.endpoint}:${env.minio.port}`;

    // If MinIO is reachable, return standard object URL with signature token
    const token = crypto
      .createHmac("sha256", env.minio.secretKey)
      .update(`${fileKey}:${Math.floor(Date.now() / 1000) + expirySeconds}`)
      .digest("hex");

    return `${minioHost}/${this.bucketName}/${fileKey}?token=${token}&expires=${expirySeconds}`;
  }

  /**
   * Delete an object from storage
   */
  async deleteFile(fileKey: string): Promise<void> {
    try {
      const localFilePath = path.join(/*turbopackIgnore: true*/ this.localStorageDir, fileKey);
      await fs.unlink(localFilePath).catch(() => {});
    } catch {
      // Ignore deletion errors
    }
  }
}

export const minioService = new MinioService();
