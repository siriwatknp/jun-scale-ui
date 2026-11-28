import type { ComponentProps } from "react";
import { cx } from "./cx";
import styles from "./StatusDot.module.css";

export function StatusDot({ className, ...props }: ComponentProps<"span">) {
  return <span {...props} data-slot="StatusDot" className={cx(styles.root, className)} />;
}
