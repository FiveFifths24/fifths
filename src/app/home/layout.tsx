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

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, username, onboarding_completed_at")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (!profile?.onboarding_completed_at) redirect("/onboarding");

  return (
    <MemberShell
      displayName={profile.display_name ?? profile.username ?? "Member"}
    >
      {children}
    </MemberShell>
  );
}
