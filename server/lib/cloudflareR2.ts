import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const R2_ACCOUNT_ID = (process.env.CLOUDFLARE_R2_ACCOUNT_ID || "").trim();
const R2_ACCESS_KEY_ID = (process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || "").trim();
const R2_SECRET_ACCESS_KEY = (process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || "").trim();
const R2_BUCKET_NAME = (process.env.CLOUDFLARE_R2_BUCKET_NAME || "dpsi-media").trim();
const R2_PUBLIC_DOMAIN = (process.env.CLOUDFLARE_R2_PUBLIC_DOMAIN || "").trim();

export const r2Client = new S3Client({
  region: "auto",
  endpoint: R2_ACCOUNT_ID ? `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : "https://r2.cloudflarestorage.com",
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID || "unconfigured",
    secretAccessKey: R2_SECRET_ACCESS_KEY || "unconfigured",
  },
});

/**
 * Uploads a file buffer directly to Cloudflare R2 storage with public URL generation.
 */
export async function uploadToR2(
  buffer: Buffer,
  fileName: string,
  contentType: string,
  folder: string = "uploads",
  bucketName: string = R2_BUCKET_NAME
): Promise<{ url: string; key: string; bucket: string; size: number }> {
  if (!R2_SECRET_ACCESS_KEY || !R2_ACCESS_KEY_ID || !R2_ACCOUNT_ID) {
    throw new Error("Cloudflare R2 credentials (CLOUDFLARE_R2_ACCOUNT_ID, CLOUDFLARE_R2_ACCESS_KEY_ID, CLOUDFLARE_R2_SECRET_ACCESS_KEY) are required for R2 uploads.");
  }

  const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const uniqueKey = `${folder}/${Date.now()}_${cleanFileName}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: uniqueKey,
    Body: buffer,
    ContentType: contentType,
  });

  await r2Client.send(command);

  // Generate public asset URL (Custom CDN domain or R2 public dev URL)
  const publicBaseUrl = R2_PUBLIC_DOMAIN
    ? R2_PUBLIC_DOMAIN.replace(/\/+$/, "")
    : `https://${bucketName}.${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

  const publicUrl = `${publicBaseUrl}/${uniqueKey}`;

  return {
    url: publicUrl,
    key: uniqueKey,
    bucket: bucketName,
    size: buffer.length,
  };
}

/**
 * Deletes an object from Cloudflare R2 bucket.
 */
export async function deleteFromR2(key: string, bucketName: string = R2_BUCKET_NAME): Promise<boolean> {
  if (!R2_SECRET_ACCESS_KEY) return false;
  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    await r2Client.send(command);
    return true;
  } catch (err) {
    console.error("Failed to delete object from Cloudflare R2:", err);
    return false;
  }
}
