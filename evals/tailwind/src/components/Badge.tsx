import type { ComponentProps } from "react";
import { cx } from "./cx";

export function Badge({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      {...props}
      data-slot="Badge"
      className={cx(
        "component-group-3 inline-flex box-border h-5 shrink-0 items-center gap-1 rounded-xs bg-blue-100 px-2 font-sans text-xs font-medium whitespace-nowrap text-blue-800",
        className,
      )}
    />
  );
}
