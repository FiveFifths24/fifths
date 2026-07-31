import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Creator Commons Guidelines (Draft)",
};

export default function CommonsGuidelinesPage() {
  return (
    <LegalPage
      eyebrow="Draft creator standard"
      title="Creator Commons Guidelines"
      summary="Clear expectations for respectful, accurate, and appropriately scoped creative collaboration."
    >
      <h2>Describe opportunities accurately</h2>
      <p>
        Opportunity owners should explain the work, requested skills, format,
        location, deadline, number of participants, compensation type, and
        material accessibility expectations before asking people to commit.
      </p>
      <h2>Compensation clarity</h2>
      <p>
        Paid, unpaid, trade, volunteer, portfolio collaboration, and
        to-be-discussed opportunities must be labeled honestly. FIFTHS will not
        process payments, hold escrow, or create complex contracts in the MVP.
      </p>
      <h2>Consent and professional conduct</h2>
      <p>
        Participants should respect boundaries, communicate material changes,
        protect private project information, and avoid harassment,
        discrimination, coercion, or retaliation.
      </p>
      <h2>Rights and intellectual property</h2>
      <p>
        Only share work, files, brands, music, images, and other material you
        have the right to use. Ownership and licensing terms should be discussed
        directly by collaborators; FIFTHS does not provide legal agreements.
      </p>
      <h2>Completion and Passport</h2>
      <p>
        A creator cannot issue themselves verified activity. Completed
        collaboration credit will require confirmation through an authorized
        workflow or administrator review.
      </p>
      <h2>Safety and eligibility</h2>
      <p>
        The initial beta is for adults 18 and older. FIFTHS will not collect
        medical diagnoses. Accessibility notes should describe practical
        participation information without pressuring anyone to disclose health
        details.
      </p>
      <h2>Draft notice</h2>
      <p>
        Reporting, disputes, takedown, cancellation, and evidence-retention
        procedures require legal and operational review before public launch.
      </p>
    </LegalPage>
  );
}
