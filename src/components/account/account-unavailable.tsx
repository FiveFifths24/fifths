import { Container } from "@/components/ui/container";
import { StatusMessage } from "@/components/ui/status-message";

export function AccountUnavailable() {
  return (
    <Container className="py-20">
      <div className="mx-auto max-w-2xl">
        <StatusMessage>
           Some account features are temporarily unavailable while we finish connecting services. Please try again shortly.
        </StatusMessage>
      </div>
    </Container>
  );
}
