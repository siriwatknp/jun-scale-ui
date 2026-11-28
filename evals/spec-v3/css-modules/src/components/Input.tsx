import type { ComponentProps, MouseEventHandler, ReactNode } from "react";
import { cx } from "./cx";
import styles from "./Input.module.css";

type InputProps = ComponentProps<"input"> & {
  start?: ReactNode;
  end?: ReactNode;
  action?: ReactNode;
  actionLabel?: string;
  onAction?: MouseEventHandler<HTMLButtonElement>;
};

export function Input({ className, style, start, end, action, actionLabel, onAction, ...props }: InputProps) {
  return (
    <label data-slot="Input" className={cx(styles.root, className)} style={style}>
      {start}
      <input type="text" {...props} data-slot="Input-field" className={styles.field} />
      {end}
      {action != null && (
        <button type="button" data-slot="Input-action" aria-label={actionLabel} className={styles.action} onClick={onAction}>
          {action}
        </button>
      )}
    </label>
  );
}
