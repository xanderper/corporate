import { request } from "./client";
import { FileRecord } from "./types";

export const filesApi = {
  async list(organizationId: string): Promise<{ files: FileRecord[] }> {
    return request<{ files: FileRecord[] }>(`organizations/${organizationId}/files`, {
      method: "GET",
    });
  },

  async upload(
    file: File,
    params: { organizationId: string; category?: string }
  ): Promise<{ success: boolean; file: FileRecord }> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("organizationId", params.organizationId);
    if (params.category) formData.append("category", params.category);

    return request<{ success: boolean; file: FileRecord }>("files/upload", {
      method: "POST",
      body: formData,
    });
  },

  async getDownloadUrl(fileId: string): Promise<{ downloadUrl: string }> {
    return request<{ downloadUrl: string }>(`files/${fileId}/download`, {
      method: "GET",
    });
  },
};
