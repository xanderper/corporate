export type UserStatus = "INVITED" | "ACTIVE" | "SUSPENDED";
export type InvitationStatus = "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED";
export type Role = "OWNER" | "ADMIN" | "DIRECTOR" | "MANAGER" | "MEMBER" | "VIEWER";
export type OrgType = "HOLDING" | "SUBSIDIARY" | "PORTFOLIO_COMPANY";
export type RelationshipType = "DIRECT" | "MAJORITY" | "MINORITY" | "VENTURE";
export type ReportStatus = "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";

export interface VirexUser {
  id: string;
  qorve_user_id: string | null;
  email: string;
  name: string;
  avatar_url: string | null;
  status: UserStatus;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

export interface VirexInvitation {
  id: string;
  email: string;
  invited_by: string;
  status: InvitationStatus;
  token_hash: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

export interface Organization {
  id: string;
  name: string;
  legal_name: string;
  slug: string;
  type: OrgType;
  description: string | null;
  logo_url: string | null;
  status: "ACTIVE" | "ARCHIVED";
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface OwnershipRelationship {
  id: string;
  owner_organization_id: string;
  owned_organization_id: string;
  ownership_percentage: number | string;
  relationship_type: RelationshipType;
  effective_from: string | null;
  effective_until: string | null;
  created_at: string;
  owner_name?: string;
  owned_name?: string;
  owned_slug?: string;
  owned_type?: OrgType;
}

export interface Membership {
  id: string;
  user_id: string;
  organization_id: string;
  role: Role;
  title: string | null;
  status: "ACTIVE" | "SUSPENDED";
  created_at: string;
  updated_at: string;
  organization_name?: string;
  organization_slug?: string;
  organization_type?: OrgType;
  user_name?: string;
  user_email?: string;
}

export interface CompanyReport {
  id: string;
  organization_id: string;
  title: string;
  period: string;
  status: ReportStatus;
  revenue: number;
  expenses: number;
  ebitda: number;
  cash: number;
  headcount: number;
  major_projects: number;
  risks_count: number;
  notes: string | null;
  submitted_by_id: string | null;
  submitted_at: string | null;
  reviewed_by_id: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  submitted_by_name?: string;
  reviewed_by_name?: string;
  organization_name?: string;
}

export interface FileRecord {
  id: string;
  organization_id: string;
  uploader_user_id: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  s3_key: string;
  bucket_name: string;
  category: "FINANCIAL_REPORT" | "CAP_TABLE" | "LEGAL" | "GOVERNANCE" | "GENERAL";
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    timestamp: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
