import type { ReactNode } from "react";

export function ProfileWallpaper({
  backgroundUrl,
  children,
}: {
  backgroundUrl: string | null;
  children: ReactNode;
}) {
  return (
    <>
      {backgroundUrl ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,.38),rgba(0,0,0,.58)),url(${JSON.stringify(backgroundUrl)})`,
          }}
        />
      ) : null}
      <div className="relative z-10">{children}</div>
    </>
  );
}
