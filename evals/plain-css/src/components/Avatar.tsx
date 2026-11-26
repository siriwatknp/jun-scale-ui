import type { ComponentProps } from "react";
import { cx } from "./cx";
import "./Avatar.css";

export function Avatar({ className, ...props }: ComponentProps<"span">) {
  return <span data-slot="Avatar" className={cx("Avatar", className)} {...props} />;
}
