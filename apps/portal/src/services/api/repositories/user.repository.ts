import { pool, generateId, generateToken, hashToken } from "../core/database";
import {
  VirexUser,
  VirexInvitation,
  UserStatus,
} from "../types/models";

export async function findUserByQorveId(
  qorveUserId: string
): Promise<VirexUser | null> {
  const result = await pool.query<VirexUser>(
    "SELECT * FROM users WHERE qorve_user_id = $1 LIMIT 1",
    [qorveUserId]
  );
  return result.rows[0] || null;
}

export async function findUserByEmail(email: string): Promise<VirexUser | null> {
  const result = await pool.query<VirexUser>(
    "SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1",
    [email]
  );
  return result.rows[0] || null;
}

export async function findUserById(id: string): Promise<VirexUser | null> {
  const result = await pool.query<VirexUser>(
    "SELECT * FROM users WHERE id = $1 LIMIT 1",
    [id]
  );
  return result.rows[0] || null;
}

export async function getAllUsers(): Promise<VirexUser[]> {
  const result = await pool.query<VirexUser>(
    "SELECT * FROM users ORDER BY created_at DESC"
  );
  return result.rows;
}

export async function createInvitedUser(params: {
  email: string;
  name: string;
}): Promise<VirexUser> {
  const id = generateId("usr");
  const result = await pool.query<VirexUser>(
    `INSERT INTO users (id, email, name, status)
     VALUES ($1, LOWER($2), $3, 'INVITED')
     ON CONFLICT (email) DO UPDATE
     SET name = EXCLUDED.name, updated_at = NOW()
     RETURNING *`,
    [id, params.email.trim(), params.name.trim()]
  );
  return result.rows[0];
}

export async function linkQorveUser(params: {
  email: string;
  qorveUserId: string;
  name?: string;
  avatarUrl?: string | null;
}): Promise<VirexUser> {
  const result = await pool.query<VirexUser>(
    `UPDATE users
     SET qorve_user_id = $1,
         name = COALESCE($2, name),
         avatar_url = COALESCE($3, avatar_url),
         status = 'ACTIVE',
         last_login_at = NOW(),
         updated_at = NOW()
     WHERE LOWER(email) = LOWER($4)
     RETURNING *`,
    [params.qorveUserId, params.name || null, params.avatarUrl || null, params.email]
  );
  return result.rows[0];
}

export async function updateUserLastLogin(
  qorveUserId: string,
  updates?: { name?: string; avatarUrl?: string | null }
): Promise<VirexUser | null> {
  const result = await pool.query<VirexUser>(
    `UPDATE users
     SET last_login_at = NOW(),
         name = COALESCE($2, name),
         avatar_url = COALESCE($3, avatar_url),
         updated_at = NOW()
     WHERE qorve_user_id = $1
     RETURNING *`,
    [qorveUserId, updates?.name || null, updates?.avatarUrl || null]
  );
  return result.rows[0] || null;
}

export async function setUserStatus(
  userId: string,
  status: UserStatus
): Promise<VirexUser | null> {
  const result = await pool.query<VirexUser>(
    `UPDATE users
     SET status = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [status, userId]
  );
  return result.rows[0] || null;
}

/**
 * Invitation operations
 */
export async function createInvitation(params: {
  email: string;
  invitedBy: string;
  expiresInDays?: number;
}): Promise<{ invitation: VirexInvitation; rawToken: string }> {
  const rawToken = generateToken();
  const tokenHash = hashToken(rawToken);
  const id = generateId("inv");
  const days = params.expiresInDays || 7;

  const result = await pool.query<VirexInvitation>(
    `INSERT INTO invitations (id, email, invited_by, status, token_hash, expires_at)
     VALUES ($1, LOWER($2), $3, 'PENDING', $4, NOW() + INTERVAL '${days} days')
     RETURNING *`,
    [id, params.email.trim(), params.invitedBy, tokenHash]
  );

  return { invitation: result.rows[0], rawToken };
}

export async function findInvitationByTokenHash(
  tokenHash: string
): Promise<VirexInvitation | null> {
  const result = await pool.query<VirexInvitation>(
    "SELECT * FROM invitations WHERE token_hash = $1 LIMIT 1",
    [tokenHash]
  );
  return result.rows[0] || null;
}

export async function getAllInvitations(): Promise<VirexInvitation[]> {
  const result = await pool.query<VirexInvitation>(
    "SELECT * FROM invitations ORDER BY created_at DESC"
  );
  return result.rows;
}

export async function acceptInvitation(
  invitationId: string
): Promise<VirexInvitation | null> {
  const result = await pool.query<VirexInvitation>(
    `UPDATE invitations
     SET status = 'ACCEPTED', accepted_at = NOW()
     WHERE id = $1 AND status = 'PENDING'
     RETURNING *`,
    [invitationId]
  );
  return result.rows[0] || null;
}

export async function revokeInvitation(
  invitationId: string
): Promise<VirexInvitation | null> {
  const result = await pool.query<VirexInvitation>(
    `UPDATE invitations
     SET status = 'REVOKED'
     WHERE id = $1
     RETURNING *`,
    [invitationId]
  );
  return result.rows[0] || null;
}

export async function renewInvitationToken(
  invitationId: string,
  expiresInDays: number = 7
): Promise<{ invitation: VirexInvitation | null; rawToken: string }> {
  const rawToken = generateToken();
  const tokenHash = hashToken(rawToken);

  const result = await pool.query<VirexInvitation>(
    `UPDATE invitations
     SET status = 'PENDING',
         token_hash = $1,
         expires_at = NOW() + INTERVAL '${expiresInDays} days'
     WHERE id = $2
     RETURNING *`,
    [tokenHash, invitationId]
  );

  return { invitation: result.rows[0] || null, rawToken };
}
