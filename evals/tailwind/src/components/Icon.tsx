import type { ComponentProps } from "react";
import { cx } from "./cx";

export function Icon({ className, children, ...props }: ComponentProps<"svg">) {
  return (
    <svg
      aria-hidden={props["aria-label"] ? undefined : true}
      {...props}
      data-slot="Icon"
      viewBox="0 0 16 16"
      className={cx("component-group-2 block size-4 shrink-0", className)}
    >
      {children}
    </svg>
  );
}
