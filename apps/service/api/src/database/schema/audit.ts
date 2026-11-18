import {
  pgTable,
  varchar,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";

export const auditLogs = pgTable("audit_logs", {
  id: varchar("id", { length: 64 }).primaryKey(),
  actorId: varchar("actor_id", { length: 255 }).notNull(),
  action: varchar("action", { length: 64 }).notNull(),
  targetId: varchar("target_id", { length: 255 }),
  details: jsonb("details"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
