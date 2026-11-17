import {
  getAllUsers,
  getAllInvitations,
  createInvitedUser,
  createInvitation,
  setUserStatus,
  renewInvitationToken,
  revokeInvitation as revokeInvitationDb,
} from "../repositories/user.repository";
import { recordAuditLog } from "../repositories/audit.repository";
import { VirexUser, VirexInvitation } from "../types/models";
import { InviteUserDTO } from "../types/dtos";

export class UserService {
  /**
   * Retrieves all registered users and invitations
   */
  async listUsersAndInvitations(): Promise<{
    users: VirexUser[];
    invitations: VirexInvitation[];
  }> {
    const [users, invitations] = await Promise.all([
      getAllUsers(),
      getAllInvitations(),
    ]);
    return { users, invitations };
  }

  /**
   * Invites a new user to Virex Portal
   */
  async inviteUser(
    dto: InviteUserDTO,
    hostHeader?: string | null
  ): Promise<{
    success: boolean;
    user: VirexUser;
    invitation: VirexInvitation;
    inviteUrl: string;
  }> {
    const cleanEmail = dto.email.trim().toLowerCase();
    const invitedBy = dto.invitedBy || "Virex Administrator";

    // 1. Create or update invited user record
    const user = await createInvitedUser({
      email: cleanEmail,
      name: dto.name.trim(),
    });

    // 2. Generate secure token & invitation
    const { invitation, rawToken } = await createInvitation({
      email: cleanEmail,
      invitedBy,
      expiresInDays: dto.expiresInDays || 7,
    });

    // 3. Record audit log
    await recordAuditLog({
      actorId: invitedBy,
      action: "user.invited",
      targetId: user.id,
      details: {
        email: cleanEmail,
        name: user.name,
        invitationId: invitation.id,
        expiresAt: invitation.expires_at,
      },
    });

    const host = hostHeader || "localhost:3203";
    const protocol = host.includes("localhost") ? "http" : "https";
    const inviteUrl = `${protocol}://${host}/invite/${rawToken}`;

    return {
      success: true,
      user,
      invitation,
      inviteUrl,
    };
  }

  /**
   * Suspends a user
   */
  async suspendUser(
    userId: string,
    actorId = "Virex Administrator"
  ): Promise<VirexUser | null> {
    const user = await setUserStatus(userId, "SUSPENDED");
    if (!user) return null;

    await recordAuditLog({
      actorId,
      action: "user.suspended",
      targetId: userId,
      details: { email: user.email, name: user.name },
    });

    return user;
  }

  /**
   * Reactivates a suspended user
   */
  async reactivateUser(
    userId: string,
    actorId = "Virex Administrator"
  ): Promise<VirexUser | null> {
    const user = await setUserStatus(userId, "ACTIVE");
    if (!user) return null;

    await recordAuditLog({
      actorId,
      action: "user.reactivated",
      targetId: userId,
      details: { email: user.email, name: user.name },
    });

    return user;
  }

  /**
   * Resends / renews an invitation token
   */
  async resendInvitation(
    invitationId: string,
    actorId = "Virex Administrator",
    hostHeader?: string | null
  ): Promise<{ success: boolean; invitation: VirexInvitation; inviteUrl: string } | null> {
    const { invitation, rawToken } = await renewInvitationToken(invitationId, 7);
    if (!invitation) return null;

    await recordAuditLog({
      actorId,
      action: "invitation.renewed",
      targetId: invitationId,
      details: {
        email: invitation.email,
        expiresAt: invitation.expires_at,
      },
    });

    const host = hostHeader || "localhost:3203";
    const protocol = host.includes("localhost") ? "http" : "https";
    const inviteUrl = `${protocol}://${host}/invite/${rawToken}`;

    return {
      success: true,
      invitation,
      inviteUrl,
    };
  }

  /**
   * Revokes a pending invitation
   */
  async revokeInvitation(
    invitationId: string,
    actorId = "Virex Administrator"
  ): Promise<VirexInvitation | null> {
    const invitation = await revokeInvitationDb(invitationId);
    if (!invitation) return null;

    await recordAuditLog({
      actorId,
      action: "invitation.revoked",
      targetId: invitationId,
      details: { email: invitation.email },
    });

    return invitation;
  }
}

export const userService = new UserService();
