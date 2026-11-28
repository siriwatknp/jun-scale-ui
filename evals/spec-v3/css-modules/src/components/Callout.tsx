import type { ComponentProps, ReactNode } from "react";
import { cx } from "./cx";
import styles from "./Callout.module.css";

type CalloutProps = ComponentProps<"div"> & { icon?: ReactNode };

export function Callout({ className, icon, children, ...props }: CalloutProps) {
  return (
    <div {...props} data-slot="Callout" className={cx(styles.root, className)}>
      {icon != null && (
        <span data-slot="Callout-icon" className={styles.icon}>
          {icon}
        </span>
      )}
      <div data-slot="Callout-text" className={styles.text}>
        {children}
      </div>
    </div>
  );
}
