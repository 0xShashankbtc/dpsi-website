import sharp from "sharp";

export interface TranscodeImageResult {
  format: "webp";
  buffer: Buffer;
  width?: number;
  height?: number;
  size: number;
  dataUrl: string;
}

/**
 * Converts any image buffer (JPEG, PNG, HEIC, TIFF, BMP, etc.) to optimized WebP.
 * @param inputBuffer Image input buffer
 * @param quality Quality level (default: 80)
 * @param maxWidth Optional max width constraint
 */
export async function convertImageToWebP(
  inputBuffer: Buffer,
  quality: number = 80,
  maxWidth?: number
): Promise<TranscodeImageResult> {
  let pipeline = sharp(inputBuffer);

  if (maxWidth) {
    pipeline = pipeline.resize({ width: maxWidth, withoutEnlargement: true });
  }

  const outputBuffer = await pipeline
    .webp({ quality, effort: 4 })
    .toBuffer();

  const metadata = await sharp(outputBuffer).metadata();

  const base64 = outputBuffer.toString("base64");
  const dataUrl = `data:image/webp;base64,${base64}`;

  return {
    format: "webp",
    buffer: outputBuffer,
    width: metadata.width,
    height: metadata.height,
    size: outputBuffer.length,
    dataUrl,
  };
}
