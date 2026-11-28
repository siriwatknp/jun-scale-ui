import type { ComponentProps } from "react";
import { cx } from "./cx";
import styles from "./Switch.module.css";

export function Switch({ className, style, ...props }: Omit<ComponentProps<"input">, "type">) {
  return (
    <span data-slot="Switch" className={cx(styles.root, className)} style={style}>
      <input {...props} data-slot="Switch-input" type="checkbox" role="switch" className={styles.input} />
      <span data-slot="Switch-thumb" className={styles.thumb} />
    </span>
  );
}
