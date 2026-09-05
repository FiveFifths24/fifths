import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  as?: "div" | "ul";
};

export function SwipeCardGrid({ children, className = "", as = "div" }: Props) {
  const classes = [
    "flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-3",
    "scroll-px-4",
    "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
    "[&>*]:w-[84vw] [&>*]:max-w-[22rem] [&>*]:shrink-0 [&>*]:snap-center",
    "md:grid md:snap-none md:overflow-visible md:pb-0",
    "md:[&>*]:w-auto md:[&>*]:max-w-none md:[&>*]:shrink",
    className,
  ].join(" ");

  if (as === "ul") {
    return <ul className={classes}>{children}</ul>;
  }

  return <div className={classes}>{children}</div>;
}
