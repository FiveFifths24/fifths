import type { Metadata } from "next";
import { ModuleOverview } from "@/components/modules/module-overview";
import { getPlatformModule } from "@/config/modules";

export const metadata: Metadata = { title: "Fifth Realm" };
export default function RealmPage() {
  return <ModuleOverview module={getPlatformModule("realm")!} />;
}
