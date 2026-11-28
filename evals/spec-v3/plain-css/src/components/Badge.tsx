import type { ComponentProps } from "react";
import { cx } from "./cx";
import "./Badge.css";

export function Badge({ className, ...props }: ComponentProps<"span">) {
  return <span data-slot="Badge" className={cx("Badge", className)} {...props} />;
}
