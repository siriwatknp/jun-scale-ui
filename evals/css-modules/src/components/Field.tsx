import { cloneElement, isValidElement, useId } from "react";
import type { ComponentProps, ReactElement, ReactNode } from "react";
import { cx } from "./cx";
import styles from "./Field.module.css";

type FieldProps = Omit<ComponentProps<"div">, "children"> & {
  label?: ReactNode;
  help?: ReactNode;
  error?: ReactNode;
  invalid?: boolean;
  children: ReactNode;
};

type ControlProps = { id?: string; "aria-describedby"?: string };

export function Field({ className, label, help, error, invalid = false, children, ...props }: FieldProps) {
  const id = useId();
  const controlId = `${id}-control`;
  const messageId = `${id}-message`;
  const message = invalid ? error : help;
  const hasMessage = message != null && message !== false;

  const element = isValidElement<ControlProps>(children) ? (children as ReactElement<ControlProps>) : null;
  const resolvedControlId = element ? (element.props.id ?? controlId) : undefined;
  const control = element
    ? cloneElement(element, {
        id: resolvedControlId,
        "aria-describedby": hasMessage ? messageId : element.props["aria-describedby"],
      })
    : children;

  return (
    <div data-slot="Field" data-invalid={invalid || undefined} className={cx(styles.root, className)} {...props}>
      {label != null && (
        <label data-slot="Field-label" htmlFor={resolvedControlId} className={styles.label}>
          {label}
        </label>
      )}
      {control}
      {hasMessage &&
        (invalid ? (
          <div data-slot="Field-error" id={messageId} className={cx(styles.message, styles.error)}>
            {message}
          </div>
        ) : (
          <div data-slot="Field-help" id={messageId} className={cx(styles.message, styles.help)}>
            {message}
          </div>
        ))}
    </div>
  );
}
