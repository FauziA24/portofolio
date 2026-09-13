import { apiSchemas } from "../projects/swagger.js";

export const contactSchemas = {
  contactLinks: apiSchemas.contactLinks,
  adminContactLinks: apiSchemas.adminContactLinks,
  createContactLink: apiSchemas.createContactLink,
  updateContactLink: apiSchemas.updateContactLink,
  removeContactLink: apiSchemas.removeContactLink,
  reorderContactLinks: apiSchemas.reorderContactLinks
} as const;
