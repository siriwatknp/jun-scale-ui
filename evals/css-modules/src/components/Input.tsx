import type { ComponentProps, ReactNode } from "react";
import { cx } from "./cx";
import styles from "./Input.module.css";

type InputProps = ComponentProps<"input"> & { start?: ReactNode; end?: ReactNode };

export function Input({ className, style, start, end, ...props }: InputProps) {
  return (
    <label data-slot="Input" className={cx(styles.root, className)} style={style}>
      {start}
      <input data-slot="Input-field" className={styles.field} {...props} />
      {end}
    </label>
  );
}
