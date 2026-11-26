import type { ComponentProps } from "react";
import { cx } from "./cx";
import "./Icon.css";

export function Icon({ className, ...props }: ComponentProps<"svg">) {
  return <svg data-slot="Icon" aria-hidden focusable="false" viewBox="0 0 16 16" className={cx("Icon", className)} {...props} />;
}
