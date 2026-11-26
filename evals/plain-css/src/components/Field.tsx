import { useId, type ComponentProps, type ReactNode } from "react";
import { cx } from "./cx";
import { FieldContext } from "./FieldContext";
import "./Field.css";

type FieldProps = Omit<ComponentProps<"div">, "children"> & {
  label?: ReactNode;
  help?: ReactNode;
  error?: ReactNode;
  invalid?: boolean;
  children?: ReactNode;
};

export function Field({ className, label, help, error, invalid = false, children, ...props }: FieldProps) {
  const id = useId();
  const controlId = `${id}-control`;
  const messageId = `${id}-message`;
  const message = invalid ? error : help;
  return (
    <div data-slot="Field" data-invalid={invalid || undefined} className={cx("Field", className)} {...props}>
      {label != null && (
        <label data-slot="Field-label" className="Field-label" htmlFor={controlId}>
          {label}
        </label>
      )}
      <FieldContext value={{ id: controlId, describedBy: message != null ? messageId : "", invalid }}>{children}</FieldContext>
      {message != null && (
        <p id={messageId} data-slot={invalid ? "Field-error" : "Field-help"} className={invalid ? "Field-error" : "Field-help"}>
          {message}
        </p>
      )}
    </div>
  );
}
