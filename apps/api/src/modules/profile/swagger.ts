import { apiSchemas } from "../projects/swagger.js";

export const profileSchemas = {
  profile: apiSchemas.profile,
  site: apiSchemas.site,
  profileFacts: apiSchemas.profileFacts,
  adminProfile: apiSchemas.adminProfile,
  updateProfile: apiSchemas.updateProfile,
  adminProfileFacts: apiSchemas.adminProfileFacts,
  createProfileFact: apiSchemas.createProfileFact,
  updateProfileFact: apiSchemas.updateProfileFact,
  removeProfileFact: apiSchemas.removeProfileFact,
  reorderProfileFacts: apiSchemas.reorderProfileFacts
} as const;
