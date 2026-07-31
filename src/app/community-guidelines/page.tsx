import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "Community Guidelines (Draft)" };

export default function CommunityGuidelinesPage() {
  return (
    <LegalPage
      eyebrow="Draft community standard"
      title="Community Guidelines"
      summary="A shared baseline for building spaces where people can participate with dignity, clarity, and choice."
    >
      <h2>The standard</h2>
      <p>
        FIFTHS communities should make purpose, expectations, access context,
        and boundaries visible. Membership never removes another person’s right
        to safety, privacy, or respectful treatment.
      </p>
      <h2>Expected behavior</h2>
      <ul>
        <li>
          Respect names, identities, boundaries, time, and participation
          choices.
        </li>
        <li>
          Communicate expectations honestly and correct misleading information.
        </li>
        <li>Use content notes and accessibility information responsibly.</li>
        <li>Honor moderator, host, and venue safety directions.</li>
      </ul>
      <h2>Not permitted</h2>
      <ul>
        <li>
          Harassment, discrimination, threats, stalking, exploitation, or
          retaliation.
        </li>
        <li>
          Spam, impersonation, deceptive opportunities, unsafe instructions, or
          nonconsensual content.
        </li>
        <li>
          Intellectual-property violations or unauthorized copyrighted material.
        </li>
        <li>
          Attempts to manipulate roles, Passport credit, reports, or
          verification.
        </li>
      </ul>
      <h2>Participation context is not a diagnosis</h2>
      <p>
        Members can describe stimulation and social preferences without
        disclosing medical diagnoses. No one should pressure another member to
        reveal health information.
      </p>
      <h2>Reporting and review</h2>
      <p>
        Members will be able to report users and content. Reports will enter a
        restricted moderation queue for human review. Serious concerns can be
        escalated; permanent punishments will not be automated.
      </p>
      <h2>Adult beta</h2>
      <p>
        The initial beta is planned for adults 18 and older. Youth accounts and
        youth-focused moderation policies are intentionally outside the MVP.
      </p>
      <h2>Before launch</h2>
      <p>
        Enforcement levels, appeal routes, emergency escalation, evidence
        retention, and moderator training require final operational and legal
        review.
      </p>
    </LegalPage>
  );
}
