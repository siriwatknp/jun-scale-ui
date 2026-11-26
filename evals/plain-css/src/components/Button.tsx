import type { ComponentProps } from "react";
import { cx } from "./cx";
import "./Button.css";

export function Button({ className, type = "button", ...props }: ComponentProps<"button">) {
  return <button data-slot="Button" type={type} className={cx("Button", className)} {...props} />;
}
