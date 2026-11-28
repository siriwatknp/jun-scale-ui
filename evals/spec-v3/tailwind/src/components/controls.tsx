import { Children, cloneElement, isValidElement, useId } from "react";
import type { ComponentProps, ReactElement, ReactNode } from "react";
import { cx } from "./cx";
import { Icon } from "./small";

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600";
const buttonReset = "m-0 box-border [font-family:inherit] cursor-pointer";

function startsWithIcon(children: ReactNode) {
  const first = Children.toArray(children)[0];
  return isValidElement(first) && first.type === Icon;
}

export function Button({ className, children, type = "button", ...props }: ComponentProps<"button">) {
  return (
    <button
      data-slot="Button"
      data-start-icon={startsWithIcon(children) || undefined}
      type={type}
      className={cx(
        "ui-group-5 ui-pass-below-5 inline-flex h-8 shrink-0 items-center justify-center gap-2 rounded-sm border-0 bg-gray-900 px-3 text-sm font-medium whitespace-nowrap text-white hover:bg-gray-700 data-start-icon:ps-2",
        buttonReset,
        focusRing,
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function IconButton({ className, type = "button", ...props }: ComponentProps<"button">) {
  return (
    <button
      data-slot="IconButton"
      type={type}
      className={cx(
        "ui-group-5 ui-pass-below-5 inline-flex size-8 shrink-0 items-center justify-center rounded-sm border-0 bg-gray-100 p-0 text-gray-900 hover:bg-gray-200",
        buttonReset,
        focusRing,
        className,
      )}
      {...props}
    />
  );
}

type InputProps = Omit<ComponentProps<"input">, "action"> & {
  start?: ReactNode;
  end?: ReactNode;
  action?: ReactNode;
  actionLabel?: string;
};

export function Input({ className, style, start, end, action, actionLabel, ...props }: InputProps) {
  return (
    <label
      data-slot="Input"
      className={cx(
        "ui-group-5 ui-pass-below-5 relative box-border inline-flex h-8 w-45 shrink-0 cursor-text items-center gap-2 rounded-sm border border-gray-300 bg-white px-2 text-sm text-gray-900",
        "has-[[data-slot=Input-field]:focus-visible]:outline-2 has-[[data-slot=Input-field]:focus-visible]:outline-offset-2 has-[[data-slot=Input-field]:focus-visible]:outline-blue-600",
        className,
      )}
      style={style}
    >
      {start}
      <input
        data-slot="Input-field"
        className="m-0 box-border min-w-0 flex-1 self-stretch border-0 bg-transparent p-0 [font:inherit] text-inherit outline-none placeholder:text-gray-400"
        {...props}
      />
      {end}
      {action != null && (
        <button
          data-slot="Input-action"
          type="button"
          aria-label={actionLabel}
          className={cx(
            "-me-1 inline-flex size-6 shrink-0 items-center justify-center rounded-xs border-0 bg-transparent p-0 text-gray-600 hover:bg-gray-100",
            buttonReset,
            focusRing,
          )}
        >
          {action}
        </button>
      )}
    </label>
  );
}

type SelectProps = ComponentProps<"div"> & { open?: boolean; items?: ReactNode[] };

export function Select({ className, children, open = false, items = [], ...props }: SelectProps) {
  const popupId = useId();
  return (
    <div data-slot="Select" className={cx("ui-group-5 ui-pass-below-5 relative inline-block text-sm", className)} {...props}>
      <button
        data-slot="Select-trigger"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? popupId : undefined}
        className={cx(
          "ui-pass-group4-0.75 inline-flex h-8 items-center gap-2 rounded-sm border border-gray-300 bg-white px-3 text-sm whitespace-nowrap text-gray-900 hover:bg-gray-50",
          buttonReset,
          focusRing,
        )}
      >
        {children}
        <Icon className="ms-auto text-gray-500">
          <path d="M4.5 6.5L8 10l3.5-3.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        </Icon>
      </button>
      {open && (
        <div
          data-slot="Popup"
          id={popupId}
          role="listbox"
          className="absolute top-full left-0 z-10 mt-1 box-border flex w-max min-w-32 flex-col rounded-md border border-gray-200 bg-white p-1 text-sm text-gray-900 shadow-md"
        >
          {items.map((item, index) => (
            <div
              key={index}
              data-slot="Popup-item"
              role="option"
              aria-selected={false}
              className="box-border flex h-8 cursor-default items-center gap-2 rounded-sm px-3 whitespace-nowrap hover:bg-gray-100"
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type FieldProps = Omit<ComponentProps<"div">, "children"> & {
  label?: ReactNode;
  help?: ReactNode;
  error?: ReactNode;
  invalid?: boolean;
  children: ReactElement<{ id?: string; "aria-describedby"?: string; "aria-invalid"?: boolean }>;
};

export function Field({ className, label, help, error, invalid = false, children, ...props }: FieldProps) {
  const baseId = useId();
  const controlId = children.props.id ?? `${baseId}-control`;
  const message = invalid ? error : help;
  const messageId = `${baseId}-message`;
  const control = cloneElement(children, {
    id: controlId,
    "aria-describedby": message != null ? messageId : undefined,
    "aria-invalid": invalid || undefined,
  });
  const messageClass = "ui-pass-group3-[0.8] m-0 text-xs";
  return (
    <div
      data-slot="Field"
      data-invalid={invalid || undefined}
      className={cx(
        "ui-group-5 ui-pass-below-5 box-border flex w-60 flex-col gap-2 text-sm text-gray-900",
        "[&>[data-slot=Input]]:w-full [&>[data-slot=Select]>[data-slot=Select-trigger]]:w-full",
        className,
      )}
      {...props}
    >
      {label != null && (
        <label data-slot="Field-label" htmlFor={controlId} className="ui-pass-group3-[0.8] flex items-center gap-1 text-sm font-medium">
          {label}
        </label>
      )}
      {control}
      {invalid
        ? error != null && (
            <p data-slot="Field-error" id={messageId} className={cx(messageClass, "text-red-600")}>
              {error}
            </p>
          )
        : help != null && (
            <p data-slot="Field-help" id={messageId} className={cx(messageClass, "text-gray-600")}>
              {help}
            </p>
          )}
    </div>
  );
}
