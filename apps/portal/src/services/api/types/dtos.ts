import { Role, ReportStatus, UserStatus } from "./models";

export interface SynchronizeUserDTO {
  email: string;
  qorveUserId: string;
  name?: string;
  avatarUrl?: string | null;
}

export interface InviteUserDTO {
  email: string;
  name: string;
  invitedBy?: string;
  expiresInDays?: number;
}

export interface AcceptInviteDTO {
  qorveUserId?: string;
}

export interface CreateReportDTO {
  organizationId: string;
  title: string;
  period: string;
  status: ReportStatus;
  revenue: number;
  expenses: number;
  ebitda: number;
  cash: number;
  headcount: number;
  majorProjects: number;
  risksCount: number;
  notes?: string;
  submittedById?: string;
}

export interface ReviewReportDTO {
  status: "APPROVED" | "REJECTED";
  reviewerId: string;
}

export interface CreateMembershipDTO {
  userId: string;
  organizationId: string;
  role: Role;
  title?: string;
}

export interface RecordAuditDTO {
  actorId: string;
  action: string;
  targetId?: string | null;
  details?: Record<string, unknown> | null;
}

export interface UpdateUserStatusDTO {
  userId: string;
  status: UserStatus;
}
