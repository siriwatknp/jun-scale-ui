import { useId, type ComponentProps, type ReactNode } from "react";
import { cx } from "./cx";
import styles from "./Dialog.module.css";

type DialogProps = Omit<ComponentProps<"div">, "title"> & {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
};

export function Dialog({ className, title, description, actions, children, ...props }: DialogProps) {
  const baseId = useId();
  const titleId = title != null ? `${baseId}-title` : undefined;
  const descriptionId = description != null ? `${baseId}-description` : undefined;
  return (
    <div
      role="dialog"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      {...props}
      data-slot="Dialog"
      className={cx(styles.root, className)}
    >
      {title != null && (
        <h2 id={titleId} data-slot="Dialog-title" className={styles.title}>
          {title}
        </h2>
      )}
      {description != null && (
        <p id={descriptionId} data-slot="Dialog-description" className={styles.description}>
          {description}
        </p>
      )}
      {children}
      {actions != null && (
        <div data-slot="Dialog-actions" className={styles.actions}>
          {actions}
        </div>
      )}
    </div>
  );
}
