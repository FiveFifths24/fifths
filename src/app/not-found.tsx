import { Compass, House, RadioTower } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";

export default function NotFound() {
  return (
    <section className="relative min-h-[70vh] overflow-hidden bg-[#020205] py-20 text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-10 left-1/2 size-[28rem] -translate-x-1/2 rounded-full bg-[#6c14ce]/15 blur-[150px]"
      />
      <Container className="relative">
        <div className="mx-auto max-w-3xl text-center">
          <RadioTower
            aria-hidden="true"
            className="mx-auto size-12 text-[#f359d2]"
          />
          <p className="mt-6 text-xs font-black tracking-[0.22em] text-[#f359d2] uppercase">
            404 · No Signal Found
          </p>
          <h1 className="display-type mt-4 text-6xl leading-[0.92] sm:text-8xl">
            This frequency is quiet.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-neutral-300 sm:text-lg">
            The page may have moved, been archived, or never existed. Nothing
            about your account was changed.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
            <ButtonLink href="/home">
              <House aria-hidden="true" className="size-4" />
              Go to Home
            </ButtonLink>
            <ButtonLink href="/home/sessions" variant="secondary">
              Explore Sessions
            </ButtonLink>
            <ButtonLink href="/home/circles" variant="secondary">
              Explore Circles
            </ButtonLink>
            <ButtonLink href="/home/discover" variant="secondary">
              <Compass aria-hidden="true" className="size-4" />
              Explore SIGNAL
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
