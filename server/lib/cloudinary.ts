import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
  secure: true,
});

export default cloudinary;

/**
 * Uploads a buffer directly to Cloudinary with automatic WebP/WebM transcoding and optimization.
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string = "dpsi_cms",
  resourceType: "image" | "video" | "raw" | "auto" = "auto"
): Promise<{ url: string; secure_url: string; public_id: string; format: string; bytes: number; width?: number; height?: number }> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        format: resourceType === "image" ? "webp" : resourceType === "video" ? "webm" : undefined,
        transformation:
          resourceType === "image"
            ? [{ quality: "auto:good", fetch_format: "webp" }]
            : resourceType === "video"
            ? [{ quality: "auto", fetch_format: "webm" }]
            : undefined,
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        if (!result) {
          return reject(new Error("Cloudinary upload returned empty result"));
        }
        resolve({
          url: result.url,
          secure_url: result.secure_url,
          public_id: result.public_id,
          format: result.format,
          bytes: result.bytes,
          width: result.width,
          height: result.height,
        });
      }
    );

    uploadStream.end(buffer);
  });
}
