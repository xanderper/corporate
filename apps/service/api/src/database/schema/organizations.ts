import {
  pgTable,
  varchar,
  text,
  boolean,
  numeric,
  date,
  timestamp,
  unique,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

export const organizations = pgTable("organizations", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  legalName: varchar("legal_name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  type: varchar("type", { length: 64 }).notNull().default("SUBSIDIARY"),
  description: text("description"),
  logoUrl: text("logo_url"),
  status: varchar("status", { length: 32 }).notNull().default("ACTIVE"),
  isPublic: boolean("is_public").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const ownershipRelationships = pgTable("ownership_relationships", {
  id: varchar("id", { length: 64 }).primaryKey(),
  ownerOrganizationId: varchar("owner_organization_id", { length: 64 })
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  ownedOrganizationId: varchar("owned_organization_id", { length: 64 })
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  ownershipPercentage: numeric("ownership_percentage", { precision: 5, scale: 2 }).notNull(),
  relationshipType: varchar("relationship_type", { length: 64 }).notNull().default("DIRECT"),
  effectiveFrom: date("effective_from"),
  effectiveUntil: date("effective_until"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const memberships = pgTable(
  "memberships",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    userId: varchar("user_id", { length: 64 })
      .notNull()
      .references(() => { /* circular — handled via FK in migration */ return null as unknown as AnyPgColumn; }, { onDelete: "cascade" }),
    organizationId: varchar("organization_id", { length: 64 })
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 64 }).notNull().default("MEMBER"),
    title: varchar("title", { length: 128 }),
    status: varchar("status", { length: 32 }).notNull().default("ACTIVE"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique("memberships_user_org_unique").on(t.userId, t.organizationId)]
);

export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
export type OwnershipRelationship = typeof ownershipRelationships.$inferSelect;
export type Membership = typeof memberships.$inferSelect;
export type NewMembership = typeof memberships.$inferInsert;
