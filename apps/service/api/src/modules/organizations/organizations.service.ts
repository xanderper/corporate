import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import {
  organizations,
  ownershipRelationships,
  memberships,
  companyReports,
  auditLogs,
  users,
} from "../../database/schema";
import { eq, and, asc, desc, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { CreateOrganizationDto } from "./dto/create-organization.dto";
import { AddOwnershipDto } from "./dto/add-ownership.dto";

@Injectable()
export class OrganizationsService {
  constructor(private readonly db: DatabaseService) {}

  private get orm() {
    return this.db.db;
  }

  async getGroupStructure() {
    const owner = alias(organizations, "owner");
    const owned = alias(organizations, "owned");

    const [allOrgs, hierarchy] = await Promise.all([
      this.orm
        .select()
        .from(organizations)
        .orderBy(asc(organizations.type), asc(organizations.name)),
      this.orm
        .select({
          id: ownershipRelationships.id,
          ownerOrganizationId: ownershipRelationships.ownerOrganizationId,
          ownedOrganizationId: ownershipRelationships.ownedOrganizationId,
          ownershipPercentage: ownershipRelationships.ownershipPercentage,
          relationshipType: ownershipRelationships.relationshipType,
          effectiveFrom: ownershipRelationships.effectiveFrom,
          effectiveUntil: ownershipRelationships.effectiveUntil,
          ownerName: owner.name,
          ownedName: owned.name,
          ownedSlug: owned.slug,
          ownedType: owned.type,
        })
        .from(ownershipRelationships)
        .innerJoin(owner, eq(ownershipRelationships.ownerOrganizationId, owner.id))
        .innerJoin(owned, eq(ownershipRelationships.ownedOrganizationId, owned.id))
        .orderBy(asc(owner.type), desc(ownershipRelationships.ownershipPercentage)),
    ]);

    return { organizations: allOrgs, hierarchy };
  }

  async getOrganizationDetails(slug: string) {
    const organization = await this.orm.query.organizations.findFirst({
      where: eq(organizations.slug, slug),
    });
    if (!organization) throw new NotFoundException("Organization not found");

    const submitter = alias(users, "submitter");
    const reviewer = alias(users, "reviewer");

    const [members, reports] = await Promise.all([
      this.orm
        .select({
          id: memberships.id,
          userId: memberships.userId,
          organizationId: memberships.organizationId,
          role: memberships.role,
          title: memberships.title,
          status: memberships.status,
          createdAt: memberships.createdAt,
          updatedAt: memberships.updatedAt,
          userName: users.name,
          userEmail: users.email,
        })
        .from(memberships)
        .innerJoin(users, eq(memberships.userId, users.id))
        .where(eq(memberships.organizationId, organization.id))
        .orderBy(asc(memberships.role), asc(users.name)),
      this.orm
        .select({
          id: companyReports.id,
          organizationId: companyReports.organizationId,
          title: companyReports.title,
          period: companyReports.period,
          status: companyReports.status,
          revenue: companyReports.revenue,
          expenses: companyReports.expenses,
          ebitda: companyReports.ebitda,
          cash: companyReports.cash,
          headcount: companyReports.headcount,
          majorProjects: companyReports.majorProjects,
          risksCount: companyReports.risksCount,
          notes: companyReports.notes,
          submittedById: companyReports.submittedById,
          submittedAt: companyReports.submittedAt,
          reviewedById: companyReports.reviewedById,
          reviewedAt: companyReports.reviewedAt,
          createdAt: companyReports.createdAt,
          updatedAt: companyReports.updatedAt,
          submittedByName: submitter.name,
          reviewedByName: reviewer.name,
          organizationName: organizations.name,
        })
        .from(companyReports)
        .innerJoin(organizations, eq(companyReports.organizationId, organizations.id))
        .leftJoin(submitter, eq(companyReports.submittedById, submitter.id))
        .leftJoin(reviewer, eq(companyReports.reviewedById, reviewer.id))
        .where(eq(companyReports.organizationId, organization.id))
        .orderBy(desc(companyReports.createdAt)),
    ]);

    return { organization, members, reports };
  }

  async getUserMemberships(qorveUserId?: string, email?: string) {
    let user = qorveUserId
      ? await this.orm.query.users.findFirst({ where: eq(users.qorveUserId, qorveUserId) })
      : null;

    if (!user && email) {
      user = await this.orm.query.users.findFirst({
        where: eq(sql`LOWER(${users.email})`, email.trim().toLowerCase()),
      });
    }

    if (!user) {
      return { memberships: [], organizations: [], isHoldingExecutive: false };
    }

    const userMemberships = await this.orm
      .select({
        id: memberships.id,
        userId: memberships.userId,
        organizationId: memberships.organizationId,
        role: memberships.role,
        title: memberships.title,
        status: memberships.status,
        createdAt: memberships.createdAt,
        updatedAt: memberships.updatedAt,
        organizationName: organizations.name,
        organizationSlug: organizations.slug,
        organizationType: organizations.type,
      })
      .from(memberships)
      .innerJoin(organizations, eq(memberships.organizationId, organizations.id))
      .where(and(eq(memberships.userId, user.id), eq(memberships.status, "ACTIVE")))
      .orderBy(asc(organizations.type), asc(organizations.name));

    const isHoldingExecutive = userMemberships.some(
      (m) =>
        m.organizationSlug === "virex-holding" &&
        (m.role === "OWNER" || m.role === "DIRECTOR" || m.role === "ADMIN")
    );

    const allOrgs = await this.orm
      .select()
      .from(organizations)
      .orderBy(asc(organizations.type), asc(organizations.name));

    const accessibleOrgs = isHoldingExecutive
      ? allOrgs
      : (() => {
          const orgIds = new Set(userMemberships.map((m) => m.organizationId));
          return allOrgs.filter((o) => orgIds.has(o.id));
        })();

    return { memberships: userMemberships, organizations: accessibleOrgs, isHoldingExecutive };
  }

  async upsertMembership(
    userId: string,
    organizationId: string,
    role: string,
    title?: string
  ) {
    const [membership] = await this.orm
      .insert(memberships)
      .values({
        id: this.db.generateId("mbr"),
        userId,
        organizationId,
        role,
        title,
        status: "ACTIVE",
      })
      .onConflictDoUpdate({
        target: [memberships.userId, memberships.organizationId],
        set: {
          role: sql`EXCLUDED.role`,
          title: sql`EXCLUDED.title`,
          updatedAt: new Date(),
        },
      })
      .returning();

    return membership;
  }

  // ─── Acquisition Flows ────────────────────────────────────────────────────

  async createOrganization(dto: CreateOrganizationDto, actorId = "Virex Administrator") {
    // Auto-generate slug from name if not provided
    const slug =
      dto.slug ??
      dto.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    // Guard: slug must be unique
    const existing = await this.orm.query.organizations.findFirst({
      where: eq(organizations.slug, slug),
    });
    if (existing) {
      throw new ConflictException(
        `An organization with slug "${slug}" already exists. Provide a unique slug.`
      );
    }

    const [organization] = await this.orm
      .insert(organizations)
      .values({
        id: this.db.generateId("org"),
        name: dto.name.trim(),
        legalName: dto.legalName.trim(),
        slug,
        type: dto.type ?? "SUBSIDIARY",
        description: dto.description ?? null,
        logoUrl: dto.logoUrl ?? null,
        isPublic: dto.isPublic ?? false,
        status: "ACTIVE",
      })
      .returning();

    await this.orm.insert(auditLogs).values({
      id: this.db.generateId("aud"),
      actorId,
      action: "organization.created",
      targetId: organization.id,
      details: {
        name: organization.name,
        legalName: organization.legalName,
        slug: organization.slug,
        type: organization.type,
      },
    });

    return { organization };
  }

  async addOwnership(dto: AddOwnershipDto) {
    const actorId = dto.actorId ?? "Virex Administrator";

    // Resolve slugs → IDs
    const [ownerOrg, ownedOrg] = await Promise.all([
      this.orm.query.organizations.findFirst({ where: eq(organizations.slug, dto.ownerSlug) }),
      this.orm.query.organizations.findFirst({ where: eq(organizations.slug, dto.ownedSlug) }),
    ]);

    if (!ownerOrg) throw new NotFoundException(`Owner organization "${dto.ownerSlug}" not found`);
    if (!ownedOrg) throw new NotFoundException(`Acquired organization "${dto.ownedSlug}" not found`);
    if (ownerOrg.id === ownedOrg.id) {
      throw new ConflictException("An organization cannot own itself");
    }

    const [relationship] = await this.orm
      .insert(ownershipRelationships)
      .values({
        id: this.db.generateId("own"),
        ownerOrganizationId: ownerOrg.id,
        ownedOrganizationId: ownedOrg.id,
        ownershipPercentage: String(dto.ownershipPercentage),
        relationshipType: dto.relationshipType ?? "DIRECT",
        effectiveFrom: dto.effectiveFrom ?? new Date().toISOString().slice(0, 10),
        effectiveUntil: dto.effectiveUntil ?? null,
      })
      .returning();

    await this.orm.insert(auditLogs).values({
      id: this.db.generateId("aud"),
      actorId,
      action: "ownership.added",
      targetId: relationship.id,
      details: {
        owner: ownerOrg.name,
        acquired: ownedOrg.name,
        ownershipPercentage: dto.ownershipPercentage,
        relationshipType: relationship.relationshipType,
        effectiveFrom: relationship.effectiveFrom,
      },
    });

    return {
      relationship,
      owner: { id: ownerOrg.id, name: ownerOrg.name, slug: ownerOrg.slug },
      acquired: { id: ownedOrg.id, name: ownedOrg.name, slug: ownedOrg.slug },
    };
  }
}
