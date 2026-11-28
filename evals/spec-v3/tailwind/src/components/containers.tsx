import { useId } from "react";
import type { ComponentProps, ReactNode } from "react";
import { cx } from "./cx";

type CalloutProps = ComponentProps<"div"> & { icon?: ReactNode };

export function Callout({ className, icon, children, ...props }: CalloutProps) {
  return (
    <div
      data-slot="Callout"
      role="note"
      className={cx(
        "ui-group-6 ui-pass-below-6 ui-pass-group2-0.75 box-border flex max-w-45 gap-3 rounded-md bg-blue-50 p-4 text-sm text-blue-950",
        className,
      )}
      {...props}
    >
      {icon != null && (
        <span data-slot="Callout-icon" className="flex h-5 shrink-0 items-center text-blue-700">
          {icon}
        </span>
      )}
      <div data-slot="Callout-text" className="min-w-0">
        {children}
      </div>
    </div>
  );
}

export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="Card"
      className={cx(
        "ui-group-7 ui-pass-below-7 box-border flex flex-col items-start gap-3 rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-900",
        className,
      )}
      {...props}
    />
  );
}

type DialogProps = Omit<ComponentProps<"div">, "title"> & {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
};

export function Dialog({ className, title, description, actions, children, ...props }: DialogProps) {
  const id = useId();
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;
  return (
    <div
      data-slot="Dialog"
      role="dialog"
      aria-labelledby={title != null ? titleId : undefined}
      aria-describedby={description != null ? descriptionId : undefined}
      className={cx(
        "ui-group-7 ui-pass-below-7 box-border flex w-100 flex-col gap-4 rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-900 shadow-lg",
        className,
      )}
      {...props}
    >
      {title != null && (
        <h2 data-slot="Dialog-title" id={titleId} className="m-0 text-base font-semibold">
          {title}
        </h2>
      )}
      {description != null && (
        <p data-slot="Dialog-description" id={descriptionId} className="m-0 text-sm text-gray-600">
          {description}
        </p>
      )}
      {children}
      {actions != null && (
        <div data-slot="Dialog-actions" className="flex justify-end gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}

type PopoverProps = ComponentProps<"div"> & { trigger?: ReactNode; open?: boolean };

export function Popover({ className, trigger, open = false, children, ...props }: PopoverProps) {
  return (
    <div data-slot="Popover" className={cx("ui-group-7 ui-pass-below-7 relative inline-block text-sm", className)} {...props}>
      {trigger}
      {open && (
        <div
          data-slot="Popover-content"
          className="absolute top-full left-0 z-10 mt-1 box-border flex w-60 flex-col items-start gap-2 rounded-md border border-gray-200 bg-white p-3 text-sm text-gray-900 shadow-md"
        >
          {children}
        </div>
      )}
    </div>
  );
}
