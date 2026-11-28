import type { ComponentProps } from "react";
import { cx } from "./cx";
import styles from "./Spinner.module.css";

export function Spinner({ className, ...props }: ComponentProps<"span">) {
  return <span role="status" aria-label="Loading" {...props} data-slot="Spinner" className={cx(styles.root, className)} />;
}
