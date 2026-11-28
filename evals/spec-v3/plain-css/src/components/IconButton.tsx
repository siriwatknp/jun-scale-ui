import type { ComponentProps } from "react";
import { cx } from "./cx";
import "./IconButton.css";

export function IconButton({ className, type = "button", ...props }: ComponentProps<"button">) {
  return <button data-slot="IconButton" className={cx("IconButton", className)} type={type} {...props} />;
}
