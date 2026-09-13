import {
  CreateBucketCommand,
  HeadBucketCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { config } from "./config.js";

export const storage = new S3Client({
  endpoint: config.S3_ENDPOINT,
  region: config.S3_REGION,
  forcePathStyle: config.S3_FORCE_PATH_STYLE,
  credentials: {
    accessKeyId: config.S3_ACCESS_KEY_ID,
    secretAccessKey: config.S3_SECRET_ACCESS_KEY,
  },
});

export const checkStorageBucket = () =>
  storage.send(new HeadBucketCommand({ Bucket: config.S3_BUCKET }));

export async function ensureStorageBucket() {
  try {
    await checkStorageBucket();
  } catch (error) {
    if (
      (error as { $metadata?: { httpStatusCode?: number } }).$metadata
        ?.httpStatusCode !== 404
    )
      throw error;
    await storage.send(new CreateBucketCommand({ Bucket: config.S3_BUCKET }));
  }
}
