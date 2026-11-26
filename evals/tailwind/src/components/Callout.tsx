import type { ComponentProps, ReactNode } from "react";
import { cx } from "./cx";

type CalloutProps = ComponentProps<"div"> & { icon?: ReactNode };

export function Callout({ className, icon, children, ...props }: CalloutProps) {
  return (
    <div
      {...props}
      data-slot="Callout"
      className={cx(
        "component-group-6 flex box-border max-w-45 items-start gap-3 rounded-md bg-blue-50 p-4 font-sans text-sm text-blue-950 [--default-group2:0.75]",
        className,
      )}
    >
      {icon && (
        <span data-slot="Callout-icon" className="flex h-5 shrink-0 items-center text-blue-600">
          {icon}
        </span>
      )}
      <div data-slot="Callout-text" className="min-w-0 flex-1">
        {children}
      </div>
    </div>
  );
}
