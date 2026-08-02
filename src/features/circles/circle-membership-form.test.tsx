import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CircleMembershipForm } from "./circle-membership-form";

const circleId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

describe("CircleMembershipForm", () => {
  it("offers a clearly labeled request action", () => {
    render(
      <CircleMembershipForm
        circleId={circleId}
        joinPolicy="request"
        membership={null}
      />,
    );
    expect(
      screen.getByRole("form", { name: "Join this Circle" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Request to join" }),
    ).toBeEnabled();
  });

  it("does not expose a public action for invite-only Circles", () => {
    render(
      <CircleMembershipForm
        circleId={circleId}
        joinPolicy="invite_only"
        membership={null}
      />,
    );
    expect(screen.getByRole("status")).toHaveTextContent(/invite only/i);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("protects owner departure with explanatory text", () => {
    render(
      <CircleMembershipForm
        circleId={circleId}
        joinPolicy="request"
        membership={{ role: "owner", status: "active" }}
      />,
    );
    expect(screen.getByRole("status")).toHaveTextContent(/ownership transfer/i);
  });
});
