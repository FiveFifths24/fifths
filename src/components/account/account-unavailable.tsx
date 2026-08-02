import { Container } from "@/components/ui/container";
import { StatusMessage } from "@/components/ui/status-message";

export function AccountUnavailable() {
  return (
    <Container className="py-20">
      <div className="mx-auto max-w-2xl">
        <StatusMessage>
          Account and Pulse services are ready in the codebase but are not
          connected to a founder-owned Supabase project. Complete the documented
          environment and ordered migration setup before testing live member
          experiences.
        </StatusMessage>
      </div>
    </Container>
  );
}
