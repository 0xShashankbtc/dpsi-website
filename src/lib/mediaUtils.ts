/**
 * DPS Indirapuram Media Optimization Utilities
 * Handles Cloudinary CDN transformations, dynamic responsive resolutions, and video optimizations.
 */

export type MediaPreset = "thumb" | "card" | "hero" | "full";

export interface OptimizeMediaOptions {
  isMobile?: boolean;
  preset?: MediaPreset;
  width?: number;
}

export function optimizeMediaUrl(
  url?: string,
  optionsOrMobile: boolean | OptimizeMediaOptions = false
): string {
  if (!url || typeof url !== "string") return "";
  const clean = url.trim();
  if (!clean) return "";

  const isMobile =
    typeof optionsOrMobile === "boolean"
      ? optionsOrMobile
      : Boolean(optionsOrMobile?.isMobile);
  const preset =
    typeof optionsOrMobile === "object" ? optionsOrMobile?.preset : undefined;
  const customWidth =
    typeof optionsOrMobile === "object" ? optionsOrMobile?.width : undefined;

  // Cloudinary Video Optimization
  if (clean.includes("cloudinary.com") && clean.includes("/video/upload/")) {
    const uploadIdx = clean.indexOf("/video/upload/");
    const afterUpload = clean.substring(uploadIdx + "/video/upload/".length);
    const parts = afterUpload.split("/");
    const hasTransform = parts.length > 1 && !/^v\d+$/.test(parts[0]);
    const cleanPath = hasTransform ? parts.slice(1).join("/") : afterUpload;

    if (isMobile) {
      return `${clean.substring(0, uploadIdx)}/video/upload/q_auto:eco,vc_auto,w_720,c_limit/${cleanPath}`;
    }
    return `${clean.substring(0, uploadIdx)}/video/upload/q_auto:best,vc_auto,w_1920,c_limit/${cleanPath}`;
  }

  // Cloudinary Image Optimization
  if (clean.includes("cloudinary.com") && clean.includes("/image/upload/")) {
    if (
      clean.includes("/image/upload/q_auto:best") ||
      clean.includes("/image/upload/q_auto:good") ||
      clean.includes("/image/upload/q_auto:eco")
    ) {
      return clean;
    }

    const uploadIdx = clean.indexOf("/image/upload/");
    const afterUpload = clean.substring(uploadIdx + "/image/upload/".length);
    const parts = afterUpload.split("/");
    const hasTransform = parts.length > 1 && !/^v\d+$/.test(parts[0]);
    const cleanPath = hasTransform ? parts.slice(1).join("/") : afterUpload;

    if (customWidth) {
      return `${clean.substring(0, uploadIdx)}/image/upload/q_auto:good,f_auto,w_${customWidth},c_limit/${cleanPath}`;
    }

    if (preset === "thumb") {
      const w = isMobile ? 320 : 480;
      return `${clean.substring(0, uploadIdx)}/image/upload/q_auto:eco,f_auto,w_${w},c_limit/${cleanPath}`;
    }

    if (preset === "card") {
      const w = isMobile ? 480 : 800;
      return `${clean.substring(0, uploadIdx)}/image/upload/q_auto:good,f_auto,w_${w},c_limit/${cleanPath}`;
    }

    if (preset === "hero") {
      const w = isMobile ? 768 : 1920;
      return `${clean.substring(0, uploadIdx)}/image/upload/q_auto:good,f_auto,w_${w},c_limit/${cleanPath}`;
    }

    if (isMobile) {
      return `${clean.substring(0, uploadIdx)}/image/upload/q_auto:eco,f_auto,w_768,c_limit/${cleanPath}`;
    }

    return `${clean.substring(0, uploadIdx)}/image/upload/q_auto:best,f_auto,w_2560,c_limit/${cleanPath}`;
  }

  return clean;
}
