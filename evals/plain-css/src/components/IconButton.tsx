import type { ComponentProps } from "react";
import { cx } from "./cx";
import "./IconButton.css";

export function IconButton({ className, type = "button", ...props }: ComponentProps<"button">) {
  return <button data-slot="IconButton" type={type} className={cx("IconButton", className)} {...props} />;
}
