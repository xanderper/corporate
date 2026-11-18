import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  Headers,
} from "@nestjs/common";
import { OrganizationsService } from "./organizations.service";
import { CreateOrganizationDto } from "./dto/create-organization.dto";
import { AddOwnershipDto } from "./dto/add-ownership.dto";

@Controller()
export class OrganizationsController {
  constructor(private readonly orgService: OrganizationsService) {}

  // ─── Read ─────────────────────────────────────────────────────────────────

  @Get("organizations")
  async getStructure() {
    return this.orgService.getGroupStructure();
  }

  @Get("organizations/:slug")
  async getOrganization(@Param("slug") slug: string) {
    return this.orgService.getOrganizationDetails(slug);
  }

  @Get("user/memberships")
  async getUserMemberships(
    @Query("qorveUserId") qorveUserId?: string,
    @Query("email") email?: string
  ) {
    return this.orgService.getUserMemberships(qorveUserId, email);
  }

  // ─── Acquisition ──────────────────────────────────────────────────────────

  /**
   * POST /organizations
   *
   * Register a newly acquired or created company.
   *
   * Body:
   *   { name, legalName, slug?, type?, description?, logoUrl?, isPublic? }
   *
   * Example:
   *   POST /organizations
   *   { "name": "Acme Logistics BV", "legalName": "Acme Logistics B.V.", "type": "SUBSIDIARY" }
   */
  @Post("organizations")
  async createOrganization(
    @Body() dto: CreateOrganizationDto,
    @Headers("x-actor-id") actorId?: string
  ) {
    return this.orgService.createOrganization(dto, actorId);
  }

  /**
   * POST /organizations/ownership
   *
   * Link two companies with an ownership relationship.
   * Run AFTER creating both organizations.
   *
   * Body:
   *   { ownerSlug, ownedSlug, ownershipPercentage, relationshipType?, effectiveFrom? }
   *
   * Example — Virex Capital acquires 100% of Acme Logistics:
   *   POST /organizations/ownership
   *   {
   *     "ownerSlug": "virex-capital",
   *     "ownedSlug": "acme-logistics-bv",
   *     "ownershipPercentage": 100
   *   }
   */
  @Post("organizations/ownership")
  async addOwnership(
    @Body() dto: AddOwnershipDto,
    @Headers("x-actor-id") actorId?: string
  ) {
    if (actorId) dto.actorId = dto.actorId ?? actorId;
    return this.orgService.addOwnership(dto);
  }
}
