import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, MapPin, Radio, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/container";
import { signProfileMedia } from "@/features/profiles/profile-media";
import { ProfileWallpaper } from "@/features/profiles/profile-wallpaper";
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
  const [avatarUrl, landscapeUrl, experienceResult] = await Promise.all([
    signProfileMedia(supabase, profile.avatar_url),
    signProfileMedia(supabase, profile.cover_image_url),
    supabase.rpc("get_profile_experience", { p_user_id: profile.id }),
  ]);
  const experience = experienceResult.data?.[0];
  const accentColor = experience?.profile_accent_color ?? "#a855f7";
  const backgroundUrl = await signProfileMedia(
    supabase,
    experience?.background_image_url ?? null,
  );
  const cardStyle = { borderColor: accentColor };

  return (
    <ProfileWallpaper backgroundUrl={backgroundUrl}>
      <Container className="py-16 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <article
            className="overflow-hidden rounded-[2rem] border bg-black/40 shadow-[0_28px_90px_rgba(0,0,0,.45)] backdrop-blur-[2px]"
            style={cardStyle}
          >
            <div
              className="relative min-h-80 bg-[radial-gradient(circle_at_75%_20%,rgba(243,89,210,.22),transparent_30%),linear-gradient(135deg,#160626,#070711_58%,#071b20)] bg-cover bg-center"
              style={
                landscapeUrl
                  ? {
                      backgroundImage: `linear-gradient(rgba(0,0,0,.2),rgba(0,0,0,.7)),url(${JSON.stringify(landscapeUrl).slice(1, -1)})`,
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
                    style={{
                      borderColor: accentColor,
                      ...(avatarUrl
                        ? {
                            backgroundImage: `url(${JSON.stringify(avatarUrl).slice(1, -1)})`,
                          }
                        : {}),
                    }}
                  />
                  <div className="text-center sm:text-left">
                    <p className="flex items-center justify-center gap-2 text-xs font-bold tracking-[0.2em] text-[#f359d2] uppercase sm:justify-start">
                      <Radio aria-hidden="true" className="size-4" />
                      Public SIGNAL
                    </p>
                    <h1 className="display-type mt-3 text-5xl text-white capitalize sm:text-7xl">
                      {profile.display_name}
                    </h1>
                    <p className="mt-2 font-bold text-white/55">
                      @{profile.username}
                    </p>
                    {experience?.status_text ? (
                      <div
                        className="mt-4 max-w-xl rounded-2xl border bg-black/55 px-4 py-3 text-sm leading-6 text-white/80 backdrop-blur-md"
                        style={cardStyle}
                      >
                        <p className="flex items-start gap-2">
                          <Radio
                            aria-hidden="true"
                            className="mt-1 size-4 shrink-0"
                            style={{ color: accentColor }}
                          />
                          <span>{experience.status_text}</span>
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-white/10 bg-black/30 p-7 sm:p-10">
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

          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {[
              ["Friends", experience?.friend_count ?? 0],
              ["Followers", experience?.follower_count ?? 0],
              ["Following", experience?.following_count ?? 0],
            ].map(([label, count]) => (
              <section
                className="rounded-[1.5rem] border bg-black/55 p-5 text-center backdrop-blur-md"
                key={label}
                style={cardStyle}
              >
                <p className="text-2xl font-bold text-white">{count}</p>
                <p className="text-xs text-white/40">{label}</p>
              </section>
            ))}
          </div>

          {experience?.spotlight_title ? (
            <section
              className="mt-6 rounded-[1.5rem] border bg-black/55 p-6 backdrop-blur-md"
              style={cardStyle}
            >
              <div className="flex items-center gap-3">
                <Sparkles
                  aria-hidden="true"
                  className="size-5"
                  style={{ color: accentColor }}
                />
                <h2 className="text-xl font-bold text-white">
                  Pinned spotlight
                </h2>
              </div>
              <h3 className="mt-4 text-2xl font-bold text-white">
                {experience.spotlight_title}
              </h3>
              {experience.spotlight_description ? (
                <p className="mt-3 max-w-3xl leading-7 text-white/65">
                  {experience.spotlight_description}
                </p>
              ) : null}
              {experience.spotlight_url ? (
                <a
                  className="mt-5 inline-flex items-center gap-2 text-sm font-bold hover:underline"
                  href={experience.spotlight_url}
                  rel="noreferrer"
                  style={{ color: accentColor }}
                  target="_blank"
                >
                  Visit spotlight
                  <ExternalLink aria-hidden="true" className="size-4" />
                </a>
              ) : null}
            </section>
          ) : null}
        </div>
      </Container>
    </ProfileWallpaper>
  );
}
