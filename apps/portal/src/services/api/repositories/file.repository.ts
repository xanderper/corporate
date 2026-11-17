import { pool, generateId } from "../core/database";
import { FileRecord } from "../types/models";

export async function createFileRecord(params: {
  organizationId: string;
  uploaderUserId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  s3Key: string;
  bucketName: string;
  category?: FileRecord["category"];
}): Promise<FileRecord> {
  const id = generateId("fil");
  const result = await pool.query<FileRecord>(
    `INSERT INTO files (
       id, organization_id, uploader_user_id, file_name,
       file_size, mime_type, s3_key, bucket_name, category
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      id,
      params.organizationId,
      params.uploaderUserId,
      params.fileName,
      params.fileSize,
      params.mimeType,
      params.s3Key,
      params.bucketName,
      params.category || "GENERAL",
    ]
  );
  return result.rows[0];
}

export async function getFilesByOrganization(
  organizationId: string
): Promise<FileRecord[]> {
  const result = await pool.query<FileRecord>(
    `SELECT * FROM files
     WHERE organization_id = $1 AND is_archived = false
     ORDER BY created_at DESC`,
    [organizationId]
  );
  return result.rows;
}

export async function getFileById(fileId: string): Promise<FileRecord | null> {
  const result = await pool.query<FileRecord>(
    "SELECT * FROM files WHERE id = $1 LIMIT 1",
    [fileId]
  );
  return result.rows[0] || null;
}

export async function archiveFile(fileId: string): Promise<FileRecord | null> {
  const result = await pool.query<FileRecord>(
    `UPDATE files
     SET is_archived = true, updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [fileId]
  );
  return result.rows[0] || null;
}
