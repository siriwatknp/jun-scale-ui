import { cloneElement, isValidElement, useId, type ComponentProps, type ReactNode } from "react";
import { cx } from "./cx";
import styles from "./Field.module.css";

type FieldProps = Omit<ComponentProps<"div">, "children"> & {
  label?: ReactNode;
  help?: ReactNode;
  error?: ReactNode;
  invalid?: boolean;
  children: ReactNode;
};

type ControlProps = { id?: string; "aria-describedby"?: string; "aria-invalid"?: boolean };

export function Field({ className, label, help, error, invalid = false, children, ...props }: FieldProps) {
  const baseId = useId();
  const message = invalid ? error : help;
  const messageId = message != null ? `${baseId}-message` : undefined;
  const control = isValidElement<ControlProps>(children) ? children : null;
  const controlId = control?.props.id ?? `${baseId}-control`;
  const linkedControl = control
    ? cloneElement(control, {
        id: controlId,
        "aria-describedby": cx(control.props["aria-describedby"], messageId) || undefined,
        "aria-invalid": invalid || control.props["aria-invalid"] || undefined,
      })
    : children;
  return (
    <div {...props} data-slot="Field" data-invalid={invalid || undefined} className={cx(styles.root, className)}>
      {label != null && (
        <label data-slot="Field-label" htmlFor={control ? controlId : undefined} className={styles.label}>
          {label}
        </label>
      )}
      {linkedControl}
      {message != null && (
        <p id={messageId} data-slot={invalid ? "Field-error" : "Field-help"} className={invalid ? styles.error : styles.help}>
          {message}
        </p>
      )}
    </div>
  );
}
