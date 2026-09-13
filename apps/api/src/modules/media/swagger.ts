import { apiSchemas } from "../projects/swagger.js";

export const mediaSchemas = {
  adminMedia: apiSchemas.adminMedia,
  uploadMedia: apiSchemas.uploadMedia,
  removeMedia: apiSchemas.removeMedia,
  projectMedia: apiSchemas.projectMedia,
  adminProjectMedia: apiSchemas.adminProjectMedia,
  createProjectMedia: apiSchemas.createProjectMedia,
  updateProjectMedia: apiSchemas.updateProjectMedia,
  removeProjectMedia: apiSchemas.removeProjectMedia,
  reorderProjectMedia: apiSchemas.reorderProjectMedia
} as const;
