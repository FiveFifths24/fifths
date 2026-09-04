import "server-only";

import { createHash } from "node:crypto";
import sharp from "sharp";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_IMAGE_PIXELS = 40_000_000;
const MAX_IMAGE_DIMENSION = 12_000;
const MIN_IMAGE_DIMENSION = 50;
const MAX_MODERATION_BYTES = 4 * 1024 * 1024;

const actualMimeTypes = {
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
} as const;

export class ImageValidationError extends Error {
  constructor(message = "The image is invalid or unsupported.") {
    super(message);
    this.name = "ImageValidationError";
  }
}

export type PreparedImage = {
  publicationBytes: Buffer;
  moderationBytes: Buffer;
  originalMimeType: (typeof actualMimeTypes)[keyof typeof actualMimeTypes];
  originalByteSize: number;
  normalizedByteSize: number;
  width: number;
  height: number;
  sha256: string;
};

async function encodePublication(source: Buffer) {
  let output = await sharp(source, { limitInputPixels: MAX_IMAGE_PIXELS })
    .rotate()
    .resize({
      width: 4096,
      height: 4096,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 88, effort: 4 })
    .toBuffer();

  if (output.length > MAX_IMAGE_BYTES) {
    output = await sharp(source, { limitInputPixels: MAX_IMAGE_PIXELS })
      .rotate()
      .resize({
        width: 3072,
        height: 3072,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 72, effort: 4 })
      .toBuffer();
  }
  if (output.length > MAX_IMAGE_BYTES) throw new ImageValidationError();
  return output;
}

export async function prepareImageForModeration(
  file: File,
): Promise<PreparedImage> {
  if (file.size < 1 || file.size > MAX_IMAGE_BYTES) {
    throw new ImageValidationError();
  }
  const source = Buffer.from(await file.arrayBuffer());
  try {
    const metadata = await sharp(source, {
      limitInputPixels: MAX_IMAGE_PIXELS,
      sequentialRead: true,
    }).metadata();
    const mimeType =
      actualMimeTypes[metadata.format as keyof typeof actualMimeTypes];
    const width = metadata.width ?? 0;
    const height = metadata.height ?? 0;
    if (
      !mimeType ||
      (metadata.pages ?? 1) !== 1 ||
      width < MIN_IMAGE_DIMENSION ||
      height < MIN_IMAGE_DIMENSION ||
      width > MAX_IMAGE_DIMENSION ||
      height > MAX_IMAGE_DIMENSION ||
      width * height > MAX_IMAGE_PIXELS
    ) {
      throw new ImageValidationError();
    }

    const publicationBytes = await encodePublication(source);
    const publicationMetadata = await sharp(publicationBytes).metadata();
    let moderationBytes = await sharp(publicationBytes)
      .resize({
        width: 2048,
        height: 2048,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 82, effort: 4 })
      .toBuffer();
    if (moderationBytes.length > MAX_MODERATION_BYTES) {
      moderationBytes = await sharp(publicationBytes)
        .resize({
          width: 1536,
          height: 1536,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 68, effort: 4 })
        .toBuffer();
    }
    if (moderationBytes.length > MAX_MODERATION_BYTES) {
      throw new ImageValidationError();
    }

    return {
      publicationBytes,
      moderationBytes,
      originalMimeType: mimeType,
      originalByteSize: source.length,
      normalizedByteSize: publicationBytes.length,
      width: publicationMetadata.width ?? width,
      height: publicationMetadata.height ?? height,
      sha256: createHash("sha256").update(publicationBytes).digest("hex"),
    };
  } catch (error) {
    if (error instanceof ImageValidationError) throw error;
    throw new ImageValidationError();
  }
}
