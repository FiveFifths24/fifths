import type { Metadata } from "next";
import { SiteFooter } from "@/components/shell/site-footer";
import { SiteHeader } from "@/components/shell/site-header";
import { ProfilePresenceHeartbeat } from "@/features/profiles/profile-presence-heartbeat";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "FIFTHS — Find your space. Match your energy.",
    template: "%s · FIFTHS",
  },
  description:
    "FIFTHS connects daily capacity with communities, creator opportunities, immersive worlds, and meaningful experiences.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a
          className="fixed top-3 left-4 z-[100] -translate-y-24 rounded-full bg-white px-5 py-3 font-bold text-black transition-transform focus:translate-y-0"
          href="#main-content"
        >
          Skip to main content
        </a>
        <SiteHeader />
        <ProfilePresenceHeartbeat />
        <main id="main-content">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
