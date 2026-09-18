import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "Privacy Policy (Draft)" };

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Draft policy"
      title="Privacy Policy"
      summary="A plain-language description of information SIGNAL currently uses, why it is needed, and the choices members have."
    >
      <h2>Draft status</h2>
      <p>
        This policy describes the current SIGNAL application and requires
        professional legal review before launch. It does not promise protections
        the product cannot technically or operationally guarantee.
      </p>

      <h2>Information SIGNAL processes</h2>
      <ul>
        <li>
          <strong>Account data:</strong> email address, authentication records,
          account identifiers, age confirmation, roles, and security/session
          information handled through Supabase Auth.
        </li>
        <li>
          <strong>Profile data:</strong> username, display name, pronouns,
          timezone, broad city/region/country, bio, interests, skills,
          accessibility preferences, profile visibility, links, music, status,
          custom appearance, photos, wallpapers, and featured connections.
        </li>
        <li>
          <strong>Participation data:</strong> private Pulse check-ins, Session
          creation and registration, attendance, Circle membership and chat,
          Commons opportunities and responses, Realm campaigns and applications,
          and private verified Passport records.
        </li>
        <li>
          <strong>Social and communication data:</strong> friendships, follows,
          blocks, mutes, private messages, notifications, activity-sharing
          choices, and optional communications preferences.
        </li>
        <li>
          <strong>Safety data:</strong> reports, moderation decisions, blocked
          words, media-moderation results, restricted audit records, and
          evidence needed to investigate abuse or protect the service.
        </li>
        <li>
          <strong>Technical data:</strong> necessary request, security, error,
          rate-limit, storage, and authentication information produced while
          operating the service. Privacy-conscious aggregate product analytics
          may be added as described below.
        </li>
      </ul>

      <h2>Information SIGNAL does not request for ordinary participation</h2>
      <p>
        SIGNAL does not ask for a precise home address, medical diagnosis,
        payment card, government identification, or advertising profile. Pulse
        describes present participation preferences and is not a health
        assessment. Members should not put sensitive personal information in
        public fields, chats, applications, or messages unless truly necessary.
      </p>

      <h2>How information is used</h2>
      <p>
        Information is used to authenticate members; operate profiles and
        product features; apply visibility and safety controls; provide
        deterministic, explainable Pulse matching; deliver notifications;
        moderate content; investigate reports; prevent spam and fraud; maintain
        verified Passport records; secure the service; meet legal obligations;
        and understand aggregate product reliability and feature use.
      </p>

      <h2>Visibility and privacy controls</h2>
      <p>
        Members control public profile visibility and selected activity sharing.
        Blocks, mutes, filtered words, Circle privacy, and source-level RLS
        restrict applicable content. Pulse history, reports, private messages,
        applications, responses, moderation records, and Passport history are
        not public profile content. No control can guarantee that a recipient
        will not copy information they were authorized to see.
      </p>

      <h2>Circle chat and deleted content</h2>
      <p>
        Active Circle members can read current chat for their Circle. When a
        message is deleted, ordinary members receive a deletion marker rather
        than the retained body. Deleted text may remain in a restricted evidence
        store available only through authorized owner/platform review paths for
        safety, disputes, and legal obligations.
      </p>

      <h2>Media uploads and moderation</h2>
      <p>
        New user images are uploaded to private quarantine, validated,
        re-encoded to reduce unsafe metadata, and evaluated by a configured
        moderation provider before publication. Approved media is published;
        ambiguous media remains private for review; rejected media is not
        published and is removed from quarantine after its moderation record is
        safely created. Moderation metadata may be retained for audit, repeated
        abuse, and legal or safety handling.
      </p>

      <h2>Communications</h2>
      <p>
        Essential service communications may include authentication,
        verification, security, account changes, safety or moderation notices,
        critical participation changes, outages, and material policy updates.
        These are separate from optional newsletters, fundraising, Five Fifths
        or eHub news, community announcements, events, and feature marketing.
        Optional communications require affirmative consent and can be
        unsubscribed from at any time.
      </p>

      <h2>Analytics</h2>
      <p>
        SIGNAL does not use advertising trackers, sell member data, fingerprint
        devices, or build cross-site behavioral profiles. Any product analytics
        implementation must minimize identifiers and exclude private messages,
        report text, profile text, email addresses, usernames, and precise
        locations. The final policy must identify the selected analytics
        technology, retention period, and consent basis before it is enabled in
        production.
      </p>

      <h2>Cookies and local storage</h2>
      <p>
        Supabase authentication uses necessary cookies to keep members signed in
        and refresh sessions. SIGNAL uses browser local storage for saved form
        drafts and may use it for member-controlled tutorial and display
        preferences. No optional advertising or marketing cookies are currently
        part of the application. If optional tracking is introduced, it must not
        load before any legally required consent.
      </p>

      <h2>Service providers and disclosures</h2>
      <p>
        SIGNAL uses Supabase for authentication, database, realtime, and
        storage, plus deployment, moderation, and future communications
        providers configured by Five Fifths. Providers receive only the access
        needed for their service. Information may also be disclosed to comply
        with law, respond to valid legal process, investigate fraud or abuse,
        protect people, or complete a business transition subject to appropriate
        safeguards. SIGNAL does not sell information for advertising.
      </p>

      <h2>Retention and deletion</h2>
      <p>
        Active account and participation records are retained while needed to
        provide the service. Expired Pulse state and abandoned quarantine media
        have bounded cleanup paths. Account closure should remove or de-identify
        ordinary profile data where practical, but reports, moderation/audit
        records, security evidence, legal holds, and records needed to protect
        other members may remain restricted. Exact retention schedules and
        backup-deletion timelines require legal and operational approval.
      </p>

      <h2>Security</h2>
      <p>
        SIGNAL uses server-side authentication checks, row-level security,
        restricted RPCs, private storage, rate limits, moderation boundaries,
        security headers, and audit records. No online service can guarantee
        absolute security. Members should use a unique password and report
        suspected compromise promptly.
      </p>

      <h2>Member choices and contact</h2>
      <p>
        Members can edit profile and safety settings, manage relationships and
        visibility, change optional communications, and request account action
        through available controls. Accessibility or privacy concerns may be
        submitted through the signed-in{" "}
        <Link href="/home/safety">Trust and Safety page</Link>. A public legal
        contact, controller identity, jurisdiction-specific rights process,
        effective date, and response timeline must be finalized before launch.
      </p>

      <h2>Adults only and policy changes</h2>
      <p>
        SIGNAL is intended for adults 18 and older and is not designed for child
        accounts. Material policy changes will be communicated through
        reasonable service channels as required. Continued use after an
        effective change will be governed by the final reviewed Terms and
        Privacy Policy.
      </p>
    </LegalPage>
  );
}
