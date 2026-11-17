import { pool, generateId } from "../core/database";
import {
  Organization,
  OwnershipRelationship,
  OrgType,
  RelationshipType,
} from "../types/models";

export async function getAllOrganizations(): Promise<Organization[]> {
  const result = await pool.query<Organization>(
    "SELECT * FROM organizations ORDER BY type ASC, name ASC"
  );
  return result.rows;
}

export async function getOrganizationById(id: string): Promise<Organization | null> {
  const result = await pool.query<Organization>(
    "SELECT * FROM organizations WHERE id = $1 LIMIT 1",
    [id]
  );
  return result.rows[0] || null;
}

export async function getOrganizationBySlug(slug: string): Promise<Organization | null> {
  const result = await pool.query<Organization>(
    "SELECT * FROM organizations WHERE slug = $1 LIMIT 1",
    [slug]
  );
  return result.rows[0] || null;
}

export async function createOrganization(params: {
  name: string;
  legalName: string;
  slug: string;
  type: OrgType;
  description?: string;
  logoUrl?: string;
  isPublic?: boolean;
}): Promise<Organization> {
  const id = generateId("org");
  const result = await pool.query<Organization>(
    `INSERT INTO organizations (id, name, legal_name, slug, type, description, logo_url, is_public)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      id,
      params.name,
      params.legalName,
      params.slug,
      params.type,
      params.description || null,
      params.logoUrl || null,
      params.isPublic ?? false,
    ]
  );
  return result.rows[0];
}

export async function getOwnershipHierarchy(): Promise<OwnershipRelationship[]> {
  const result = await pool.query<OwnershipRelationship>(`
    SELECT r.*,
           owner.name as owner_name,
           owned.name as owned_name,
           owned.slug as owned_slug,
           owned.type as owned_type
    FROM ownership_relationships r
    JOIN organizations owner ON r.owner_organization_id = owner.id
    JOIN organizations owned ON r.owned_organization_id = owned.id
    ORDER BY owner.type ASC, r.ownership_percentage DESC
  `);
  return result.rows;
}

export async function createOwnershipRelationship(params: {
  ownerOrgId: string;
  ownedOrgId: string;
  percentage: number;
  type: RelationshipType;
  effectiveFrom?: string;
  effectiveUntil?: string;
}): Promise<OwnershipRelationship> {
  const id = generateId("own");
  await pool.query(
    `INSERT INTO ownership_relationships (
       id, owner_organization_id, owned_organization_id, ownership_percentage, relationship_type, effective_from, effective_until
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      id,
      params.ownerOrgId,
      params.ownedOrgId,
      params.percentage,
      params.type,
      params.effectiveFrom || new Date().toISOString().split("T")[0],
      params.effectiveUntil || null,
    ]
  );

  const enriched = await pool.query<OwnershipRelationship>(
    `SELECT r.*,
            owner.name as owner_name,
            owned.name as owned_name,
            owned.slug as owned_slug,
            owned.type as owned_type
     FROM ownership_relationships r
     JOIN organizations owner ON r.owner_organization_id = owner.id
     JOIN organizations owned ON r.owned_organization_id = owned.id
     WHERE r.id = $1`,
    [id]
  );

  return enriched.rows[0];
}
