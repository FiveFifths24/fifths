import type { Metadata } from "next";
import { ModuleOverview } from "@/components/modules/module-overview";
import { getPlatformModule } from "@/config/modules";

export const metadata: Metadata = { title: "Creator Commons" };
export default function CommonsPage() {
  return <ModuleOverview module={getPlatformModule("commons")!} />;
}
