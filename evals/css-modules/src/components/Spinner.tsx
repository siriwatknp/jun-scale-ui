import type { ComponentProps } from "react";
import { cx } from "./cx";
import styles from "./Spinner.module.css";

export function Spinner({ className, ...props }: ComponentProps<"span">) {
  return <span data-slot="Spinner" role="status" aria-label="Loading" className={cx(styles.root, className)} {...props} />;
}
