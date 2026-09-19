import { redirect } from "next/navigation";
import { AccountUnavailable } from "@/components/account/account-unavailable";
import { MemberShell } from "@/components/member/member-shell";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HomeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return <AccountUnavailable />;
  }

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login?next=/home");

  const [
    { data: profile },
    { data: tutorialProgress, error: tutorialProgressError },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, username, onboarding_completed_at")
      .eq("id", userData.user.id)
      .maybeSingle(),

    supabase
      .from("signal_tutorial_progress")
      .select("status, current_step")
      .eq("user_id", userData.user.id)
      .maybeSingle(),
  ]);

  if (tutorialProgressError) {
    console.error("Failed to load tutorial progress:", tutorialProgressError);
  }

  if (!profile?.onboarding_completed_at) redirect("/onboarding");

  const continueTourHref =
    tutorialProgress?.status === "in_progress"
      ? `/home/getting-started?step=${tutorialProgress.current_step ?? 0}`
      : null;

  return (
    <MemberShell
      continueTourHref={continueTourHref}
      displayName={profile.display_name ?? profile.username ?? "Member"}
    >
      {children}
    </MemberShell>
  );
}
