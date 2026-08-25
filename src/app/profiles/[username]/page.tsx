import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Radio } from "lucide-react";
import { Container } from "@/components/ui/container";
import { signProfileMedia } from "@/features/profiles/profile-media";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  return { title: `@${username} on SIGNAL` };
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_public_profile", {
    p_username: username,
  });
  const profile = data?.[0];
  if (!profile) notFound();
  const [avatarUrl, backgroundUrl] = await Promise.all([
    signProfileMedia(supabase, profile.avatar_url),
    signProfileMedia(supabase, profile.cover_image_url),
  ]);

  return (
    <Container className="py-16 sm:py-24">
      <article className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-black/55">
        <div
          className="relative min-h-80 bg-gradient-to-br from-[#14051f] via-[#4d0d79] to-[#071321] bg-cover bg-center"
          style={
            backgroundUrl
              ? {
                  backgroundImage: `linear-gradient(rgba(0,0,0,.28),rgba(0,0,0,.78)),url(${JSON.stringify(backgroundUrl).slice(1, -1)})`,
                }
              : undefined
          }
        >
          <div className="absolute inset-x-0 bottom-0 p-7 sm:p-10">
            <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-end">
              <div
                aria-label={`${profile.display_name}'s profile photo`}
                className="size-28 rounded-full border-4 border-black bg-gradient-to-br from-[#992bff] to-[#f359d2] bg-cover bg-center"
                role="img"
                style={
                  avatarUrl
                    ? {
                        backgroundImage: `url(${JSON.stringify(avatarUrl).slice(1, -1)})`,
                      }
                    : undefined
                }
              />
              <div className="text-center sm:text-left">
                <p className="flex items-center justify-center gap-2 text-xs font-bold tracking-[0.2em] text-[#f359d2] uppercase sm:justify-start">
                  <Radio aria-hidden="true" className="size-4" />
                  Public SIGNAL
                </p>
                <h1 className="display-type mt-3 text-5xl text-white sm:text-7xl">
                  {profile.display_name}
                </h1>
                <p className="mt-2 font-bold text-white/55">
                  @{profile.username}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="p-7 sm:p-10">
          {profile.bio ? (
            <p className="max-w-3xl text-lg leading-8 text-white/70">
              {profile.bio}
            </p>
          ) : null}
          {profile.city || profile.region ? (
            <p className="mt-5 flex items-center justify-center gap-2 text-sm text-white/45 sm:justify-start">
              <MapPin aria-hidden="true" className="size-4" />
              {[profile.city, profile.region].filter(Boolean).join(", ")}
            </p>
          ) : null}
          <div className="mt-8 flex flex-wrap justify-center gap-3 sm:justify-start">
            <Link
              className="min-h-12 rounded-full bg-[#992bff] px-6 py-3 font-bold text-white"
              href={`/login?next=/home/profiles/${profile.username}`}
            >
              Connect on SIGNAL
            </Link>
            <Link
              className="min-h-12 rounded-full border border-white/15 px-6 py-3 font-bold text-white"
              href="/signup"
            >
              Join SIGNAL
            </Link>
          </div>
        </div>
      </article>
    </Container>
  );
}
