import Link from "next/link";
import { Compass, Sparkles } from "lucide-react";

import {
  CampaignResultCard,
  CircleResultCard,
  CommonsResultCard,
  type CampaignResultCardProps,
  type CircleResultCardProps,
  type CommonsResultCardProps,
} from "@/features/discovery/ecosystem-result-cards";
import type { SubSignalSource } from "./sub-signal-data";

type Props = {
  campaign?: CampaignResultCardProps;
  circle?: CircleResultCardProps;
  commons?: CommonsResultCardProps;
  unavailableSources?: SubSignalSource[];
};

export function AroundEcosystem({
  campaign,
  circle,
  commons,
  unavailableSources = [],
}: Props) {
  if (!campaign && !circle && !commons) return null;
  const previewCount = [campaign, circle, commons].filter(Boolean).length;

const previewGridClass =
  previewCount === 3
    ? "lg:grid-cols-3"
    : previewCount === 2
      ? "lg:grid-cols-2"
      : "lg:grid-cols-1";

  return (
    <section
      aria-labelledby="around-ecosystem-heading"
      className="mt-16 min-w-0 border-t border-white/10 pt-12 text-center sm:text-left"
    >
      <div className="flex min-w-0 flex-col items-center text-center">
        <p className="flex items-center justify-center gap-2 text-xs font-black tracking-[0.18em] text-[#ca9aff] uppercase">
          <Compass aria-hidden="true" className="size-4" />
          Discovery Bridge
        </p>
        <h2
          className="mt-3 max-w-full text-3xl font-bold break-words text-white"
          id="around-ecosystem-heading"
        >
          Around The Ecosystem
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 break-words text-white/50">
          A small window into other places where people are creating, gathering,
          and building across SIGNAL.
        </p>
      </div>

      {unavailableSources.length ? (
        <p className="mt-4 text-sm leading-6 text-white/45">
          Some ecosystem suggestions are temporarily unavailable. The available
          picks are still shown below.
        </p>
      ) : null}

      <div
  className={`mt-7 grid min-w-0 grid-cols-1 items-stretch gap-6 ${previewGridClass}`}
>
        {campaign ? (
          <FeaturePreview cta="Explore Fifth Realm" featureHref="/home/realm">
            <CampaignResultCard {...campaign} />
          </FeaturePreview>
        ) : null}
        {circle ? (
          <FeaturePreview cta="See More Circles" featureHref="/home/circles">
            <CircleResultCard {...circle} />
          </FeaturePreview>
        ) : null}
        {commons ? (
          <FeaturePreview
            cta="Explore Creator Commons"
            featureHref="/home/commons"
          >
            <CommonsResultCard {...commons} />
          </FeaturePreview>
        ) : null}
      </div>

      <div className="mt-10 flex justify-center">
<Link
  className="group inline-flex min-h-12 items-center gap-2.5 rounded-full border border-[#992bff]/35 bg-[linear-gradient(135deg,rgba(108,20,206,0.18),rgba(153,43,255,0.08))] px-6 py-3 text-sm font-black tracking-wide text-[#ead7ff] shadow-[0_0_28px_rgba(153,43,255,0.08)] transition hover:-translate-y-0.5 hover:border-[#992bff]/65 hover:bg-[#992bff]/15 hover:text-white hover:shadow-[0_0_34px_rgba(153,43,255,0.16)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#992bff] motion-reduce:transform-none"
  href="/home/discover"
>
  <Sparkles
    aria-hidden="true"
    className="size-4 text-[#c084fc] transition group-hover:scale-110"
  />
  Explore All SIGNALs
</Link>
      </div>
    </section>
  );
}

function FeaturePreview({
  cta,
  featureHref,
  children,
}: {
  cta: string;
  featureHref: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full min-w-0 flex-col">
      {children}
      <Link
        className="mx-auto mt-3 inline-flex min-h-11 items-center justify-center rounded-full px-4 py-2 text-sm font-bold text-white/65 underline decoration-white/20 underline-offset-4 transition hover:text-white"
        href={featureHref}
      >
        {cta}
      </Link>
    </div>
  );
}
