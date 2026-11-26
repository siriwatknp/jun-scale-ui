import type { ComponentProps } from "react";
import { cx } from "./cx";
import styles from "./IconButton.module.css";

export function IconButton({ className, ...props }: ComponentProps<"button">) {
  return <button data-slot="IconButton" type="button" className={cx(styles.root, className)} {...props} />;
}
