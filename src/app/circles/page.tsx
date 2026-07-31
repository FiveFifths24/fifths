import type { Metadata } from "next";
import { ModuleOverview } from "@/components/modules/module-overview";
import { getPlatformModule } from "@/config/modules";

export const metadata: Metadata = { title: "Circles" };
export default function CirclesPage() {
  return <ModuleOverview module={getPlatformModule("circles")!} />;
}
