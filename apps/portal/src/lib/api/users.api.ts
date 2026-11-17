import { request } from "./client";
import { VirexUser, VirexInvitation } from "./types";

export interface UsersAndInvitationsResponse {
  users: VirexUser[];
  invitations: VirexInvitation[];
}

export interface InviteUserResponse {
  success: boolean;
  user: VirexUser;
  invitation: VirexInvitation;
  inviteUrl: string;
}

export const usersApi = {
  async list(): Promise<UsersAndInvitationsResponse> {
    return request<UsersAndInvitationsResponse>("users", {
      method: "GET",
    });
  },

  async invite(data: {
    email: string;
    name: string;
    invitedBy?: string;
  }): Promise<InviteUserResponse> {
    return request<InviteUserResponse>("users", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async suspend(
    userId: string,
    actorId = "Virex Administrator"
  ): Promise<{ success: boolean; user: VirexUser }> {
    return request<{ success: boolean; user: VirexUser }>(
      `users/${userId}/suspend`,
      {
        method: "POST",
        body: JSON.stringify({ actorId }),
      }
    );
  },

  async reactivate(
    userId: string,
    actorId = "Virex Administrator"
  ): Promise<{ success: boolean; user: VirexUser }> {
    return request<{ success: boolean; user: VirexUser }>(
      `users/${userId}/reactivate`,
      {
        method: "POST",
        body: JSON.stringify({ actorId }),
      }
    );
  },

  async resendInvite(
    invitationId: string,
    actorId = "Virex Administrator"
  ): Promise<{ success: boolean; invitation: VirexInvitation; inviteUrl: string }> {
    return request<{
      success: boolean;
      invitation: VirexInvitation;
      inviteUrl: string;
    }>(`users/invitations/${invitationId}/resend`, {
      method: "POST",
      body: JSON.stringify({ actorId }),
    });
  },

  async revokeInvite(
    invitationId: string,
    actorId = "Virex Administrator"
  ): Promise<{ success: boolean; invitation: VirexInvitation }> {
    return request<{ success: boolean; invitation: VirexInvitation }>(
      `users/invitations/${invitationId}/revoke`,
      {
        method: "POST",
        body: JSON.stringify({ actorId }),
      }
    );
  },
};
