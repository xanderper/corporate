import { request } from "./client";
import {
  Organization,
  OwnershipRelationship,
  Membership,
  CompanyReport,
} from "./types";

export interface StructureResponse {
  organizations: Organization[];
  hierarchy: OwnershipRelationship[];
}

export interface OrganizationDetailsResponse {
  organization: Organization;
  members: Membership[];
  reports: CompanyReport[];
}

export interface MembershipsResponse {
  memberships: Membership[];
  organizations: Organization[];
  isHoldingExecutive: boolean;
}

export interface CreateOrganizationInput {
  name: string;
  legalName: string;
  slug?: string;
  type?: "HOLDING" | "SUBSIDIARY" | "PORTFOLIO" | "JOINT_VENTURE" | "FUND";
  description?: string;
  logoUrl?: string;
  isPublic?: boolean;
}

export interface AddOwnershipInput {
  ownerSlug: string;
  ownedSlug: string;
  ownershipPercentage: number;
  relationshipType?: "DIRECT" | "INDIRECT" | "JOINT_VENTURE";
  effectiveFrom?: string;
  effectiveUntil?: string;
}

export interface AddOwnershipResponse {
  relationship: OwnershipRelationship;
  owner: { id: string; name: string; slug: string };
  acquired: { id: string; name: string; slug: string };
}

export const organizationsApi = {
  async getStructure(): Promise<StructureResponse> {
    return request<StructureResponse>("organizations", {
      method: "GET",
    });
  },

  async getBySlug(slug: string): Promise<OrganizationDetailsResponse> {
    return request<OrganizationDetailsResponse>(`organizations/${slug}`, {
      method: "GET",
    });
  },

  async getMyMemberships(params?: {
    qorveUserId?: string;
    email?: string;
  }): Promise<MembershipsResponse> {
    return request<MembershipsResponse>("user/memberships", {
      method: "GET",
      params: {
        qorveUserId: params?.qorveUserId,
        email: params?.email,
      },
    });
  },

  async createOrganization(
    input: CreateOrganizationInput,
    actorId?: string
  ): Promise<{ organization: Organization }> {
    return request<{ organization: Organization }>("organizations", {
      method: "POST",
      body: JSON.stringify(input),
      headers: actorId ? { "x-actor-id": actorId } : {},
    });
  },

  async addOwnership(
    input: AddOwnershipInput,
    actorId?: string
  ): Promise<AddOwnershipResponse> {
    return request<AddOwnershipResponse>("organizations/ownership", {
      method: "POST",
      body: JSON.stringify(input),
      headers: actorId ? { "x-actor-id": actorId } : {},
    });
  },
};
