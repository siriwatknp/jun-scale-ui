import type { ComponentProps } from "react";
import { cx } from "./cx";

export function StatusDot({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="StatusDot"
      className={cx("ui-group-1 box-border inline-block size-2 shrink-0 rounded-full bg-emerald-500", className)}
      {...props}
    />
  );
}

export function Icon({ className, children, ...props }: ComponentProps<"svg">) {
  return (
    <svg
      data-slot="Icon"
      viewBox="0 0 16 16"
      aria-hidden="true"
      className={cx("ui-group-2 ui-pass-below-2 inline-block size-4 shrink-0", className)}
      {...props}
    >
      {children}
    </svg>
  );
}

export function Spinner({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="Spinner"
      role="status"
      aria-label="Loading"
      className={cx(
        "ui-group-2 ui-pass-below-2 box-border inline-block size-4 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent",
        className,
      )}
      {...props}
    />
  );
}

export function Badge({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="Badge"
      className={cx(
        "ui-group-3 ui-pass-below-3 ui-pass-group2-0.75 box-border inline-flex h-5 shrink-0 items-center gap-1 rounded-xs bg-blue-100 px-2 text-xs font-medium whitespace-nowrap text-blue-800",
        className,
      )}
      {...props}
    />
  );
}

export function Kbd({ className, ...props }: ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="Kbd"
      className={cx(
        "ui-group-3 ui-pass-below-3 box-border inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-xs border border-gray-300 bg-white px-1 text-xs [font-family:inherit] whitespace-nowrap text-gray-700",
        className,
      )}
      {...props}
    />
  );
}

export function Avatar({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="Avatar"
      className={cx(
        "ui-group-4 ui-pass-below-4 box-border inline-flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-violet-200 text-sm font-medium text-violet-900 select-none",
        className,
      )}
      {...props}
    />
  );
}
