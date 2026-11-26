import type { ComponentProps } from "react";
import { cx } from "./cx";
import "./StatusDot.css";

export function StatusDot({ className, ...props }: ComponentProps<"span">) {
  return <span data-slot="StatusDot" className={cx("StatusDot", className)} {...props} />;
}
