import { NextResponse } from "next/server";

function readMetaTag(html: string, key: string) {
  const patterns = [
    new RegExp(
      `<meta[^>]+property=["']${key}["'][^>]+content=["']([^"']+)["']`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${key}["']`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+name=["']${key}["'][^>]+content=["']([^"']+)["']`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${key}["']`,
      "i",
    ),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }

  return null;
}

function cleanText(value: string | null) {
  if (!value) return null;
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { artworkUrl: null, title: null, artist: null, service: null },
      { status: 400 },
    );
  }

  try {
    const parsedUrl = new URL(url);

    const service = parsedUrl.hostname.includes("music.apple.com")
      ? "apple"
      : parsedUrl.hostname.includes("open.spotify.com")
        ? "spotify"
        : parsedUrl.hostname.includes("youtube.com") ||
            parsedUrl.hostname.includes("youtu.be")
          ? "youtube"
          : "other";

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({
        artworkUrl: null,
        title: null,
        artist: null,
        service,
      });
    }

    const html = await response.text();

    const artworkUrl =
      cleanText(readMetaTag(html, "og:image")) ??
      cleanText(readMetaTag(html, "twitter:image"));

    const title =
      cleanText(readMetaTag(html, "og:title")) ??
      cleanText(readMetaTag(html, "twitter:title"));

    const description =
      cleanText(readMetaTag(html, "og:description")) ??
      cleanText(readMetaTag(html, "twitter:description"));

    return NextResponse.json({
      artworkUrl,
      title,
      artist: description,
      service,
    });
  } catch {
    return NextResponse.json({
      artworkUrl: null,
      title: null,
      artist: null,
      service: null,
    });
  }
}