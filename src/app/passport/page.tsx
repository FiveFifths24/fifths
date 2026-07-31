import type { Metadata } from "next";
import { ModuleOverview } from "@/components/modules/module-overview";
import { getPlatformModule } from "@/config/modules";

export const metadata: Metadata = { title: "Passport" };
export default function PassportPage() {
  return <ModuleOverview module={getPlatformModule("passport")!} />;
}
