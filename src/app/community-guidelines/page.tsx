import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "Community Guidelines (Draft)" };

export default function CommunityGuidelinesPage() {
  return (
    <LegalPage
      eyebrow="Draft community standard"
      title="Community Guidelines"
      summary="The shared expectations that help people create, gather, play, collaborate, and show up with dignity and informed choice."
    >
      <h2>Start with respect and clarity</h2>
      <p>
        SIGNAL is for intentional participation, not attention at any cost.
        Respect names, identities, boundaries, time, privacy, access needs, and
        another person’s choice to decline or leave. Describe plans,
        communities, campaigns, and opportunities honestly.
      </p>

      <h2>Harassment, threats, and stalking</h2>
      <p>
        Harassment, intimidation, threats, unwanted repeated contact, stalking,
        doxxing, retaliation, and encouraging others to target someone are not
        permitted. Blocking or declining contact must be respected both online
        and offline.
      </p>

      <h2>Hate and extremist conduct</h2>
      <p>
        Do not attack or dehumanize people based on protected or vulnerable
        characteristics, promote hateful organizations, praise extremist
        violence, recruit for extremist causes, or use coded imagery to evade
        these rules. Historical, educational, journalistic, gaming, cosplay, or
        artistic context may be considered during review.
      </p>

      <h2>Sexual safety and exploitation</h2>
      <p>
        Sexual harassment, coercion, nonconsensual sexual content, explicit
        pornography, sexual exploitation, and any suspected sexual content
        involving minors are prohibited. Lawful non-explicit fashion, swimwear,
        breastfeeding, anatomy, artistic figure work, and cosplay are not
        violations solely because skin is visible or a theme is mature.
      </p>

      <h2>Violence and graphic content</h2>
      <p>
        Credible threats, instructions facilitating real-world harm, celebration
        of severe real-world violence, and severe graphic gore are prohibited.
        Fictional or game violence, fantasy art, historical material, cosplay
        weapons, and moderate fictional blood may be allowed when the context is
        clear and the material is not used to threaten or shock others.
      </p>

      <h2>Authenticity, scams, and spam</h2>
      <p>
        Do not impersonate another person or organization, misrepresent
        affiliation, create deceptive opportunities, manipulate compensation,
        solicit fraudulently, distribute malware, spam members, or coordinate
        inauthentic engagement. Do not pressure someone to move to unsafe
        payment or communication channels.
      </p>

      <h2>Privacy and confidential information</h2>
      <p>
        Do not publish another person’s private contact, financial, medical,
        legal, location, identity, or intimate information without permission.
        Private Circle, message, application, report, roster, and moderation
        information must not be redistributed to shame or endanger people.
      </p>

      <h2>Sessions and offline conduct</h2>
      <p>
        Hosts must describe time, location context, access, cost, capacity, and
        meaningful changes accurately. Participants must follow venue rules,
        respect consent, avoid unsafe pressure, and leave when directed for a
        legitimate safety reason. SIGNAL reports are not emergency services.
      </p>

      <h2>Circles and chat</h2>
      <p>
        Circle owners may set relevant local rules, but may not use them to
        excuse harassment, discrimination, exploitation, or retaliation. Do not
        use chat to coordinate harm, expose private information, repeatedly
        contact someone who has disengaged, or evade a moderation action.
      </p>

      <h2>Intellectual property and illegal activity</h2>
      <p>
        Share only material you have the right to use. Do not distribute stolen
        content, proprietary rulebooks, pirated media, unlawful goods or
        services, or instructions whose purpose is criminal harm.
      </p>

      <h2>Reporting responsibly</h2>
      <p>
        Use the closest report target and describe what happened without adding
        unnecessary sensitive information. Good-faith mistakes are not abuse,
        but knowingly false, retaliatory, coordinated, or manipulative reports
        may themselves require review. Do not publicly campaign around a private
        report in a way that harasses the people involved.
      </p>

      <h2>Review and consequences</h2>
      <p>
        Depending on severity, context, history, and risk, Five Fifths may limit
        visibility or features, remove content, preserve evidence, issue a
        warning, suspend or terminate an account, or make a specialized legal or
        safety escalation. Ordinary moderation decisions are not automatic
        permanent bans. Final appeals and enforcement procedures require legal
        and operational review.
      </p>

      <h2>Get help</h2>
      <p>
        Signed-in members can use the private{" "}
        <Link href="/home/safety">Trust and Safety page</Link>. If someone is in
        immediate danger, contact local emergency services. SIGNAL is not an
        emergency response service.
      </p>
    </LegalPage>
  );
}
