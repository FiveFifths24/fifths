import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "Privacy Policy (Draft)" };

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Draft policy"
      title="Privacy Policy"
      summary="A plain-language preview of how FIFTHS intends to respect member information, choice, and context."
    >
      <h2>Our privacy approach</h2>
      <p>
        FIFTHS is being designed to collect only the information needed to
        provide accounts, preferences, discovery, participation, safety, and
        verified activity. This draft is not a final legal policy.
      </p>
      <h2>Information planned for the MVP</h2>
      <ul>
        <li>
          Account and profile information such as email, display name, username,
          age confirmation, city or region, bio, and profile image.
        </li>
        <li>
          Interests, skills, participation preferences, joined communities,
          registrations, opportunity responses, and campaign activity.
        </li>
        <li>
          Private Pulse check-ins, notifications, safety reports, and eligible
          verified Passport activity.
        </li>
      </ul>
      <h2>Information we will not request</h2>
      <p>
        The MVP will not request precise home addresses or medical diagnoses.
        Pulse preferences describe current participation context and are not
        health assessments.
      </p>
      <h2>Visibility and control</h2>
      <p>
        Profiles will include visibility controls. Private Pulse history,
        reports, applications, meeting links, and private feedback will be
        restricted to the member and authorized roles where appropriate.
      </p>
      <h2>Age boundary</h2>
      <p>
        The initial beta is intended only for adults age 18 and older. Youth
        accounts are outside the MVP.
      </p>
      <h2>Data use and sharing</h2>
      <p>
        Information will be used to operate FIFTHS, protect the community,
        provide transparent recommendations, and maintain verified
        participation. Final retention, deletion, vendor, cookie, and
        legal-request terms will be added after professional review.
      </p>
      <h2>Before launch</h2>
      <p>
        This policy requires legal review, a final vendor inventory, retention
        schedules, user-rights procedures, and confirmed contact information
        before public launch.
      </p>
    </LegalPage>
  );
}
