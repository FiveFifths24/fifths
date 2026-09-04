"use client";

import { useEffect, useState } from "react";
import type { ProfileImageFit } from "./profile-image-layer";

const inputClass =
  "min-h-12 w-full rounded-xl border border-white/10 bg-black/45 px-4 py-3 text-white outline-none transition file:mr-4 file:rounded-full file:border-0 file:bg-[#6c14ce]/20 file:px-4 file:py-2 file:font-bold file:text-[#e9d5ff] hover:file:bg-[#6c14ce]/30 focus:border-[#f359d2]/70 focus:ring-2 focus:ring-[#992bff]/20";

function MediaFrameEditor({
  title,
  description,
  inputName,
  accept,
  currentUrl,
  initialFit,
  initialPositionX,
  initialPositionY,
  initialZoom,
  previewClassName,
}: {
  title: string;
  description: string;
  inputName: "landscape" | "background";
  accept: string;
  currentUrl: string | null;
  initialFit: ProfileImageFit;
  initialPositionX: number;
  initialPositionY: number;
  initialZoom: number;
  previewClassName: string;
}) {
  const [previewUrl, setPreviewUrl] = useState(currentUrl);
  const [localUrl, setLocalUrl] = useState<string | null>(null);
  const [fit, setFit] = useState<ProfileImageFit>(initialFit);
  const [positionX, setPositionX] = useState(initialPositionX);
  const [positionY, setPositionY] = useState(initialPositionY);
  const [zoom, setZoom] = useState(initialZoom);

  useEffect(
    () => () => {
      if (localUrl) URL.revokeObjectURL(localUrl);
    },
    [localUrl],
  );

  function previewFile(file: File | undefined) {
    if (!file) return;
    if (localUrl) URL.revokeObjectURL(localUrl);
    const nextUrl = URL.createObjectURL(file);
    setLocalUrl(nextUrl);
    setPreviewUrl(nextUrl);
  }

  const prefix =
    inputName === "landscape" ? "landscapeImage" : "backgroundImage";

  return (
    <fieldset className="rounded-2xl border border-white/10 bg-black/25 p-5">
      <legend className="px-2 text-sm font-bold text-white">{title}</legend>
      <p className="mb-5 text-xs leading-5 text-white/45">{description}</p>

      <div
        className={`relative overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#160626,#070711_58%,#071b20)] ${previewClassName}`}
      >
        {previewUrl ? (
          <div
            aria-label={`${title} preview`}
            className="absolute inset-0 bg-no-repeat"
            role="img"
            style={{
              backgroundImage: `url(${JSON.stringify(previewUrl)})`,
              backgroundPosition: `${positionX}% ${positionY}%`,
              backgroundSize: fit,
              transform: `scale(${zoom / 100})`,
            }}
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center px-6 text-center text-sm text-white/35">
            Upload an image to preview it here.
          </div>
        )}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/5 to-black/30"
        />
      </div>

      <div className="mt-5">
        <label
          className="mb-2 block text-sm font-bold text-white"
          htmlFor={`profile-${inputName}`}
        >
          Choose Image
        </label>
        <input
          accept={accept}
          className={inputClass}
          id={`profile-${inputName}`}
          name={inputName}
          onChange={(event) => previewFile(event.target.files?.[0])}
          type="file"
        />
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <label
            className="mb-2 block text-sm font-bold text-white"
            htmlFor={`${prefix}-fit`}
          >
            Image Fit
          </label>
          <select
            className={inputClass}
            id={`${prefix}-fit`}
            name={`${prefix}Fit`}
            onChange={(event) => setFit(event.target.value as ProfileImageFit)}
            value={fit}
          >
            <option value="cover">Fill Frame</option>
            <option value="contain">Show Whole Image</option>
          </select>
        </div>
        <div>
          <label
            className="mb-2 flex justify-between text-sm font-bold text-white"
            htmlFor={`${prefix}-zoom`}
          >
            <span>Zoom</span>
            <span className="text-white/45">{zoom}%</span>
          </label>
          <input
            className="min-h-12 w-full accent-[#a855f7]"
            id={`${prefix}-zoom`}
            max={200}
            min={100}
            name={`${prefix}Zoom`}
            onChange={(event) => setZoom(Number(event.target.value))}
            step={5}
            type="range"
            value={zoom}
          />
        </div>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <label
            className="mb-2 flex justify-between text-sm font-bold text-white"
            htmlFor={`${prefix}-position-x`}
          >
            <span>Move Left or Right</span>
            <span className="text-white/45">{positionX}%</span>
          </label>
          <input
            className="min-h-12 w-full accent-[#f359d2]"
            id={`${prefix}-position-x`}
            max={100}
            min={0}
            name={`${prefix}PositionX`}
            onChange={(event) => setPositionX(Number(event.target.value))}
            type="range"
            value={positionX}
          />
        </div>
        <div>
          <label
            className="mb-2 flex justify-between text-sm font-bold text-white"
            htmlFor={`${prefix}-position-y`}
          >
            <span>Move Up or Down</span>
            <span className="text-white/45">{positionY}%</span>
          </label>
          <input
            className="min-h-12 w-full accent-[#f359d2]"
            id={`${prefix}-position-y`}
            max={100}
            min={0}
            name={`${prefix}PositionY`}
            onChange={(event) => setPositionY(Number(event.target.value))}
            type="range"
            value={positionY}
          />
        </div>
      </div>
    </fieldset>
  );
}

export function ProfileMediaEditor({
  landscape,
  background,
}: {
  landscape: {
    currentUrl: string | null;
    fit: ProfileImageFit;
    positionX: number;
    positionY: number;
    zoom: number;
  };
  background: {
    currentUrl: string | null;
    fit: ProfileImageFit;
    positionX: number;
    positionY: number;
    zoom: number;
  };
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <MediaFrameEditor
        accept="image/jpeg,image/png,image/webp"
        currentUrl={landscape.currentUrl}
        description="This appears only inside the wide profile header."
        initialFit={landscape.fit}
        initialPositionX={landscape.positionX}
        initialPositionY={landscape.positionY}
        initialZoom={landscape.zoom}
        inputName="landscape"
        previewClassName="aspect-[16/5]"
        title="Landscape Header"
      />
      <MediaFrameEditor
        accept="image/jpeg,image/png,image/webp"
        currentUrl={background.currentUrl}
        description="This static image fills the page behind all of your profile cards."
        initialFit={background.fit}
        initialPositionX={background.positionX}
        initialPositionY={background.positionY}
        initialZoom={background.zoom}
        inputName="background"
        previewClassName="aspect-video"
        title="Full-page wallpaper"
      />
    </div>
  );
}
