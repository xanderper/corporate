import { authApi } from "./auth.api";
import { usersApi } from "./users.api";
import { organizationsApi } from "./organizations.api";
import { reportsApi } from "./reports.api";
import { filesApi } from "./files.api";

export const api = {
  auth: authApi,
  users: usersApi,
  organizations: organizationsApi,
  reports: reportsApi,
  files: filesApi,
};

export { ApiClientError } from "./client";
export * from "./types";
export * from "./auth.api";
export * from "./users.api";
export * from "./organizations.api";
export * from "./reports.api";
export * from "./files.api";
