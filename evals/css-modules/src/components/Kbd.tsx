import type { ComponentProps } from "react";
import { cx } from "./cx";
import styles from "./Kbd.module.css";

export function Kbd({ className, ...props }: ComponentProps<"kbd">) {
  return <kbd data-slot="Kbd" className={cx(styles.root, className)} {...props} />;
}
