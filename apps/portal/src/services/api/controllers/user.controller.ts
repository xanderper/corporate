import { NextRequest } from "next/server";
import { BaseController } from "./base.controller";
import { userService } from "../services/user.service";
import { initializeDatabase } from "../core/database";

export class UserController extends BaseController {
  /**
   * GET /api/users
   */
  async listUsers() {
    try {
      await initializeDatabase();
      const data = await userService.listUsersAndInvitations();
      return this.ok(data);
    } catch (err) {
      return this.internalError(err, "Failed to retrieve user registry");
    }
  }

  /**
   * POST /api/users
   */
  async inviteUser(req: NextRequest) {
    try {
      await initializeDatabase();
      const body = await req.json();
      const { email, name, invitedBy } = body;

      if (!email || !name) {
        return this.error(
          "Email and name are required to invite a user",
          "VALIDATION_ERROR",
          400
        );
      }

      const host = req.headers.get("host") || "localhost:3203";
      const result = await userService.inviteUser(
        { email, name, invitedBy },
        host
      );

      return this.ok(result, 201);
    } catch (err) {
      return this.internalError(err, "Failed to generate invitation");
    }
  }

  /**
   * POST /api/users/[id]/suspend
   */
  async suspendUser(id: string, req: NextRequest) {
    try {
      await initializeDatabase();
      const body = await req.json().catch(() => ({}));
      const actorId = body.actorId || "Virex Administrator";

      const user = await userService.suspendUser(id, actorId);
      if (!user) {
        return this.error("User not found", "NOT_FOUND", 404);
      }

      return this.ok({ success: true, user });
    } catch (err) {
      return this.internalError(err, "Failed to suspend user");
    }
  }

  /**
   * POST /api/users/[id]/reactivate
   */
  async reactivateUser(id: string, req: NextRequest) {
    try {
      await initializeDatabase();
      const body = await req.json().catch(() => ({}));
      const actorId = body.actorId || "Virex Administrator";

      const user = await userService.reactivateUser(id, actorId);
      if (!user) {
        return this.error("User not found", "NOT_FOUND", 404);
      }

      return this.ok({ success: true, user });
    } catch (err) {
      return this.internalError(err, "Failed to reactivate user");
    }
  }

  /**
   * POST /api/users/invitations/[id]/resend
   */
  async resendInvitation(id: string, req: NextRequest) {
    try {
      await initializeDatabase();
      const body = await req.json().catch(() => ({}));
      const actorId = body.actorId || "Virex Administrator";
      const host = req.headers.get("host") || "localhost:3203";

      const result = await userService.resendInvitation(id, actorId, host);
      if (!result) {
        return this.error("Invitation not found", "NOT_FOUND", 404);
      }

      return this.ok(result);
    } catch (err) {
      return this.internalError(err, "Failed to renew invitation token");
    }
  }

  /**
   * POST /api/users/invitations/[id]/revoke
   */
  async revokeInvitation(id: string, req: NextRequest) {
    try {
      await initializeDatabase();
      const body = await req.json().catch(() => ({}));
      const actorId = body.actorId || "Virex Administrator";

      const invitation = await userService.revokeInvitation(id, actorId);
      if (!invitation) {
        return this.error("Invitation not found", "NOT_FOUND", 404);
      }

      return this.ok({ success: true, invitation });
    } catch (err) {
      return this.internalError(err, "Failed to revoke invitation");
    }
  }
}

export const userController = new UserController();
