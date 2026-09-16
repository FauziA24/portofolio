import { config } from "../../config.js";
import { normalizeStoredMediaUrl } from "../admin/media.js";

export function normalizeProfileMedia<T extends { portraitImageUrl?: string | null }>(profile: T) {
  return {
    ...profile,
    portraitImageUrl: normalizeStoredMediaUrl(
      profile.portraitImageUrl,
      config.S3_PUBLIC_URL,
      config.S3_ENDPOINT,
      config.S3_BUCKET,
    ),
  };
}
