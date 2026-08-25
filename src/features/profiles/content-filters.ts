import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export type ContentPreferences = {
  hiddenUserIds: Set<string>;
  blockedWords: string[];
};

export async function loadContentPreferences(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<ContentPreferences> {
  const [mutes, blocks, words] = await Promise.all([
    supabase.from("profile_mutes").select("muted_id").eq("muter_id", userId),
    supabase
      .from("profile_blocks")
      .select("blocked_id")
      .eq("blocker_id", userId),
    supabase.from("profile_blocked_words").select("word").eq("user_id", userId),
  ]);
  return {
    hiddenUserIds: new Set([
      ...(mutes.data ?? []).map((item) => item.muted_id),
      ...(blocks.data ?? []).map((item) => item.blocked_id),
    ]),
    blockedWords: (words.data ?? []).map((item) => item.word.toLowerCase()),
  };
}

export function filterMemberContent<T>(
  items: T[],
  preferences: ContentPreferences,
  getAuthorId: (item: T) => string,
  getText: (item: T) => string,
) {
  return items.filter((item) => {
    if (preferences.hiddenUserIds.has(getAuthorId(item))) return false;
    const content = getText(item).toLowerCase();
    return !preferences.blockedWords.some((word) => content.includes(word));
  });
}
