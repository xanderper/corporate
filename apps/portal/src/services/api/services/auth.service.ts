import {
  findUserByQorveId,
  findUserByEmail,
  linkQorveUser,
  updateUserLastLogin,
  findInvitationByTokenHash,
  acceptInvitation as markInvitationAccepted,
} from "../repositories/user.repository";
import { recordAuditLog } from "../repositories/audit.repository";
import { hashToken } from "../core/database";
import { VirexUser } from "../types/models";
import { SynchronizeUserDTO } from "../types/dtos";

export interface SyncResult {
  allowed: boolean;
  user?: VirexUser;
  reason?: "NOT_INVITED" | "SUSPENDED";
  message?: string;
}

export interface VerifyInviteResult {
  valid: boolean;
  reason?: "NOT_FOUND" | "REVOKED" | "ALREADY_ACCEPTED" | "EXPIRED";
  message?: string;
  invitation?: {
    id: string;
    email: string;
    invitedBy: string;
    expiresAt: string;
  };
}

export class AuthService {
  /**
   * Retrieves identity information by Qorve ID or verified email
   */
  async getIdentity(params: {
    qorveUserId?: string | null;
    email?: string | null;
  }): Promise<{ exists: boolean; user?: VirexUser; status?: string; message?: string }> {
    const { qorveUserId, email } = params;

    let user: VirexUser | null = null;
    if (qorveUserId) {
      user = await findUserByQorveId(qorveUserId);
    }
    if (!user && email) {
      user = await findUserByEmail(email);
    }

    if (!user) {
      return {
        exists: false,
        status: "NOT_INVITED",
        message: "No Virex access record found for this identity",
      };
    }

    return {
      exists: true,
      user,
    };
  }

  /**
   * Synchronizes an authenticated Qorve user with the Virex access layer
   */
  async synchronize(dto: SynchronizeUserDTO): Promise<SyncResult> {
    const { qorveUserId, email, name, avatarUrl } = dto;

    // 1. Check if user already exists linked to this Qorve ID
    let user = await findUserByQorveId(qorveUserId);

    // 2. If not found by Qorve ID, check by verified email (invitation flow or initial sync)
    if (!user) {
      const userByEmail = await findUserByEmail(email);

      if (userByEmail) {
        if (userByEmail.status === "SUSPENDED") {
          await recordAuditLog({
            actorId: qorveUserId,
            action: "auth.login_rejected_suspended",
            targetId: userByEmail.id,
            details: { email, reason: "Account is suspended" },
          });

          return {
            allowed: false,
            reason: "SUSPENDED",
            message: "Your Virex account has been suspended by an administrator.",
          };
        }

        // Link the Qorve account to this Virex user record and transition to ACTIVE
        user = await linkQorveUser({
          email,
          qorveUserId,
          name: name || userByEmail.name,
          avatarUrl,
        });

        await recordAuditLog({
          actorId: qorveUserId,
          action: "user.linked_qorve_identity",
          targetId: user.id,
          details: { email, qorveUserId, previousStatus: userByEmail.status },
        });
      }
    }

    // 3. If still no user exists, deny entry. Arbitrary Qorve users CANNOT enter.
    if (!user) {
      await recordAuditLog({
        actorId: qorveUserId,
        action: "auth.login_rejected_uninvited",
        details: { email, qorveUserId },
      });

      return {
        allowed: false,
        reason: "NOT_INVITED",
        message:
          "Your Qorve account is authenticated, but you haven't been invited to Virex Portal. Please contact your Virex administrator.",
      };
    }

    // 4. If user is suspended, strictly deny entry
    if (user.status === "SUSPENDED") {
      await recordAuditLog({
        actorId: qorveUserId,
        action: "auth.login_rejected_suspended",
        targetId: user.id,
        details: { email },
      });

      return {
        allowed: false,
        reason: "SUSPENDED",
        message: "Your Virex account has been suspended by an administrator.",
      };
    }

    // 5. Update user synchronization and last login timestamp
    const updated = await updateUserLastLogin(qorveUserId, {
      name: name || user.name,
      avatarUrl: avatarUrl !== undefined ? avatarUrl : user.avatar_url,
    });

    const activeUser = updated || user;

    await recordAuditLog({
      actorId: qorveUserId,
      action: "auth.synchronize_success",
      targetId: activeUser.id,
      details: { email, lastLoginAt: activeUser.last_login_at },
    });

    return {
      allowed: true,
      user: activeUser,
    };
  }

  /**
   * Verifies an invitation token
   */
  async verifyInvitation(token: string): Promise<VerifyInviteResult> {
    const tokenHash = hashToken(token);
    const invitation = await findInvitationByTokenHash(tokenHash);

    if (!invitation) {
      return { valid: false, reason: "NOT_FOUND", message: "Invitation not found" };
    }

    if (invitation.status === "REVOKED") {
      return { valid: false, reason: "REVOKED", message: "This invitation has been revoked" };
    }

    if (invitation.status === "ACCEPTED") {
      return { valid: false, reason: "ALREADY_ACCEPTED", message: "This invitation has already been used" };
    }

    const now = new Date();
    const expiresAt = new Date(invitation.expires_at);
    if (expiresAt < now) {
      return { valid: false, reason: "EXPIRED", message: "This invitation has expired" };
    }

    return {
      valid: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        invitedBy: invitation.invited_by,
        expiresAt: invitation.expires_at,
      },
    };
  }

  /**
   * Accepts an invitation and transitions user to ACTIVE
   */
  async acceptInvitation(params: {
    token: string;
    qorveUserId: string;
    email: string;
    name?: string;
    avatarUrl?: string | null;
  }): Promise<{ success: boolean; user?: VirexUser; error?: string; status?: number }> {
    const { token, qorveUserId, email, name, avatarUrl } = params;

    const tokenHash = hashToken(token);
    const invitation = await findInvitationByTokenHash(tokenHash);

    if (!invitation) {
      return { success: false, error: "Invalid invitation", status: 404 };
    }

    if (invitation.status !== "PENDING") {
      return {
        success: false,
        error: `This invitation is no longer active (status: ${invitation.status})`,
        status: 400,
      };
    }

    const now = new Date();
    if (new Date(invitation.expires_at) < now) {
      return { success: false, error: "This invitation has expired", status: 410 };
    }

    // CRITICAL IDENTITY CHECK:
    // invitation.email must match authenticated Qorve user's verified email.
    if (invitation.email.trim().toLowerCase() !== email.trim().toLowerCase()) {
      await recordAuditLog({
        actorId: qorveUserId,
        action: "invitation.rejected_identity_mismatch",
        targetId: invitation.id,
        details: {
          invitationEmail: invitation.email,
          authenticatedEmail: email,
          qorveUserId,
        },
      });

      return {
        success: false,
        error: `This invitation was issued to ${invitation.email}, but you authenticated with ${email}. Access denied.`,
        status: 403,
      };
    }

    // 1. Mark invitation as accepted (single-use)
    await markInvitationAccepted(invitation.id);

    // 2. Link Qorve user to Virex user and set status to ACTIVE
    const virexUser = await linkQorveUser({
      email,
      qorveUserId,
      name,
      avatarUrl,
    });

    // 3. Record audit log
    await recordAuditLog({
      actorId: qorveUserId,
      action: "invitation.accepted",
      targetId: virexUser.id,
      details: {
        invitationId: invitation.id,
        email,
        qorveUserId,
      },
    });

    return {
      success: true,
      user: virexUser,
    };
  }
}

export const authService = new AuthService();
