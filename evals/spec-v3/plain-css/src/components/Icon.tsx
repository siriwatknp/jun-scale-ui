import type { ComponentProps } from "react";
import { cx } from "./cx";
import "./Icon.css";

export function Icon({ className, children, ...props }: ComponentProps<"svg">) {
  return (
    <svg data-slot="Icon" className={cx("Icon", className)} viewBox="0 0 16 16" aria-hidden="true" {...props}>
      {children}
    </svg>
  );
}
