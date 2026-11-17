import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  GoneException,
  ConflictException,
} from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import {
  users,
  invitations,
  auditLogs,
} from "../../database/schema";
import { eq, sql } from "drizzle-orm";
import { SynchronizeDto } from "./dto/synchronize.dto";
import { AcceptInviteDto } from "./dto/accept-invite.dto";

@Injectable()
export class AuthService {
  constructor(private readonly db: DatabaseService) {}

  private get orm() {
    return this.db.db;
  }

  async getIdentity(qorveUserId?: string, email?: string) {
    if (!qorveUserId && !email) {
      throw new BadRequestException("Missing identity identifier (qorveUserId or email)");
    }

    let user = qorveUserId
      ? await this.orm.query.users.findFirst({
          where: eq(users.qorveUserId, qorveUserId),
        })
      : null;

    if (!user && email) {
      user = await this.orm.query.users.findFirst({
        where: eq(sql`LOWER(${users.email})`, email.trim().toLowerCase()),
      });
    }

    if (!user) {
      return { exists: false, status: "NOT_INVITED", message: "No Virex access record found" };
    }

    return {
      exists: true,
      user: {
        id: user.id,
        qorveUserId: user.qorveUserId,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        status: user.status,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
      },
    };
  }

  async synchronize(dto: SynchronizeDto) {
    const { qorveUserId, email, name, avatarUrl } = dto;

    // 1. Try to find by Qorve ID
    let user = await this.orm.query.users.findFirst({
      where: eq(users.qorveUserId, qorveUserId),
    });

    // 2. Fallback: find by email and link Qorve identity
    if (!user) {
      const byEmail = await this.orm.query.users.findFirst({
        where: eq(sql`LOWER(${users.email})`, email.trim().toLowerCase()),
      });

      if (byEmail) {
        if (byEmail.status === "SUSPENDED") {
          await this.logAudit(qorveUserId, "auth.login_rejected_suspended", byEmail.id, {
            email,
            reason: "Account is suspended",
          });
          throw new ForbiddenException("Your Virex account has been suspended.");
        }

        const [linked] = await this.orm
          .update(users)
          .set({
            qorveUserId,
            name: name || byEmail.name,
            avatarUrl: avatarUrl ?? byEmail.avatarUrl,
            status: "ACTIVE",
            lastLoginAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(sql`LOWER(${users.email})`, email.trim().toLowerCase()))
          .returning();

        user = linked;
        await this.logAudit(qorveUserId, "user.linked_qorve_identity", user.id, {
          email,
          qorveUserId,
        });
      }
    }

    // 3. Deny uninvited
    if (!user) {
      await this.logAudit(qorveUserId, "auth.login_rejected_uninvited", null, { email, qorveUserId });
      throw new ForbiddenException(
        "Your account is not yet invited to Virex Portal. Contact your administrator."
      );
    }

    // 4. Deny suspended
    if (user.status === "SUSPENDED") {
      await this.logAudit(qorveUserId, "auth.login_rejected_suspended", user.id, { email });
      throw new ForbiddenException("Your Virex account has been suspended.");
    }

    // 5. Update last login
    const [activeUser] = await this.orm
      .update(users)
      .set({
        lastLoginAt: new Date(),
        name: name || user.name,
        avatarUrl: avatarUrl !== undefined ? avatarUrl : user.avatarUrl,
        updatedAt: new Date(),
      })
      .where(eq(users.qorveUserId, qorveUserId))
      .returning();

    await this.logAudit(qorveUserId, "auth.synchronize_success", activeUser.id, {
      email,
      lastLoginAt: activeUser.lastLoginAt,
    });

    return {
      allowed: true,
      user: {
        id: activeUser.id,
        qorveUserId: activeUser.qorveUserId,
        email: activeUser.email,
        name: activeUser.name,
        avatarUrl: activeUser.avatarUrl,
        status: activeUser.status,
        lastLoginAt: activeUser.lastLoginAt,
      },
    };
  }

  async verifyInvitation(token: string) {
    if (!token) throw new BadRequestException("Token is required");

    const tokenHash = this.db.hashToken(token);
    const invitation = await this.orm.query.invitations.findFirst({
      where: eq(invitations.tokenHash, tokenHash),
    });

    if (!invitation) throw new NotFoundException("Invitation not found");
    if (invitation.status === "REVOKED") throw new GoneException("This invitation has been revoked");
    if (invitation.status === "ACCEPTED") throw new ConflictException("This invitation has already been used");
    if (new Date(invitation.expiresAt) < new Date()) throw new GoneException("This invitation has expired");

    return {
      valid: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        invitedBy: invitation.invitedBy,
        expiresAt: invitation.expiresAt,
      },
    };
  }

  async acceptInvitation(token: string, dto: AcceptInviteDto) {
    const { qorveUserId, email, name, avatarUrl } = dto;
    const tokenHash = this.db.hashToken(token);

    const invitation = await this.orm.query.invitations.findFirst({
      where: eq(invitations.tokenHash, tokenHash),
    });

    if (!invitation) throw new NotFoundException("Invalid invitation");
    if (invitation.status !== "PENDING") {
      throw new BadRequestException(`This invitation is no longer active (${invitation.status})`);
    }
    if (new Date(invitation.expiresAt) < new Date()) throw new GoneException("This invitation has expired");

    if (invitation.email.trim().toLowerCase() !== email.trim().toLowerCase()) {
      await this.logAudit(qorveUserId, "invitation.rejected_identity_mismatch", invitation.id, {
        invitationEmail: invitation.email,
        authenticatedEmail: email,
      });
      throw new ForbiddenException(
        `This invitation was issued to ${invitation.email}, but you authenticated with ${email}.`
      );
    }

    // Mark accepted
    await this.orm
      .update(invitations)
      .set({ status: "ACCEPTED", acceptedAt: new Date() })
      .where(eq(invitations.id, invitation.id));

    // Link user
    const [user] = await this.orm
      .update(users)
      .set({
        qorveUserId,
        name: name || undefined,
        avatarUrl: avatarUrl || undefined,
        status: "ACTIVE",
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(sql`LOWER(${users.email})`, email.trim().toLowerCase()))
      .returning();

    await this.logAudit(qorveUserId, "invitation.accepted", user.id, {
      invitationId: invitation.id,
      email,
      qorveUserId,
    });

    return {
      success: true,
      user: { id: user.id, qorveUserId: user.qorveUserId, email: user.email, name: user.name, status: user.status },
    };
  }

  private async logAudit(actorId: string, action: string, targetId: string | null, details: object) {
    await this.orm.insert(auditLogs).values({
      id: this.db.generateId("aud"),
      actorId,
      action,
      targetId: targetId ?? undefined,
      details,
    });
  }
}
