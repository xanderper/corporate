import { recordAuditLog, getAuditLogs } from "../repositories/audit.repository";
import { AuditLog } from "../types/models";

export async function logAuditEvent(params: {
  actorId: string;
  action: string;
  targetId?: string | null;
  details?: Record<string, unknown> | null;
}): Promise<AuditLog> {
  return recordAuditLog(params);
}

export async function fetchAuditTrail(params?: {
  actorId?: string;
  limit?: number;
}): Promise<AuditLog[]> {
  return getAuditLogs(params);
}
