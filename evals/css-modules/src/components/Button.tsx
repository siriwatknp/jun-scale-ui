import type { ComponentProps } from "react";
import { cx } from "./cx";
import styles from "./Button.module.css";

export function Button({ className, ...props }: ComponentProps<"button">) {
  return <button data-slot="Button" type="button" className={cx(styles.root, className)} {...props} />;
}
