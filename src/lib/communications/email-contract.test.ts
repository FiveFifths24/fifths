import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const implementation = readFileSync(
  resolve(process.cwd(), "src/lib/communications/email.ts"),
  "utf8",
);

describe("email provider abstraction", () => {
  it("is server-only and provider-neutral", () => {
    expect(implementation).toContain('import "server-only"');
    expect(implementation).toContain("export interface EmailProvider");
    expect(implementation).not.toMatch(/resend|sendgrid|mailchimp|postmark/i);
  });

  it("fails explicitly when no provider is configured", () => {
    expect(implementation).toContain("EmailProviderNotConfiguredError");
    expect(implementation).toContain(
      "if (!provider) throw new EmailProviderNotConfiguredError()",
    );
  });
});
