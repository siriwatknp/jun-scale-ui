import type { ComponentProps } from "react";
import { cx } from "./cx";

export function Spinner({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      role="status"
      aria-label="Loading"
      {...props}
      data-slot="Spinner"
      className={cx(
        "component-group-2 inline-block box-border size-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-[spin_2s_linear_infinite]",
        className,
      )}
    />
  );
}
