import {
  pgTable,
  varchar,
  timestamp,
} from "drizzle-orm/pg-core";

export const invitations = pgTable("invitations", {
  id: varchar("id", { length: 64 }).primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  invitedBy: varchar("invited_by", { length: 255 }).notNull(),
  status: varchar("status", { length: 32 }).notNull().default("PENDING"),
  tokenHash: varchar("token_hash", { length: 256 }).notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
