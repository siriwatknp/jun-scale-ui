import type { ComponentProps, ReactNode } from "react";
import { cx } from "./cx";
import styles from "./Callout.module.css";

type CalloutProps = ComponentProps<"div"> & { icon?: ReactNode };

export function Callout({ className, icon, children, ...props }: CalloutProps) {
  return (
    <div data-slot="Callout" className={cx(styles.root, className)} {...props}>
      {icon}
      <div data-slot="Callout-text" className={styles.text}>
        {children}
      </div>
    </div>
  );
}
