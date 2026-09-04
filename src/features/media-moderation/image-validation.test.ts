import sharp from "sharp";
import { describe, expect, it } from "vitest";
import {
  ImageValidationError,
  MAX_IMAGE_BYTES,
  prepareImageForModeration,
} from "./image-validation";

async function validPng() {
  return sharp({
    create: {
      width: 100,
      height: 100,
      channels: 3,
      background: "#f359d2",
    },
  })
    .png()
    .withMetadata({ orientation: 6 })
    .toBuffer();
}

describe("prepareImageForModeration", () => {
  it("rejects an invalid actual MIME even when the browser claims it is JPEG", async () => {
    const file = new File(["not an image"], "photo.jpg", {
      type: "image/jpeg",
    });
    await expect(prepareImageForModeration(file)).rejects.toBeInstanceOf(
      ImageValidationError,
    );
  });

  it("rejects files above the existing 5 MB limit", async () => {
    const file = new File([new Uint8Array(MAX_IMAGE_BYTES + 1)], "large.png", {
      type: "image/png",
    });
    await expect(prepareImageForModeration(file)).rejects.toBeInstanceOf(
      ImageValidationError,
    );
  });

  it("detects from bytes and publishes a metadata-free WebP", async () => {
    const png = await validPng();
    const prepared = await prepareImageForModeration(
      new File([new Uint8Array(png)], "misleading.jpg", {
        type: "image/jpeg",
      }),
    );
    expect(prepared.originalMimeType).toBe("image/png");
    expect((await sharp(prepared.publicationBytes).metadata()).format).toBe(
      "webp",
    );
    expect(
      (await sharp(prepared.publicationBytes).metadata()).exif,
    ).toBeFalsy();
  });
});
