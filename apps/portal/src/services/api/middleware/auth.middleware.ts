import { NextRequest } from "next/server";
import { findUserByQorveId, findUserByEmail } from "../repositories/user.repository";
import { getUserMemberships } from "../repositories/membership.repository";
import { VirexUser, Membership, Role } from "../types/models";

export interface AuthenticatedContext {
  user: VirexUser;
  memberships: Membership[];
  isHoldingExecutive: boolean;
}

export class AuthMiddleware {
  /**
   * Resolves caller identity from request headers or query params
   */
  async resolveCaller(req: NextRequest): Promise<AuthenticatedContext | null> {
    const qorveUserId =
      req.headers.get("x-qorve-user-id") ||
      req.nextUrl.searchParams.get("qorveUserId");
    const email =
      req.headers.get("x-user-email") ||
      req.nextUrl.searchParams.get("email");

    if (!qorveUserId && !email) {
      return null;
    }

    let user: VirexUser | null = null;
    if (qorveUserId) user = await findUserByQorveId(qorveUserId);
    if (!user && email) user = await findUserByEmail(email);

    if (!user || user.status !== "ACTIVE") {
      return null;
    }

    const memberships = await getUserMemberships(user.id);
    const isHoldingExecutive = memberships.some(
      (m) =>
        m.organization_slug === "virex-holding" &&
        (m.role === "OWNER" || m.role === "DIRECTOR" || m.role === "ADMIN")
    );

    return {
      user,
      memberships,
      isHoldingExecutive,
    };
  }

  /**
   * Verifies that the caller has one of the allowed roles for the target organization
   */
  hasOrgAccess(
    context: AuthenticatedContext,
    organizationId: string,
    allowedRoles?: Role[]
  ): boolean {
    if (context.isHoldingExecutive) return true;

    const membership = context.memberships.find(
      (m) => m.organization_id === organizationId
    );
    if (!membership) return false;

    if (!allowedRoles || allowedRoles.length === 0) return true;

    return allowedRoles.includes(membership.role);
  }
}

export const authMiddleware = new AuthMiddleware();
