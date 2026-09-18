import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "Terms of Use (Draft)" };

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Draft agreement"
      title="Terms of Use"
      summary="The proposed rules for using SIGNAL by Five Fifths, participating responsibly, and understanding the platform’s boundaries."
    >
      <h2>Draft status and agreement</h2>
      <p>
        These Terms are a launch-readiness draft requiring professional legal
        review. They describe the current product but are not final or
        attorney-approved. The final Terms will state their effective date and
        how acceptance is recorded.
      </p>

      <h2>Eligibility and account responsibility</h2>
      <p>
        SIGNAL is intended only for people age 18 or older. Members must provide
        accurate information, maintain one legitimate account, keep credentials
        secure, and promptly report suspected unauthorized access.
      </p>

      <h2>What SIGNAL provides</h2>
      <p>
        SIGNAL is an intentional participation platform containing Pulse,
        profiles, Sessions, Circles and Circle chat, Creator Commons, Fifth
        Realm, Passport, private messages, notifications, and safety tools.
        Features may change, pause, or become unavailable. SIGNAL does not
        promise admission, compatibility, attendance, compensation, creative
        success, or a particular outcome.
      </p>

      <h2>Acceptable use</h2>
      <p>Members may not use SIGNAL to:</p>
      <ul>
        <li>
          Harass, threaten, stalk, discriminate, exploit, sexually coerce, or
          retaliate against another person.
        </li>
        <li>
          Impersonate others; operate scams; spam; manipulate reports, roles,
          attendance, or Passport records; or evade a safety restriction.
        </li>
        <li>
          Publish illegal, hateful, extremist, sexually exploitative, severely
          graphic, malicious, or privacy-invasive material.
        </li>
        <li>
          Upload malware, probe security controls, scrape private information,
          overwhelm the service, or bypass authorization, moderation, rate
          limits, or media review.
        </li>
        <li>
          Infringe copyright, trademark, publicity, privacy, or other rights.
        </li>
      </ul>
      <p>
        Lawful creative, gaming, fashion, cosplay, educational, medical,
        lifestyle, and artistic material is not prohibited solely because it
        includes mature themes, fictional violence, weapons, anatomy, swimwear,
        or body art. Context and the Community Guidelines still apply.
      </p>

      <h2>Profiles and member content</h2>
      <p>
        Members retain ownership of original content they submit. By submitting
        content, a member grants Five Fifths a non-exclusive, worldwide,
        royalty-free license to host, process, reproduce, technically adapt,
        moderate, and display it only as needed to operate, secure, and improve
        SIGNAL. Members must have the rights and consent needed to share their
        content. Removal may not immediately erase restricted safety, audit,
        backup, or legal records where retention is necessary.
      </p>

      <h2>Sessions and offline participation</h2>
      <p>
        Sessions are member-created invitations, not Five Fifths supervision or
        endorsement. Members are responsible for evaluating hosts, locations,
        transportation, accessibility, cost, equipment, and personal safety. Use
        ordinary precautions and contact emergency services—not SIGNAL—if there
        is immediate danger.
      </p>

      <h2>Circles and Circle chat</h2>
      <p>
        Circle owners may set additional rules consistent with these Terms.
        Private membership does not prevent authorized safety review. Deleted
        Circle messages may be retained with restricted access for owner or
        platform review, abuse prevention, disputes, and legal or safety needs.
        Chat may not be used to harass, coordinate harm, expose private
        information, or evade reporting controls.
      </p>

      <h2>Creator Commons</h2>
      <p>
        Opportunity owners must describe scope, compensation, deadlines, and
        ownership expectations honestly. SIGNAL does not employ participants,
        guarantee payment, process escrow, provide tax advice, or create legal
        agreements between collaborators. Participants should document their own
        arrangement.
      </p>

      <h2>Fifth Realm</h2>
      <p>
        Game masters and players must communicate boundaries, use appropriate
        safety tools, respect consent, and follow campaign expectations. SIGNAL
        coordinates discovery and participation; it does not reproduce
        proprietary rules or operate a virtual tabletop.
      </p>

      <h2>Passport</h2>
      <p>
        Passport includes private verified participation records and separate
        onboarding milestones. Verified records arise only from authorized
        source workflows. Members may not self-verify, falsify, trade, or
        manipulate records. Entries may be corrected or revoked when their
        source changes or an administrative correction is required.
      </p>

      <h2>Moderation and enforcement</h2>
      <p>
        Five Fifths may restrict visibility, remove content, preserve evidence,
        limit features, suspend or terminate accounts, or refer matters to
        appropriate authorities when reasonably necessary to enforce policy,
        protect people, or comply with law. Reports receive human review where
        indicated. One ordinary failed moderation check does not automatically
        produce a permanent ban, while severe or repeated conduct may support
        stronger action. Appeal and legal-escalation procedures require final
        operational and legal approval.
      </p>

      <h2>Five Fifths intellectual property</h2>
      <p>
        SIGNAL, Five Fifths, associated logos, product names, design elements,
        and original platform materials belong to Five Fifths or its licensors.
        These Terms do not permit branding use that suggests sponsorship,
        endorsement, or affiliation.
      </p>

      <h2>Third-party services and availability</h2>
      <p>
        SIGNAL relies on providers such as Supabase and deployment, moderation,
        email, and infrastructure services. Member links may lead to third-party
        websites. Five Fifths does not control third-party terms, availability,
        security, or content. SIGNAL is provided on an “as available” basis and
        uninterrupted operation is not guaranteed.
      </p>

      <h2>Communications</h2>
      <p>
        Five Fifths may send necessary account, authentication, security,
        safety, participation, service, and material policy notices. Optional
        newsletters, fundraising, eHub updates, event promotions, and marketing
        communications require consent and an unsubscribe method.
      </p>

      <h2>Account closure and retained records</h2>
      <p>
        Members may request deactivation or deletion through available account
        controls. Reports, moderation decisions, security logs, transaction
        evidence, content needed to protect other members, and legally required
        records may be retained with restricted access. Final deletion and
        retention timelines require legal review.
      </p>

      <h2>Disclaimers, liability, and legal terms</h2>
      <p>
        Online and offline participation carries risk, and Five Fifths cannot
        verify every member, statement, location, opportunity, or interaction.
        Warranty disclaimers, liability limits, indemnity, dispute resolution,
        governing law, jurisdiction, legal notice address, and an effective date
        must be completed by counsel before launch.
      </p>

      <h2>Policy changes</h2>
      <p>
        Material changes will be communicated through reasonable service
        channels before taking effect when required. Review the related{" "}
        <Link href="/privacy">Privacy Policy</Link> and{" "}
        <Link href="/community-guidelines">Community Guidelines</Link>.
      </p>
    </LegalPage>
  );
}
