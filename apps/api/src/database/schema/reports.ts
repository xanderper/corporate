import {
  pgTable,
  varchar,
  text,
  integer,
  numeric,
  timestamp,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { users } from "./users";

export const companyReports = pgTable("company_reports", {
  id: varchar("id", { length: 64 }).primaryKey(),
  organizationId: varchar("organization_id", { length: 64 })
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  period: varchar("period", { length: 64 }).notNull(),
  status: varchar("status", { length: 32 }).notNull().default("DRAFT"),
  revenue: numeric("revenue", { precision: 14, scale: 2 }).default("0"),
  expenses: numeric("expenses", { precision: 14, scale: 2 }).default("0"),
  ebitda: numeric("ebitda", { precision: 14, scale: 2 }).default("0"),
  cash: numeric("cash", { precision: 14, scale: 2 }).default("0"),
  headcount: integer("headcount").default(0),
  majorProjects: integer("major_projects").default(0),
  risksCount: integer("risks_count").default(0),
  notes: text("notes"),
  submittedById: varchar("submitted_by_id", { length: 64 }).references(() => users.id),
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
  reviewedById: varchar("reviewed_by_id", { length: 64 }).references(() => users.id),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type CompanyReport = typeof companyReports.$inferSelect;
export type NewCompanyReport = typeof companyReports.$inferInsert;
