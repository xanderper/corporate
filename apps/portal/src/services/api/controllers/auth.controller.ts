import { NextRequest } from "next/server";
import { BaseController } from "./base.controller";
import { authService } from "../services/auth.service";
import { initializeDatabase } from "../core/database";

export class AuthController extends BaseController {
  /**
   * GET /api/auth/me
   */
  async getMe(req: NextRequest) {
    try {
      await initializeDatabase();
      const searchParams = req.nextUrl.searchParams;
      const qorveUserId = searchParams.get("qorveUserId");
      const email = searchParams.get("email");

      if (!qorveUserId && !email) {
        return this.error(
          "Missing identity identifier (qorveUserId or email)",
          "BAD_REQUEST",
          400
        );
      }

      const result = await authService.getIdentity({ qorveUserId, email });

      if (!result.exists || !result.user) {
        return this.ok({
          exists: false,
          status: "NOT_INVITED",
          message: "No Virex access record found for this identity",
        });
      }

      return this.ok({
        exists: true,
        user: {
          id: result.user.id,
          qorveUserId: result.user.qorve_user_id,
          email: result.user.email,
          name: result.user.name,
          avatarUrl: result.user.avatar_url,
          status: result.user.status,
          lastLoginAt: result.user.last_login_at,
          createdAt: result.user.created_at,
        },
      });
    } catch (err) {
      return this.internalError(err, "Failed to resolve identity");
    }
  }

  /**
   * POST /api/auth/synchronize
   */
  async synchronize(req: NextRequest) {
    try {
      await initializeDatabase();
      const body = await req.json();
      const { qorveUserId, email, name, avatarUrl } = body;

      if (!qorveUserId || !email) {
        return this.error(
          "qorveUserId and email are required",
          "VALIDATION_ERROR",
          400
        );
      }

      const result = await authService.synchronize({
        qorveUserId,
        email,
        name,
        avatarUrl,
      });

      if (!result.allowed) {
        return this.error(
          result.message || "Access denied to Virex Portal",
          result.reason || "FORBIDDEN",
          403,
          { reason: result.reason }
        );
      }

      return this.ok({
        allowed: true,
        user: result.user
          ? {
              id: result.user.id,
              qorveUserId: result.user.qorve_user_id,
              email: result.user.email,
              name: result.user.name,
              avatarUrl: result.user.avatar_url,
              status: result.user.status,
              lastLoginAt: result.user.last_login_at,
            }
          : null,
      });
    } catch (err) {
      return this.internalError(err, "Failed to synchronize user session");
    }
  }

  /**
   * GET /api/invite/[token]
   */
  async getInvite(token: string) {
    try {
      await initializeDatabase();
      if (!token) {
        return this.error("Token is required", "BAD_REQUEST", 400);
      }

      const result = await authService.verifyInvitation(token);

      if (!result.valid) {
        const statusCode =
          result.reason === "NOT_FOUND"
            ? 404
            : result.reason === "ALREADY_ACCEPTED"
            ? 409
            : 410;

        return this.error(
          result.message || "Invalid invitation",
          result.reason || "INVALID_INVITATION",
          statusCode
        );
      }

      return this.ok({
        valid: true,
        invitation: result.invitation,
      });
    } catch (err) {
      return this.internalError(err, "Failed to verify invitation token");
    }
  }

  /**
   * POST /api/invite/[token]
   */
  async acceptInvite(token: string, req: NextRequest) {
    try {
      await initializeDatabase();
      const body = await req.json();
      const { qorveUserId, email, name, avatarUrl } = body;

      if (!token) {
        return this.error("Token is required", "BAD_REQUEST", 400);
      }

      if (!qorveUserId || !email) {
        return this.error(
          "qorveUserId and email are required to accept an invitation",
          "VALIDATION_ERROR",
          400
        );
      }

      const result = await authService.acceptInvitation({
        token,
        qorveUserId,
        email,
        name,
        avatarUrl,
      });

      if (!result.success || !result.user) {
        return this.error(
          result.error || "Failed to accept invitation",
          "INVITATION_ERROR",
          result.status || 400
        );
      }

      return this.ok({
        success: true,
        user: {
          id: result.user.id,
          qorveUserId: result.user.qorve_user_id,
          email: result.user.email,
          name: result.user.name,
          status: result.user.status,
        },
      });
    } catch (err) {
      return this.internalError(err, "Failed to process invitation acceptance");
    }
  }
}

export const authController = new AuthController();
