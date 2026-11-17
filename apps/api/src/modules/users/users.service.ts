import { Injectable, NotFoundException } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import { users, invitations, auditLogs } from "../../database/schema";
import { eq, desc, sql } from "drizzle-orm";
import { InviteUserDto } from "./dto/invite-user.dto";

@Injectable()
export class UsersService {
  constructor(private readonly db: DatabaseService) {}

  private get orm() {
    return this.db.db;
  }

  async listUsersAndInvitations() {
    const [allUsers, allInvitations] = await Promise.all([
      this.orm.select().from(users).orderBy(desc(users.createdAt)),
      this.orm.select().from(invitations).orderBy(desc(invitations.createdAt)),
    ]);

    return { users: allUsers, invitations: allInvitations };
  }

  async inviteUser(dto: InviteUserDto, hostHeader?: string) {
    const cleanEmail = dto.email.trim().toLowerCase();
    const invitedBy = dto.invitedBy || "Virex Administrator";

    // 1. Upsert user record
    const [user] = await this.orm
      .insert(users)
      .values({
        id: this.db.generateId("usr"),
        email: cleanEmail,
        name: dto.name.trim(),
        status: "INVITED",
      })
      .onConflictDoUpdate({
        target: users.email,
        set: { name: sql`EXCLUDED.name`, updatedAt: new Date() },
      })
      .returning();

    // 2. Create invitation
    const rawToken = this.db.generateToken();
    const tokenHash = this.db.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const [invitation] = await this.orm
      .insert(invitations)
      .values({
        id: this.db.generateId("inv"),
        email: cleanEmail,
        invitedBy,
        status: "PENDING",
        tokenHash,
        expiresAt,
      })
      .returning();

    // 3. Audit
    await this.orm.insert(auditLogs).values({
      id: this.db.generateId("aud"),
      actorId: invitedBy,
      action: "user.invited",
      targetId: user.id,
      details: {
        email: cleanEmail,
        name: user.name,
        invitationId: invitation.id,
        expiresAt: invitation.expiresAt,
      },
    });

    const host = hostHeader || "localhost:3203";
    const protocol = host.includes("localhost") ? "http" : "https";

    return {
      user,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        expiresAt: invitation.expiresAt,
        status: invitation.status,
      },
      inviteUrl: `${protocol}://${host}/invite/${rawToken}`,
    };
  }

  async suspendUser(id: string, actorId = "Virex Administrator") {
    const [user] = await this.orm
      .update(users)
      .set({ status: "SUSPENDED", updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    if (!user) throw new NotFoundException("User not found");

    await this.orm.insert(auditLogs).values({
      id: this.db.generateId("aud"),
      actorId,
      action: "user.suspended",
      targetId: id,
      details: { email: user.email, name: user.name },
    });

    return user;
  }

  async reactivateUser(id: string, actorId = "Virex Administrator") {
    const [user] = await this.orm
      .update(users)
      .set({ status: "ACTIVE", updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    if (!user) throw new NotFoundException("User not found");

    await this.orm.insert(auditLogs).values({
      id: this.db.generateId("aud"),
      actorId,
      action: "user.reactivated",
      targetId: id,
      details: { email: user.email, name: user.name },
    });

    return user;
  }

  async resendInvitation(id: string, actorId = "Virex Administrator", hostHeader?: string) {
    const rawToken = this.db.generateToken();
    const tokenHash = this.db.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const [invitation] = await this.orm
      .update(invitations)
      .set({ status: "PENDING", tokenHash, expiresAt })
      .where(eq(invitations.id, id))
      .returning();

    if (!invitation) throw new NotFoundException("Invitation not found");

    await this.orm.insert(auditLogs).values({
      id: this.db.generateId("aud"),
      actorId,
      action: "invitation.renewed",
      targetId: id,
      details: { email: invitation.email },
    });

    const host = hostHeader || "localhost:3203";
    const protocol = host.includes("localhost") ? "http" : "https";

    return { invitation, inviteUrl: `${protocol}://${host}/invite/${rawToken}` };
  }

  async revokeInvitation(id: string, actorId = "Virex Administrator") {
    const [invitation] = await this.orm
      .update(invitations)
      .set({ status: "REVOKED" })
      .where(eq(invitations.id, id))
      .returning();

    if (!invitation) throw new NotFoundException("Invitation not found");

    await this.orm.insert(auditLogs).values({
      id: this.db.generateId("aud"),
      actorId,
      action: "invitation.revoked",
      targetId: id,
      details: { email: invitation.email },
    });

    return invitation;
  }
}
