"use client";

import { useEffect } from "react";
import { recordProfileViewAction } from "./actions";

export function ProfileViewTracker({ profileId }: { profileId: string }) {
  useEffect(() => {
    void recordProfileViewAction(profileId);
  }, [profileId]);

  return null;
}
