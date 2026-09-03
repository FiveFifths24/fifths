"use client";

import { Headphones, Music2 } from "lucide-react";
import { useEffect, useState } from "react";

type MusicMetadata = {
  artworkUrl: string | null;
  title: string | null;
  artist: string | null;
  service: string | null;
};

function actionLabel(url: string) {
  try {
    const host = new URL(url).hostname;
    return host.includes("youtube.com") || host.includes("youtu.be")
      ? "Watch"
      : "Listen";
  } catch {
    return "Listen";
  }
}

export function ProfileSoundtrack({
  accentColor,
  song,
}: {
  accentColor: string;
  song: { title: string | null; artist: string | null; url: string | null };
}) {
  const [metadata, setMetadata] = useState<MusicMetadata | null>(null);

  useEffect(() => {
    if (!song.url) return;
    const controller = new AbortController();
    void fetch(`/api/music-metadata?url=${encodeURIComponent(song.url)}`, {
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((value: MusicMetadata | null) => setMetadata(value))
      .catch(() => undefined);
    return () => controller.abort();
  }, [song.url]);

  const title = song.title ?? metadata?.title ?? "Featured track";
  const artist = song.artist ?? metadata?.artist;
  const artworkUrl = metadata?.artworkUrl;

  return (
    <div
      className="relative mt-5 min-h-[15rem] overflow-hidden rounded-2xl border bg-[radial-gradient(circle_at_30%_20%,rgba(243,89,210,.35),transparent_40%),linear-gradient(145deg,#421070,#08080f)] bg-cover bg-center"
      style={{
        borderColor: accentColor,
        ...(artworkUrl ? { backgroundImage: `url(${artworkUrl})` } : {}),
      }}
    >
      <div className="absolute inset-0 bg-black/65" />

      <div className="relative z-10 flex min-h-[15rem] flex-col items-center justify-center px-6 py-8 text-center">
        {!artworkUrl ? (
          <Music2 aria-hidden="true" className="mb-4 size-8 text-white/80" />
        ) : null}

        <h3 className="max-w-full text-xl font-black text-white">{title}</h3>

        {artist ? (
          <p className="mt-2 line-clamp-2 text-white/65">{artist}</p>
        ) : null}

        {song.url ? (
          <a
            className="mt-5 inline-flex items-center justify-center gap-2 text-sm font-bold"
            href={song.url}
            rel="noopener noreferrer"
            style={{ color: accentColor }}
            target="_blank"
          >
            <Headphones aria-hidden="true" className="size-4" />
            {actionLabel(song.url)}
          </a>
        ) : null}
      </div>
    </div>
  );
}
