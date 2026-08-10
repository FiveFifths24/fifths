import Link from "next/link";

import { Container } from "@/components/ui/container";

const footerGroups = [
  {
    title: "Explore",
    links: [
      ["Home", "/"],
      ["Ecosystem", "/ecosystem"],
      ["Circles", "/circles"],
      ["Fifth Realm", "/realm"],
      ["Passport", "/passport"],
      ["eHub", "https://fivefifthsnp.com/ehub"],
    ],
  },
  {
    title: "Community",
    links: [
      ["Your Account", "/account"],
      ["Your Home", "/home"],
      ["Community Guidelines", "/community-guidelines"],
      ["Commons Guidelines", "/commons/guidelines"],
      ["Realm Safety", "/realm/safety"],
      ["Volunteer & Impact", "/passport"],
    ],
  },
  {
    title: "Five Fifths",
    links: [
      ["About", "/about"],
      ["Creator Commons", "/commons"],
      ["Digital Training", "https://fivefifthsnp.com"],
      ["Five Fifths Website", "https://fivefifthsnp.com"],
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
    <footer className="relative overflow-hidden border-t border-[#f359d2]/40 bg-[#020205]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-10 -left-32 size-80 rounded-full bg-[#6c14ce]/10 blur-[130px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-36 bottom-0 size-80 rounded-full bg-[#f359d2]/8 blur-[140px]"
      />

      <Container className="relative grid gap-14 py-16 text-center lg:grid-cols-[1.15fr_2fr] lg:gap-20 lg:py-20">
        <div>
          <Link
            className="inline-flex flex-col leading-none"
            href="/"
            aria-label="SIGNAL powered by Five Fifths"
          >
            <span className="text-2xl font-black tracking-[0.16em] text-white uppercase">
              SIGNAL<span className="text-[#f359d2]">.</span>
            </span>

            <span className="mt-2 text-[0.48rem] font-bold tracking-[0.2em] text-white/45 uppercase">
              Powered by Five Fifths
            </span>
          </Link>

          <p className="mt-7 max-w-md text-base leading-7 text-white/60">
            Find people, places, and plans that match your energy, capacity, and
            comfort level.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-4">
          {footerGroups.map((group) => (
            <div key={group.title}>
              <h2 className="text-[0.68rem] font-bold tracking-[0.2em] text-white/45 uppercase">
                {group.title}
              </h2>

              <ul className="mt-5 space-y-3">
                {group.links.map(([label, href]) => {
                  const external = href.startsWith("http");

                  return (
                    <li key={`${group.title}-${label}`}>
                      {external ? (
                        <a
                          className="inline-flex min-h-8 items-center text-sm text-white/65 transition-colors hover:text-white"
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {label}
                        </a>
                      ) : (
                        <Link
                          className="inline-flex min-h-8 items-center text-sm text-white/65 transition-colors hover:text-white"
                          href={href}
                        >
                          {label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </Container>

      <div className="relative border-t border-[#f359d2]/40">
        <Container className="flex flex-col items-center justify-center gap-3 py-6 text-center text-xs text-white/40 sm:flex-row">
          <p>© {new Date().getFullYear()} Five Fifths. All Rights Reserved.</p>
        </Container>
      </div>
    </footer>
  );
}
