import type { ComponentProps } from "react";
import { cx } from "./cx";

export function StatusDot({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      {...props}
      data-slot="StatusDot"
      className={cx("component-group-1 inline-block size-2 shrink-0 rounded-full bg-green-500", className)}
    />
  );
}
