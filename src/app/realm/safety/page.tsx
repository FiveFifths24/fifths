import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Fifth Realm Safety Guidelines (Draft)",
};

export default function RealmSafetyPage() {
  return (
    <LegalPage
      eyebrow="Draft play standard"
      title="Fifth Realm Safety Guidelines"
      summary="A planning framework for campaign discovery and immersive storytelling with clear boundaries and informed participation."
    >
      <h2>Set expectations before play</h2>
      <p>
        Campaign profiles should clearly state format, system, experience level,
        schedule, capacity, age requirement, content notes, accessibility
        information, and whether an application is required.
      </p>
      <h2>Consent and boundaries</h2>
      <p>
        Game masters and players should agree on table expectations, safety
        tools, communication norms, content boundaries, and how someone can
        pause or leave participation without retaliation.
      </p>
      <h2>Content notes</h2>
      <p>
        Material themes should be described plainly enough for informed choice
        without exposing private member information or forcing anyone to explain
        a personal or medical reason.
      </p>
      <h2>Community conduct</h2>
      <p>
        Harassment, discrimination, threats, coercion, nonconsensual content,
        and deliberate boundary violations are not permitted. Reports will
        receive human review.
      </p>
      <h2>Copyright boundary</h2>
      <p>
        Fifth Realm coordinates people and campaigns. It will not reproduce
        copyrighted tabletop rules, proprietary character builders, virtual
        maps, rulebooks, or other unauthorized game content.
      </p>
      <h2>Participation and Passport</h2>
      <p>
        Campaign participation can contribute to Passport only through an
        authorized verification process. Passport is not a public competition or
        player ranking.
      </p>
      <h2>Adult beta and legal review</h2>
      <p>
        The initial beta is for adults 18 and older. Final emergency, venue,
        reporting, removal, appeal, and organizer-liability procedures require
        legal and operational review before launch.
      </p>
    </LegalPage>
  );
}
