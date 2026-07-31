import { cn } from "@/lib/cn";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      <p className="text-xs font-bold tracking-[0.18em] text-red-400 uppercase">
        {eyebrow}
      </p>
      <h2 className="display-type mt-4 text-4xl leading-[1.02] text-balance text-white sm:text-5xl lg:text-6xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-400 sm:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}
