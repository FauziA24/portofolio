import { apiSchemas } from "../projects/swagger.js";

export const researchSchemas = {
  research: apiSchemas.research,
  adminResearch: apiSchemas.adminResearch,
  createResearch: apiSchemas.createResearch,
  updateResearch: apiSchemas.updateResearch,
  removeResearch: apiSchemas.removeResearch,
  reorderResearch: apiSchemas.reorderResearch
} as const;
