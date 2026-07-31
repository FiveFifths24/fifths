import type { Metadata } from "next";
import { ModuleOverview } from "@/components/modules/module-overview";
import { getPlatformModule } from "@/config/modules";

export const metadata: Metadata = { title: "Pulse" };
export default function PulsePage() {
  return <ModuleOverview module={getPlatformModule("pulse")!} />;
}
