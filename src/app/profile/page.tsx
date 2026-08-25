import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CurrentProfilePage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login?next=/profile");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, onboarding_completed_at")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (!profile?.onboarding_completed_at || !profile.username) {
    redirect("/onboarding");
  }

  redirect(`/home/profiles/${profile.username}`);
}
