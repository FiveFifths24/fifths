"use client";

import { useMemo, useState } from "react";
import { Filter, Sparkles } from "lucide-react";
import { SwipeCardGrid } from "@/components/ui/swipe-card-grid";

import { SessionCard, type SessionCardItem } from "./session-card";

type InterestOption = {
  id: string;
  name: string;
};

type Props = {
  sessions: SessionCardItem[];
  interests: InterestOption[];
};

type SessionFormatFilter = "all" | "online" | "in_person" | "hybrid";
type TimingFilter = "all" | "today" | "week" | "month";

const SIX_HOURS = 6 * 60 * 60 * 1000;

export function SessionResults({ sessions, interests }: Props) {
  const [selectedInterest, setSelectedInterest] = useState("");
  const [selectedFormat, setSelectedFormat] =
    useState<SessionFormatFilter>("all");
  const [selectedTiming, setSelectedTiming] = useState<TimingFilter>("all");

  const now = Date.now();
  const sixHoursFromNow = now + SIX_HOURS;

  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      if (
        selectedInterest &&
        !session.interestNames.some(
          (interest) =>
            interest.toLowerCase() === selectedInterest.toLowerCase(),
        )
      ) {
        return false;
      }

      if (selectedFormat !== "all" && session.format !== selectedFormat) {
        return false;
      }

      if (selectedTiming !== "all") {
        const startsAt = new Date(session.starts_at);
        const startTime = startsAt.getTime();

        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        const endOfWeek = new Date();
        endOfWeek.setDate(endOfWeek.getDate() + 7);

        const endOfMonth = new Date();
        endOfMonth.setMonth(endOfMonth.getMonth() + 1);

        if (selectedTiming === "today" && startTime > endOfToday.getTime()) {
          return false;
        }

        if (selectedTiming === "week" && startTime > endOfWeek.getTime()) {
          return false;
        }

        if (selectedTiming === "month" && startTime > endOfMonth.getTime()) {
          return false;
        }
      }

      return true;
    });
  }, [sessions, selectedFormat, selectedInterest, selectedTiming]);

  const currentSessions = filteredSessions.filter((session) => {
    const startsAt = Date.parse(session.starts_at);
    const endsAt = Date.parse(session.ends_at);

    return endsAt > now && startsAt <= sixHoursFromNow;
  });

  const upcomingSessions = filteredSessions.filter(
    (session) => Date.parse(session.starts_at) > sixHoursFromNow,
  );

  const hasFilters =
    selectedInterest || selectedFormat !== "all" || selectedTiming !== "all";

  function clearFilters() {
    setSelectedInterest("");
    setSelectedFormat("all");
    setSelectedTiming("all");
  }

  return (
    <div className="mt-12 min-w-0">
      <div className="rounded-[1.75rem] border border-white/10 bg-black/35 p-4 sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="flex items-center justify-center gap-2 text-xs font-black tracking-[0.18em] text-[#ca9aff] uppercase sm:justify-start">
              <Filter aria-hidden="true" className="size-4" />
              Filter Sessions
            </p>

            <p className="mt-2 text-sm leading-6 text-white/45">
              Narrow the Session board by what you&apos;re interested in.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[46rem]">
            <label className="min-w-0">
              <span className="mb-2 block text-[0.65rem] font-black tracking-[0.14em] text-white/35 uppercase">
                Interest
              </span>

              <select
                className="min-h-11 w-full rounded-xl border border-white/10 bg-[#09090d] px-3 text-sm font-semibold text-white/75 transition outline-none focus:border-[#992bff]/60"
                onChange={(event) => setSelectedInterest(event.target.value)}
                value={selectedInterest}
              >
                <option value="">All Interests</option>

                {interests.map((interest) => (
                  <option key={interest.id} value={interest.name}>
                    {interest.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="min-w-0">
              <span className="mb-2 block text-[0.65rem] font-black tracking-[0.14em] text-white/35 uppercase">
                Format
              </span>

              <select
                className="min-h-11 w-full rounded-xl border border-white/10 bg-[#09090d] px-3 text-sm font-semibold text-white/75 transition outline-none focus:border-[#992bff]/60"
                onChange={(event) =>
                  setSelectedFormat(event.target.value as SessionFormatFilter)
                }
                value={selectedFormat}
              >
                <option value="all">Any Format</option>
                <option value="in_person">In Person</option>
                <option value="online">Online</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </label>

            <label className="min-w-0">
              <span className="mb-2 block text-[0.65rem] font-black tracking-[0.14em] text-white/35 uppercase">
                When
              </span>

              <select
                className="min-h-11 w-full rounded-xl border border-white/10 bg-[#09090d] px-3 text-sm font-semibold text-white/75 transition outline-none focus:border-[#992bff]/60"
                onChange={(event) =>
                  setSelectedTiming(event.target.value as TimingFilter)
                }
                value={selectedTiming}
              >
                <option value="all">Any Time</option>
                <option value="today">Today</option>
                <option value="week">Next 7 Days</option>
                <option value="month">Next 30 Days</option>
              </select>
            </label>
          </div>
        </div>

        {hasFilters ? (
          <button
            className="mt-4 text-xs font-bold text-[#ca9aff] underline decoration-[#992bff]/40 underline-offset-4 transition hover:text-white"
            onClick={clearFilters}
            type="button"
          >
            Clear filters
          </button>
        ) : null}
      </div>

      <SessionSection
        description="Sessions happening now or beginning within the next six hours."
        emptyMessage="Nothing is happening right now. Check the upcoming Sessions below."
        heading="Current Sessions"
        sessions={currentSessions}
      />

      <SessionSection
        description="Plans and activities starting more than six hours from now."
        emptyMessage={
          hasFilters
            ? "No upcoming Sessions match these filters."
            : "No upcoming Sessions have been published yet."
        }
        heading="Upcoming Sessions"
        sessions={upcomingSessions}
      />
    </div>
  );
}

function SessionSection({
  heading,
  description,
  sessions,
  emptyMessage,
}: {
  heading: string;
  description: string;
  sessions: SessionCardItem[];
  emptyMessage: string;
}) {
  return (
    <section className="mt-12 min-w-0">
      <div className="flex flex-col items-center sm:items-start">
        <div className="flex items-center gap-2">
          <Sparkles aria-hidden="true" className="size-5 text-[#992bff]" />

          <h2 className="text-2xl font-bold text-white">{heading}</h2>
        </div>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">
          {description}
        </p>
      </div>

      {sessions.length ? (
        <SwipeCardGrid className="mt-6 gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {sessions.map((session) => (
            <SessionCard item={session} key={session.id} />
          ))}
        </SwipeCardGrid>
      ) : (
        <div className="mt-6 rounded-[1.5rem] border border-[#992bff]/15 bg-[#992bff]/[0.025] px-6 py-8 text-center">
          <p className="text-sm leading-6 text-white/45">{emptyMessage}</p>
        </div>
      )}
    </section>
  );
}
