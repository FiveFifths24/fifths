import Link from "next/link";
import { ArrowRight, CheckCircle2, RadioTower } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import {
  activityDescription,
  nextActivityCursor,
  relativeActivityTime,
  type FriendActivityItem,
} from "./activity-data";

export function FriendsActivity({
  items,
  unavailable = false,
}: {
  items: FriendActivityItem[];
  unavailable?: boolean;
}) {
  const cursor = nextActivityCursor(items);

  return (
    <section
      aria-labelledby="friends-activity-title"
      className="relative mt-10 overflow-hidden rounded-[2rem] border border-[#6c14ce]/25 bg-black/45 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8"
    >
      <div className="flex items-center gap-3">
        <RadioTower aria-hidden="true" className="size-6 text-[#f359d2]" />
        <div>
          <p className="text-xs font-black tracking-[0.18em] text-[#ca9aff] uppercase">
            What&apos;s happening in your world
          </p>
          <h2
            className="mt-1 text-3xl font-bold tracking-tight text-white sm:text-4xl"
            id="friends-activity-title"
          >
            Signals From Friends
          </h2>
        </div>
      </div>

      {unavailable ? (
        <p className="mt-7 rounded-2xl border border-red-400/20 bg-red-400/5 p-5 text-sm text-red-100/80">
          Friend activity is temporarily unavailable. Your other Home tools are
          still here.
        </p>
      ) : items.length ? (
        <ol className="mt-7 divide-y divide-white/10">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                className="group flex min-h-20 items-center gap-4 rounded-2xl px-2 py-4 transition hover:bg-white/[0.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f359d2]"
                href={item.action_url}
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-[#f359d2]/30 bg-[#f359d2]/10 text-sm font-black text-white">
                  {item.actor_display_name.slice(0, 1).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm leading-6 text-white/70">
                    <strong className="text-white">
                      {item.actor_display_name}
                    </strong>{" "}
                    {activityDescription(item)}
                  </span>
                  <span className="mt-1 block text-xs font-bold tracking-wide text-white/35">
                    {relativeActivityTime(item.created_at)}
                  </span>
                </span>
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 shrink-0 text-white/30 transition group-hover:translate-x-1 group-hover:text-[#f359d2] motion-reduce:transform-none"
                />
              </Link>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-7 rounded-2xl border border-white/10 bg-white/[0.025] p-6 text-center text-sm leading-6 text-white/50">
          There are no new friend Signals in the last 30 days. Private and
          opted-out activity never appears here.
        </p>
      )}

      {!unavailable && cursor ? (
        <div className="mt-6 border-t border-white/10 pt-6 text-center">
          <ButtonLink
            href={`/home?activityBefore=${encodeURIComponent(cursor.createdAt)}&activityBeforeId=${encodeURIComponent(cursor.id)}`}
            variant="secondary"
          >
            See Earlier Friend Activity
          </ButtonLink>
        </div>
      ) : !unavailable ? (
        <div className="mt-7 rounded-[1.5rem] border border-emerald-300/20 bg-emerald-300/[0.04] p-6 text-center">
          <CheckCircle2
            aria-hidden="true"
            className="mx-auto size-7 text-emerald-300"
          />
          <h3 className="mt-3 text-xl font-bold text-white">
            You&apos;re Caught Up.
          </h3>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-white/50">
            You&apos;ve seen what&apos;s new in your world. You can leave it
            here—or intentionally explore beyond your circle.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/home/discover">
              Explore Beyond Your Circle
            </ButtonLink>
            <ButtonLink href="/home/messages" variant="secondary">
              Message A Friend
            </ButtonLink>
          </div>
        </div>
      ) : null}
    </section>
  );
}
