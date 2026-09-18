import "server-only";

export type CommunicationClass = "essential" | "activity" | "marketing";

export type EmailMessage = {
  recipientUserId: string;
  communicationClass: CommunicationClass;
  templateKey: string;
  templateData: Record<string, string | number | boolean | null>;
  dedupeKey: string;
};

export type EmailDeliveryResult = {
  providerMessageId: string;
};

export interface EmailProvider {
  readonly name: string;
  deliver(message: EmailMessage): Promise<EmailDeliveryResult>;
}

export class EmailProviderNotConfiguredError extends Error {
  constructor() {
    super(
      "Email delivery is not configured. Set SIGNAL_EMAIL_PROVIDER and install a server-only provider adapter before enabling delivery workers.",
    );
    this.name = "EmailProviderNotConfiguredError";
  }
}

export async function deliverCommunicationEmail(
  message: EmailMessage,
  provider?: EmailProvider,
) {
  if (!provider) throw new EmailProviderNotConfiguredError();
  return provider.deliver(message);
}
