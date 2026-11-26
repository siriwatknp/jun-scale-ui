import { cloneElement, isValidElement, useId, type ComponentProps, type ReactNode } from "react";
import { cx } from "./cx";

type FieldProps = Omit<ComponentProps<"div">, "children"> & {
  label?: ReactNode;
  help?: ReactNode;
  error?: ReactNode;
  invalid?: boolean;
  children?: ReactNode;
};

const messageClass = "m-0 self-stretch text-xs [--scale-group3:calc(var(--scale-group5,1)*0.8)]";

export function Field({ className, label, help, error, invalid = false, children, ...props }: FieldProps) {
  const controlId = useId();
  const messageId = `${controlId}-message`;
  const message = invalid ? error : help;
  const control = isValidElement<Record<string, unknown>>(children)
    ? cloneElement(children, {
        id: controlId,
        "aria-describedby": message ? messageId : undefined,
        "aria-invalid": invalid || undefined,
      })
    : children;

  return (
    <div
      {...props}
      data-slot="Field"
      data-invalid={invalid || undefined}
      className={cx("component-group-5 flex w-60 flex-col items-start gap-2 font-sans text-sm text-gray-900", className)}
    >
      {label && (
        <label
          htmlFor={controlId}
          data-slot="Field-label"
          className="flex items-center gap-1 self-stretch text-sm font-medium [--scale-group3:calc(var(--scale-group5,1)*0.8)]"
        >
          {label}
        </label>
      )}
      {control}
      {message &&
        (invalid ? (
          <p id={messageId} data-slot="Field-error" className={cx(messageClass, "text-red-600")}>
            {message}
          </p>
        ) : (
          <p id={messageId} data-slot="Field-help" className={cx(messageClass, "text-gray-500")}>
            {message}
          </p>
        ))}
    </div>
  );
}
