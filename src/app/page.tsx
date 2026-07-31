import { platformModules } from "@/config/modules";

export default function PhaseZeroPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
      <p className="mb-4 text-sm font-semibold tracking-[0.2em] text-red-500">
        FIFTHS · PHASE 0
      </p>
      <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
        Find your space. Match your energy.
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-300">
        The shared foundation is ready. Public product experiences begin in
        Phase 1.
      </p>
      <ul
        className="mt-10 grid gap-3 sm:grid-cols-2"
        aria-label="FIFTHS product modules"
      >
        {platformModules.map((module) => (
          <li
            className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5"
            key={module.slug}
          >
            <h2 className="font-semibold">{module.name}</h2>
            <p className="mt-1 text-sm leading-6 text-neutral-400">
              {module.purpose}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
