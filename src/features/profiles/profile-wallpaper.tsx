import type { ReactNode } from "react";
import { ProfileImageLayer, type ProfileImageFit } from "./profile-image-layer";

export function ProfileWallpaper({
  backgroundUrl,
  fit = "cover",
  positionX = 50,
  positionY = 50,
  zoom = 100,
  children,
}: {
  backgroundUrl: string | null;
  fit?: ProfileImageFit;
  positionX?: number;
  positionY?: number;
  zoom?: number;
  children: ReactNode;
}) {
  return (
    <>
      {backgroundUrl ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        >
          <ProfileImageLayer
            fit={fit}
            imageUrl={backgroundUrl}
            overlayClassName="bg-[linear-gradient(rgba(0,0,0,.38),rgba(0,0,0,.58))]"
            positionX={positionX}
            positionY={positionY}
            zoom={zoom}
          />
        </div>
      ) : null}
      <div className="relative z-10">{children}</div>
    </>
  );
}
