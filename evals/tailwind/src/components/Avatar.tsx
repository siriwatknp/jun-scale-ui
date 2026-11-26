import type { ComponentProps } from "react";
import { cx } from "./cx";

export function Avatar({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      {...props}
      data-slot="Avatar"
      className={cx(
        "component-group-4 inline-flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200 font-sans text-sm font-medium text-gray-700 select-none",
        className,
      )}
    />
  );
}
