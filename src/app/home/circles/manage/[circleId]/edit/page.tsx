import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AccountUnavailable } from "@/components/account/account-unavailable";
import { ButtonLink } from "@/components/ui/button-link";
import { StatusMessage } from "@/components/ui/status-message";
import { EditCircleForm } from "@/features/circles/edit-circle-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Edit Circle",
};

export const dynamic = "force-dynamic";

export default async function EditCirclePage({
  params,
}: {
  params: Promise<{ circleId: string }>;
}) {
  const { circleId } = await params;

  let supabase;

  try {
    supabase = await createClient();
  } catch {
    return <AccountUnavailable />;
  }

  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return <AccountUnavailable />;
  }

  const [circleResult, membershipResult, platformRoleResult] =
    await Promise.all([
      supabase
        .from("circles")
        .select("*")
        .eq("id", circleId)
        .maybeSingle(),

      supabase
        .from("circle_members")
        .select("role, status")
        .eq("circle_id", circleId)
        .eq("user_id", userData.user.id)
        .maybeSingle(),

      supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userData.user.id),
    ]);

  if (circleResult.error || !circleResult.data) {
    notFound();
  }

  const circle = circleResult.data;
  const membership = membershipResult.data;

  const isPlatformAdmin = (platformRoleResult.data ?? []).some(
    (item) => item.role === "platform_admin",
  );

  const canManage =
    isPlatformAdmin ||
    (membership?.status === "active" && membership.role === "owner");

  if (!canManage) {
    notFound();
  }

  if (circle.status === "archived") {
    return (
      <div className="mx-auto max-w-5xl">
        <ButtonLink
          href={`/home/circles/manage/${circle.id}`}
          variant="quiet"
        >
          ← Back to Circle
        </ButtonLink>

        <div className="mt-8">
          <StatusMessage tone="error">
            Archived Circles cannot be edited.
          </StatusMessage>
        </div>
      </div>
    );
  }

  const [modeResult, interestResult, selectedInterestResult] =
    await Promise.all([
      supabase
        .from("modes")
        .select("id, name")
        .eq("active", true)
        .order("sort_order"),

      supabase
        .from("interests")
        .select("id, name")
        .eq("active", true)
        .order("name"),

      supabase
        .from("circle_interests")
        .select("interest_id")
        .eq("circle_id", circle.id)
        .limit(1)
        .maybeSingle(),
    ]);

  if (
    modeResult.error ||
    interestResult.error ||
    selectedInterestResult.error
  ) {
    return (
      <div className="mx-auto max-w-5xl">
        <ButtonLink
          href={`/home/circles/manage/${circle.id}`}
          variant="quiet"
        >
          ← Back to Circle
        </ButtonLink>

        <div className="mt-8">
          <StatusMessage tone="error">
            This Circle could not be prepared for editing.
          </StatusMessage>
        </div>
      </div>
    );
  }

  const selectedInterestId =
    selectedInterestResult.data?.interest_id ?? "";

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="text-center sm:text-left">
        <ButtonLink
          href={`/home/circles/manage/${circle.id}`}
          variant="quiet"
        >
          ← Back to Circle
        </ButtonLink>
      </div>

      <header className="mt-8 text-center sm:text-left">
        <p className="text-xs font-bold tracking-[0.2em] text-[#ee54a7] uppercase">
          Circle Management
        </p>

        <h1 className="display-type mt-4 text-5xl leading-[0.95] text-white sm:text-7xl">
          Edit {circle.name}
        </h1>

        <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-white/55 sm:mx-0 sm:text-lg">
          Update the Circle&apos;s identity, access settings, topic, and Pulse
          fit without changing its lifecycle status.
        </p>
      </header>

      <section className="mt-10 rounded-[2rem] border border-[#ee54a7]/15 bg-[#ee54a7]/[0.025] p-6 sm:p-8 lg:p-10">
        <EditCircleForm
          circle={circle}
          interests={interestResult.data ?? []}
          modes={modeResult.data ?? []}
          selectedInterestId={selectedInterestId}
        />
      </section>
    </div>
  );
}