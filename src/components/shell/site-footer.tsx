import Link from "next/link";
import { Container } from "@/components/ui/container";

const footerGroups = [
  {
    title: "Explore",
    links: [
      ["Ecosystem", "/ecosystem"],
      ["About", "/about"],
      ["Pulse", "/pulse"],
      ["Circles", "/circles"],
      ["Creator Commons", "/commons"],
      ["Fifth Realm", "/realm"],
      ["Passport", "/passport"],
    ],
  },
  {
    title: "Community",
    links: [
      ["Your account", "/account"],
      ["Your Home", "/home"],
      ["Community Guidelines", "/community-guidelines"],
      ["Commons Guidelines", "/commons/guidelines"],
      ["Realm Safety", "/realm/safety"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["Privacy", "/privacy"],
      ["Terms", "/terms"],
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-800 bg-neutral-950">
      <Container className="grid gap-12 py-14 lg:grid-cols-[1.3fr_2fr] lg:py-18">
        <div>
          <Link
            className="text-xl font-black tracking-[0.16em] text-white"
            href="/"
          >
            FIFTHS<span className="text-red-500">.</span>
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-6 text-neutral-400">
            Find your space. Match your energy. A connected community platform
            being built by Five Fifths.
          </p>
          <p className="mt-7 text-xs text-neutral-500">
            Initial beta planned for adults 18 and older.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {footerGroups.map((group) => (
            <div key={group.title}>
              <h2 className="text-xs font-bold tracking-[0.16em] text-neutral-500 uppercase">
                {group.title}
              </h2>
              <ul className="mt-4 space-y-3">
                {group.links.map(([label, href]) => (
                  <li key={href}>
                    <Link
                      className="inline-flex min-h-8 items-center text-sm text-neutral-300 hover:text-white"
                      href={href}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>
      <div className="border-t border-neutral-800">
        <Container className="flex flex-col gap-2 py-5 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Five Fifths. All rights reserved.</p>
          <p>
            Phase 3 Pulse foundation · Sessions and participation remain in
            development.
          </p>
        </Container>
      </div>
    </footer>
  );
}
