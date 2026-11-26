import type { ComponentProps } from "react";
import { cx } from "./cx";
import styles from "./Badge.module.css";

export function Badge({ className, ...props }: ComponentProps<"span">) {
  return <span data-slot="Badge" className={cx(styles.root, className)} {...props} />;
}
