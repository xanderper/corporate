import {
  pgTable,
  varchar,
  bigint,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { users } from "./users";

export const files = pgTable("files", {
  id: varchar("id", { length: 64 }).primaryKey(),
  organizationId: varchar("organization_id", { length: 64 })
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  uploaderUserId: varchar("uploader_user_id", { length: 64 })
    .notNull()
    .references(() => users.id),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileSize: bigint("file_size", { mode: "number" }).notNull(),
  mimeType: varchar("mime_type", { length: 128 }).notNull(),
  s3Key: varchar("s3_key", { length: 512 }).notNull().unique(),
  bucketName: varchar("bucket_name", { length: 128 }).notNull(),
  category: varchar("category", { length: 64 }).notNull().default("GENERAL"),
  isArchived: boolean("is_archived").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type File = typeof files.$inferSelect;
export type NewFile = typeof files.$inferInsert;
