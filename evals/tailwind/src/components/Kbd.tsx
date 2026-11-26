import type { ComponentProps } from "react";
import { cx } from "./cx";

export function Kbd({ className, ...props }: ComponentProps<"kbd">) {
  return (
    <kbd
      {...props}
      data-slot="Kbd"
      className={cx(
        "component-group-3 inline-flex box-border h-5 min-w-5 shrink-0 items-center justify-center rounded-xs border border-gray-300 bg-white px-1 font-sans text-xs font-medium text-gray-700",
        className,
      )}
    />
  );
}
