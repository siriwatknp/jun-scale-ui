import type { ComponentProps } from "react";
import { cx } from "./cx";
import styles from "./Avatar.module.css";

export function Avatar({ className, ...props }: ComponentProps<"span">) {
  return <span {...props} data-slot="Avatar" className={cx(styles.root, className)} />;
}
