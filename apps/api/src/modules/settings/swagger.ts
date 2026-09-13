import { apiSchemas } from "../projects/swagger.js";

export const settingsSchemas = {
  site: apiSchemas.site,
  adminSettings: apiSchemas.adminSettings,
  updateSettings: apiSchemas.updateSettings
} as const;
