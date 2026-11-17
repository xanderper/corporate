import {
  getAllOrganizations,
  getOrganizationBySlug,
  getOwnershipHierarchy,
  createOrganization as createOrganizationInDB,
  createOwnershipRelationship,
} from "../repositories/org.repository";
import {
  getUserMemberships,
  getOrganizationMembers,
} from "../repositories/membership.repository";
import { getCompanyReports } from "../repositories/report.repository";
import {
  findUserByQorveId,
  findUserByEmail,
} from "../repositories/user.repository";
import {
  Organization,
  OwnershipRelationship,
  Membership,
  CompanyReport,
  OrgType,
  RelationshipType,
} from "../types/models";

export class OrgService {
  async getGroupStructure(): Promise<{
    organizations: Organization[];
    hierarchy: OwnershipRelationship[];
  }> {
    const [organizations, hierarchy] = await Promise.all([
      getAllOrganizations(),
      getOwnershipHierarchy(),
    ]);
    return { organizations, hierarchy };
  }

  async getOrganizationDetails(slug: string): Promise<{
    organization: Organization | null;
    members: Membership[];
    reports: CompanyReport[];
  }> {
    const organization = await getOrganizationBySlug(slug);
    if (!organization) return { organization: null, members: [], reports: [] };

    const [members, reports] = await Promise.all([
      getOrganizationMembers(organization.id),
      getCompanyReports(organization.id),
    ]);
    return { organization, members, reports };
  }

  async getUserMembershipsAndAccessibleOrgs(params: {
    qorveUserId?: string | null;
    email?: string | null;
  }): Promise<{
    memberships: Membership[];
    organizations: Organization[];
    isHoldingExecutive: boolean;
  }> {
    const { qorveUserId, email } = params;

    let user = null;
    if (qorveUserId) user = await findUserByQorveId(qorveUserId);
    if (!user && email) user = await findUserByEmail(email);

    if (!user) return { memberships: [], organizations: [], isHoldingExecutive: false };

    const memberships = await getUserMemberships(user.id);

    const isHoldingExecutive = memberships.some(
      (m) =>
        m.organization_slug === "virex-holding" &&
        (m.role === "OWNER" || m.role === "DIRECTOR" || m.role === "ADMIN")
    );

    let accessibleOrgs: Organization[];
    if (isHoldingExecutive) {
      accessibleOrgs = await getAllOrganizations();
    } else {
      const allOrgs = await getAllOrganizations();
      const orgIds = new Set(memberships.map((m) => m.organization_id));
      accessibleOrgs = allOrgs.filter((o) => orgIds.has(o.id));
    }

    return { memberships, organizations: accessibleOrgs, isHoldingExecutive };
  }

  /**
   * Registers a new company. Slug is auto-generated from name if omitted.
   */
  async createOrganization(params: {
    name: string;
    legalName: string;
    slug?: string;
    type?: OrgType;
    description?: string;
    logoUrl?: string;
    isPublic?: boolean;
  }): Promise<Organization> {
    const slug =
      params.slug ??
      params.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    const existing = await getOrganizationBySlug(slug);
    if (existing) {
      throw Object.assign(
        new Error(`An organization with slug "${slug}" already exists.`),
        { status: 409 }
      );
    }

    return createOrganizationInDB({
      name: params.name.trim(),
      legalName: params.legalName.trim(),
      slug,
      type: params.type ?? "SUBSIDIARY",
      description: params.description,
      logoUrl: params.logoUrl,
      isPublic: params.isPublic,
    });
  }

  /**
   * Records an ownership stake between two existing organizations (resolved by slug).
   */
  async addOwnership(params: {
    ownerSlug: string;
    ownedSlug: string;
    ownershipPercentage: number;
    relationshipType?: RelationshipType;
    effectiveFrom?: string;
    effectiveUntil?: string;
  }): Promise<{
    relationship: OwnershipRelationship;
    owner: Pick<Organization, "id" | "name" | "slug">;
    acquired: Pick<Organization, "id" | "name" | "slug">;
  }> {
    const [ownerOrg, ownedOrg] = await Promise.all([
      getOrganizationBySlug(params.ownerSlug),
      getOrganizationBySlug(params.ownedSlug),
    ]);

    if (!ownerOrg)
      throw Object.assign(new Error(`Owner "${params.ownerSlug}" not found`), { status: 404 });
    if (!ownedOrg)
      throw Object.assign(new Error(`Acquired "${params.ownedSlug}" not found`), { status: 404 });
    if (ownerOrg.id === ownedOrg.id)
      throw Object.assign(new Error("An organization cannot own itself"), { status: 400 });

    const relationship = await createOwnershipRelationship({
      ownerOrgId: ownerOrg.id,
      ownedOrgId: ownedOrg.id,
      percentage: params.ownershipPercentage,
      type: params.relationshipType ?? "DIRECT",
      effectiveFrom: params.effectiveFrom,
      effectiveUntil: params.effectiveUntil,
    });

    return {
      relationship,
      owner: { id: ownerOrg.id, name: ownerOrg.name, slug: ownerOrg.slug },
      acquired: { id: ownedOrg.id, name: ownedOrg.name, slug: ownedOrg.slug },
    };
  }
}

export const orgService = new OrgService();
