import { pool, generateId } from "../core/database";
import { Membership, Role } from "../types/models";

export async function getUserMemberships(userId: string): Promise<Membership[]> {
  const result = await pool.query<Membership>(`
    SELECT m.*,
           o.name as organization_name,
           o.slug as organization_slug,
           o.type as organization_type
    FROM memberships m
    JOIN organizations o ON m.organization_id = o.id
    WHERE m.user_id = $1 AND m.status = 'ACTIVE'
    ORDER BY o.type ASC, o.name ASC
  `, [userId]);
  return result.rows;
}

export async function getOrganizationMembers(organizationId: string): Promise<Membership[]> {
  const result = await pool.query<Membership>(`
    SELECT m.*,
           u.name as user_name,
           u.email as user_email
    FROM memberships m
    JOIN users u ON m.user_id = u.id
    WHERE m.organization_id = $1
    ORDER BY m.role ASC, u.name ASC
  `, [organizationId]);
  return result.rows;
}

export async function createMembership(params: {
  userId: string;
  organizationId: string;
  role: Role;
  title?: string;
}): Promise<Membership> {
  const id = generateId("mem");
  const result = await pool.query<Membership>(`
    INSERT INTO memberships (id, user_id, organization_id, role, title, status)
    VALUES ($1, $2, $3, $4, $5, 'ACTIVE')
    ON CONFLICT (user_id, organization_id) DO UPDATE
    SET role = EXCLUDED.role, title = EXCLUDED.title, updated_at = NOW()
    RETURNING *
  `, [id, params.userId, params.organizationId, params.role, params.title || null]);
  return result.rows[0];
}

export async function updateMembershipStatus(
  membershipId: string,
  status: "ACTIVE" | "SUSPENDED"
): Promise<Membership | null> {
  const result = await pool.query<Membership>(`
    UPDATE memberships
    SET status = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING *
  `, [status, membershipId]);
  return result.rows[0] || null;
}
