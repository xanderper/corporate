import { NextRequest } from "next/server";
import { BaseController } from "./base.controller";
import { orgService } from "../services/org.service";
import { initializeDatabase } from "../core/database";

export class OrgController extends BaseController {
  /** GET /api/organizations */
  async getStructure() {
    try {
      await initializeDatabase();
      const data = await orgService.getGroupStructure();
      return this.ok(data);
    } catch (err) {
      return this.internalError(err, "Failed to load corporate hierarchy");
    }
  }

  /** POST /api/organizations */
  async createOrganization(req: NextRequest) {
    try {
      await initializeDatabase();
      const body = await req.json();

      if (!body?.name || !body?.legalName) {
        return this.error("name and legalName are required", "VALIDATION_ERROR", 400);
      }

      const organization = await orgService.createOrganization({
        name: body.name,
        legalName: body.legalName,
        slug: body.slug,
        type: body.type,
        description: body.description,
        logoUrl: body.logoUrl,
        isPublic: body.isPublic,
      });

      return this.ok({ organization }, 201);
    } catch (err: any) {
      if (err?.status === 409) return this.error(err.message, "CONFLICT", 409);
      return this.internalError(err, "Failed to register organization");
    }
  }

  /** GET /api/organizations/[slug] */
  async getOrganization(slug: string) {
    try {
      await initializeDatabase();
      const data = await orgService.getOrganizationDetails(slug);
      if (!data.organization) {
        return this.error("Organization not found", "NOT_FOUND", 404);
      }
      return this.ok(data);
    } catch (err) {
      return this.internalError(err, "Failed to retrieve organization details");
    }
  }

  /** GET /api/user/memberships */
  async getUserMemberships(req: NextRequest) {
    try {
      await initializeDatabase();
      const searchParams = req.nextUrl.searchParams;
      const qorveUserId = searchParams.get("qorveUserId");
      const email = searchParams.get("email");

      if (!qorveUserId && !email) {
        return this.error(
          "User identity required (qorveUserId or email)",
          "VALIDATION_ERROR",
          400
        );
      }

      const data = await orgService.getUserMembershipsAndAccessibleOrgs({
        qorveUserId,
        email,
      });

      return this.ok(data);
    } catch (err) {
      return this.internalError(err, "Failed to retrieve user memberships");
    }
  }

  /** POST /api/organizations/ownership */
  async addOwnership(req: NextRequest) {
    try {
      await initializeDatabase();
      const body = await req.json();

      if (!body?.ownerSlug || !body?.ownedSlug || !body?.ownershipPercentage) {
        return this.error(
          "ownerSlug, ownedSlug, and ownershipPercentage are required",
          "VALIDATION_ERROR",
          400
        );
      }

      const result = await orgService.addOwnership({
        ownerSlug: body.ownerSlug,
        ownedSlug: body.ownedSlug,
        ownershipPercentage: Number(body.ownershipPercentage),
        relationshipType: body.relationshipType,
        effectiveFrom: body.effectiveFrom,
        effectiveUntil: body.effectiveUntil,
      });

      return this.ok(result, 201);
    } catch (err: any) {
      if (err?.status === 404) return this.error(err.message, "NOT_FOUND", 404);
      if (err?.status === 400) return this.error(err.message, "BAD_REQUEST", 400);
      return this.internalError(err, "Failed to record ownership relationship");
    }
  }
}

export const orgController = new OrgController();
