import { request } from "./client";
import { VirexUser } from "./types";

export interface IdentityResponse {
  exists: boolean;
  user?: VirexUser;
  status?: string;
  message?: string;
}

export interface SynchronizeResponse {
  allowed: boolean;
  user?: VirexUser;
  reason?: string;
  message?: string;
}

export interface VerifyInviteResponse {
  valid: boolean;
  reason?: string;
  message?: string;
  invitation?: {
    id: string;
    email: string;
    invitedBy: string;
    expiresAt: string;
  };
}

export const authApi = {
  async getMe(params?: {
    qorveUserId?: string;
    email?: string;
  }): Promise<IdentityResponse> {
    return request<IdentityResponse>("auth/me", {
      method: "GET",
      params: {
        qorveUserId: params?.qorveUserId,
        email: params?.email,
      },
    });
  },

  async synchronize(data: {
    qorveUserId: string;
    email: string;
    name?: string;
    avatarUrl?: string | null;
  }): Promise<SynchronizeResponse> {
    return request<SynchronizeResponse>("auth/synchronize", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getInvite(token: string): Promise<VerifyInviteResponse> {
    return request<VerifyInviteResponse>(`invite/${token}`, {
      method: "GET",
    });
  },

  async acceptInvite(
    token: string,
    data: {
      qorveUserId: string;
      email: string;
      name?: string;
      avatarUrl?: string | null;
    }
  ): Promise<{ success: boolean; user: VirexUser }> {
    return request<{ success: boolean; user: VirexUser }>(`invite/${token}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
