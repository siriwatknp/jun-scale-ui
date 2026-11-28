import type { ComponentProps } from "react";
import { cx } from "./cx";
import "./Spinner.css";

export function Spinner({ className, ...props }: ComponentProps<"span">) {
  return <span data-slot="Spinner" className={cx("Spinner", className)} role="status" aria-label="Loading" {...props} />;
}
