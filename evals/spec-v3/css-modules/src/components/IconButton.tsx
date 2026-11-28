import type { ComponentProps } from "react";
import { cx } from "./cx";
import styles from "./IconButton.module.css";

export function IconButton({ className, type = "button", ...props }: ComponentProps<"button">) {
  return <button {...props} type={type} data-slot="IconButton" className={cx(styles.root, className)} />;
}
