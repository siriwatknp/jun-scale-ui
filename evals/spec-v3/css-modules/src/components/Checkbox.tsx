import type { ComponentProps } from "react";
import { cx } from "./cx";
import { Icon } from "./Icon";
import styles from "./Checkbox.module.css";

export function Checkbox({ className, style, ...props }: Omit<ComponentProps<"input">, "type">) {
  return (
    <span data-slot="Checkbox" className={cx(styles.root, className)} style={style}>
      <input {...props} data-slot="Checkbox-input" type="checkbox" className={styles.input} />
      <Icon className={styles.check}>
        <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </Icon>
    </span>
  );
}
