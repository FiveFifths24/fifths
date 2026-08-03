import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FeedbackForm } from "./feedback-form";
import { ReportForm } from "./report-form";

describe("Phase 10 trust-and-safety forms", () => {
  it("provides accessible private feedback controls and data warnings", () => {
    render(<FeedbackForm />);
    expect(
      screen.getByRole("form", { name: "Send private feedback" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Area")).toBeInTheDocument();
    expect(screen.getByLabelText("Feedback")).toBeInTheDocument();
    expect(
      screen.getByText(/do not include medical diagnoses/i),
    ).toBeInTheDocument();
  });

  it("provides structured, labeled report controls without evidence uploads", () => {
    render(<ReportForm />);
    expect(
      screen.getByRole("form", { name: "Submit a private safety report" }),
    ).toBeInTheDocument();
    for (const label of [
      "Concern about",
      "Category",
      "Short summary",
      "What happened?",
      "Related FIFTHS path (optional)",
    ]) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }
    expect(screen.queryByLabelText(/upload/i)).not.toBeInTheDocument();
    expect(
      screen.getByText(/external links and uploads are not accepted/i),
    ).toBeInTheDocument();
  });
});
