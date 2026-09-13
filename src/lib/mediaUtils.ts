/**
 * DPS Indirapuram Media Optimization Utilities
 * Handles Cloudinary CDN transformations, dynamic responsive resolutions, and video optimizations.
 */

export function optimizeMediaUrl(url?: string, _isMobile: boolean = false): string {
  if (!url || typeof url !== "string") return "";
  const clean = url.trim();
  if (clean.includes("cloudinary.com") && clean.includes("/video/upload/")) {
    const uploadIdx = clean.indexOf("/video/upload/");
    const afterUpload = clean.substring(uploadIdx + "/video/upload/".length);
    const parts = afterUpload.split("/");
    const hasTransform = parts.length > 1 && !/^v\d+$/.test(parts[0]);
    const cleanPath = hasTransform ? parts.slice(1).join("/") : afterUpload;

    return `${clean.substring(0, uploadIdx)}/video/upload/q_auto:best,vc_auto,w_1920,c_limit/${cleanPath}`;
  }
  if (clean.includes("cloudinary.com") && clean.includes("/image/upload/")) {
    if (clean.includes("/image/upload/q_auto:best")) return clean;
    return clean.replace(
      "/image/upload/",
      "/image/upload/q_auto:best,f_auto,w_2560,c_limit/"
    );
  }
  return clean;
}
