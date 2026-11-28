import { useId, type ComponentProps, type ReactNode } from "react";
import { cx } from "./cx";
import { FieldContext } from "./FieldContext";
import "./Field.css";

type FieldProps = Omit<ComponentProps<"div">, "children"> & {
  label?: ReactNode;
  help?: ReactNode;
  error?: ReactNode;
  invalid?: boolean;
  children: ReactNode;
};

export function Field({ className, label, help, error, invalid = false, children, ...props }: FieldProps) {
  const id = useId();
  const controlId = `${id}-control`;
  const message = invalid ? error : help;
  const messageId = message != null ? `${id}-message` : undefined;
  return (
    <div data-slot="Field" className={cx("Field", className)} data-invalid={invalid || undefined} {...props}>
      {label != null && (
        <label data-slot="Field-label" className="Field-label" htmlFor={controlId}>
          {label}
        </label>
      )}
      <FieldContext value={{ id: controlId, describedBy: messageId, invalid }}>{children}</FieldContext>
      {message != null && (
        <div data-slot={invalid ? "Field-error" : "Field-help"} className={invalid ? "Field-error" : "Field-help"} id={messageId}>
          {message}
        </div>
      )}
    </div>
  );
}
