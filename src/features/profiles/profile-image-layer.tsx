export type ProfileImageFit = "cover" | "contain";

export function ProfileImageLayer({
  imageUrl,
  fit = "cover",
  positionX = 50,
  positionY = 50,
  zoom = 100,
  overlayClassName,
}: {
  imageUrl: string | null;
  fit?: ProfileImageFit;
  positionX?: number;
  positionY?: number;
  zoom?: number;
  overlayClassName?: string;
}) {
  if (!imageUrl) return null;

  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-no-repeat"
        style={{
          backgroundImage: `url(${JSON.stringify(imageUrl)})`,
          backgroundPosition: `${positionX}% ${positionY}%`,
          backgroundSize: fit,
          transform: `scale(${zoom / 100})`,
        }}
      />
      {overlayClassName ? (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 ${overlayClassName}`}
        />
      ) : null}
    </>
  );
}
