import type { ComponentProps } from "react";
import { cx } from "./cx";
import styles from "./Icon.module.css";

export function Icon({ className, ...props }: ComponentProps<"svg">) {
  return <svg data-slot="Icon" viewBox="0 0 16 16" aria-hidden className={cx(styles.root, className)} {...props} />;
}
