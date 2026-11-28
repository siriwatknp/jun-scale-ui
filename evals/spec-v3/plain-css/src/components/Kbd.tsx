import type { ComponentProps } from "react";
import { cx } from "./cx";
import "./Kbd.css";

export function Kbd({ className, ...props }: ComponentProps<"kbd">) {
  return <kbd data-slot="Kbd" className={cx("Kbd", className)} {...props} />;
}
