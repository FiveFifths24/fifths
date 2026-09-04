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

  return (
    <section
      aria-labelledby="around-ecosystem-heading"
      className="mt-16 min-w-0 border-t border-white/10 pt-12 text-center sm:text-left"
    >
      <div className="flex min-w-0 flex-col items-center sm:items-start">
        <p className="flex items-center justify-center gap-2 text-xs font-black tracking-[0.18em] text-[#ca9aff] uppercase sm:justify-start">
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

      <div className="mt-7 grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-3">
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

      <div className="mt-8 flex justify-center sm:justify-start">
        <Link
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-bold text-white/70 transition hover:border-[#992bff]/50 hover:text-white"
          href="/home/discover"
        >
          <Sparkles aria-hidden="true" className="size-4 text-[#992bff]" />
          Explore all SIGNAL
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
    <div className="flex min-w-0 flex-col">
      {children}
      <Link
        className="mx-auto mt-3 inline-flex min-h-11 items-center justify-center rounded-full px-4 py-2 text-sm font-bold text-white/65 underline decoration-white/20 underline-offset-4 transition hover:text-white sm:mx-0 sm:self-start"
        href={featureHref}
      >
        {cta}
      </Link>
    </div>
  );
}
