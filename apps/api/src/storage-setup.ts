import { config } from "./config.js";
import { ensureStorageBucket, storage } from "./storage.js";

await ensureStorageBucket();
console.log(
  `Storage bucket '${config.S3_BUCKET}' is ready at ${config.S3_ENDPOINT}`,
);
storage.destroy();
