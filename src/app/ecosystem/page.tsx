import type { Metadata } from "next";
import { PageHero } from "@/components/shell/page-hero";
import { ModuleCard } from "@/components/modules/module-card";
import { ParticipationLoop } from "@/components/modules/participation-loop";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { platformModules } from "@/config/modules";

export const metadata: Metadata = { title: "Ecosystem" };

export default function EcosystemPage() {
  return (
    <>
      <PageHero
        eyebrow="The FIFTHS ecosystem"
        title="One identity across every way you show up."
        description="Pulse, Circles, Creator Commons, Fifth Realm, and Passport are designed as connected parts of a single participation system."
      />
      <section className="py-20 sm:py-28">
        <Container>
          <SectionHeading
            eyebrow="Five products"
            title="Enter where it makes sense today."
            description="Each door has a distinct purpose. Shared context keeps movement between them coherent."
          />
          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            {platformModules.map((module, index) => (
              <ModuleCard index={index} key={module.slug} module={module} />
            ))}
          </div>
        </Container>
      </section>
      <section className="border-t border-neutral-800 bg-neutral-950 py-20 sm:py-28">
        <Container>
          <SectionHeading
            eyebrow="How they connect"
            title="A loop built around participation—not attention."
          />
          <ParticipationLoop />
        </Container>
      </section>
    </>
  );
}
