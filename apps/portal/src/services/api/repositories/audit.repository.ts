import { pool, generateId } from "../core/database";
import { AuditLog } from "../types/models";

export async function recordAuditLog(params: {
  actorId: string;
  action: string;
  targetId?: string | null;
  details?: Record<string, unknown> | null;
}): Promise<AuditLog> {
  const id = generateId("aud");
  const result = await pool.query<AuditLog>(
    `INSERT INTO audit_logs (id, actor_id, action, target_id, details)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      id,
      params.actorId,
      params.action,
      params.targetId || null,
      params.details ? JSON.stringify(params.details) : null,
    ]
  );
  return result.rows[0];
}

export async function getAuditLogs(params?: {
  actorId?: string;
  limit?: number;
}): Promise<AuditLog[]> {
  const limit = params?.limit || 50;
  if (params?.actorId) {
    const result = await pool.query<AuditLog>(
      "SELECT * FROM audit_logs WHERE actor_id = $1 ORDER BY created_at DESC LIMIT $2",
      [params.actorId, limit]
    );
    return result.rows;
  }
  const result = await pool.query<AuditLog>(
    "SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT $1",
    [limit]
  );
  return result.rows;
}
