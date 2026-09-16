import { apiSchemas } from "../projects/swagger.js";

export const adminSchemas = {
  login: apiSchemas.login,
  logout: apiSchemas.logout,
  me: apiSchemas.me,
  dashboard: apiSchemas.dashboard,
  revokeSession: apiSchemas.revokeSession
} as const;
