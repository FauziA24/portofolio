import { randomUUID } from "node:crypto";
import { extname } from "node:path";

const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxBytes = 5 * 1024 * 1024;
const scopes = new Set(["projects", "profile", "research"]);

export type MediaUploadInput = {
  fileName: string;
  mimeType: string;
  dataBase64: string;
  scope: string;
  projectId?: string | null;
};

export function publicMediaUrl(baseUrl: string, storageKey: string) {
  return `${baseUrl.replace(/\/+$/, "")}/${storageKey.split("/").map(encodeURIComponent).join("/")}`;
}

export function normalizeStoredMediaUrl(
  value: string | null | undefined,
  publicBaseUrl: string,
  storageEndpoint: string,
  bucket: string,
) {
  if (!value) return value ?? null;
  try {
    const current = new URL(value);
    const endpoint = new URL(storageEndpoint);
    const bucketPath = `${endpoint.pathname.replace(/\/+$/, "")}/${bucket}/`;
    if (current.origin !== endpoint.origin || !current.pathname.startsWith(bucketPath)) return value;
    const storageKey = decodeURIComponent(current.pathname.slice(bucketPath.length));
    return storageKey ? publicMediaUrl(publicBaseUrl, storageKey) : value;
  } catch {
    return value;
  }
}

export function imageDimensions(buffer: Buffer, mimeType: string) {
  if (mimeType === "image/png" && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }
  if (mimeType === "image/webp" && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") {
    const type = buffer.toString("ascii", 12, 16);
    if (type === "VP8X") return { width: 1 + buffer.readUIntLE(24, 3), height: 1 + buffer.readUIntLE(27, 3) };
    if (type === "VP8 " && buffer.length >= 30) return { width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff };
  }
  if (mimeType === "image/jpeg" && buffer[0] === 0xff && buffer[1] === 0xd8) {
    for (let offset = 2; offset + 9 < buffer.length;) {
      if (buffer[offset] !== 0xff) break;
      const marker = buffer[offset + 1];
      const size = buffer.readUInt16BE(offset + 2);
      if (marker >= 0xc0 && marker <= 0xc3) return { width: buffer.readUInt16BE(offset + 7), height: buffer.readUInt16BE(offset + 5) };
      offset += 2 + size;
    }
  }
  throw new Error("Unsupported or invalid image");
}

export function prepareMediaUpload(input: MediaUploadInput) {
  if (!allowed.has(input.mimeType)) throw new Error("Unsupported image type");
  if (!scopes.has(input.scope)) throw new Error("Invalid media scope");
  const buffer = Buffer.from(input.dataBase64, "base64");
  if (!buffer.length || buffer.length > maxBytes) throw new Error("Image must be between 1 byte and 5 MB");
  const dimensions = imageDimensions(buffer, input.mimeType);
  if (dimensions.width < 1 || dimensions.height < 1) throw new Error("Invalid image dimensions");
  const extension = extname(input.fileName).toLowerCase() || `.${input.mimeType.split("/")[1]}`;
  const folder = input.scope === "projects" && input.projectId ? `projects/${input.projectId}` : input.scope;
  return { buffer, ...dimensions, storageKey: `${folder}/${randomUUID()}${extension}` };
}
