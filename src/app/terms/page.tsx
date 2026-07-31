import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "Terms of Use (Draft)" };

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Draft agreement"
      title="Terms of Use"
      summary="The planned baseline agreement for using FIFTHS responsibly and understanding the MVP’s boundaries."
    >
      <h2>Draft status</h2>
      <p>
        These Terms are a planning draft and do not yet govern a live service.
        Legal review is required before public launch.
      </p>
      <h2>Eligibility</h2>
      <p>
        The initial FIFTHS beta is intended for people age 18 and older. By
        creating an account when registration becomes available, a member will
        confirm that they meet this requirement.
      </p>
      <h2>Acceptable use</h2>
      <p>
        Members will be expected to provide accurate information, respect
        community and module-specific guidelines, protect account access, and
        avoid harassment, discrimination, spam, deception, unsafe behavior, or
        intellectual-property violations.
      </p>
      <h2>Member content</h2>
      <p>
        Members will retain appropriate rights to their original content while
        granting FIFTHS the limited permissions necessary to display and operate
        that content. Final licensing, takedown, and appeal terms require legal
        review.
      </p>
      <h2>Creator and tabletop boundaries</h2>
      <p>
        FIFTHS will not provide creator escrow, complex contracts, proprietary
        tabletop rules, copyrighted rulebooks, or virtual tabletop content.
        Members must have the right to share material they post.
      </p>
      <h2>Participation and Passport</h2>
      <p>
        Registration does not guarantee admission, compatibility, safety, or a
        particular outcome. Passport activity must follow authorized
        verification processes and cannot be issued by a member to themselves.
      </p>
      <h2>Moderation</h2>
      <p>
        Reports will be reviewed by authorized people. FIFTHS will not automate
        permanent punishments. Final suspension, appeal, evidence, and
        enforcement terms will be established before launch.
      </p>
      <h2>Legal review required</h2>
      <p>
        Disclaimers, liability limits, dispute terms, governing law, contact
        details, and change-notice procedures remain subject to professional
        legal review.
      </p>
    </LegalPage>
  );
}
