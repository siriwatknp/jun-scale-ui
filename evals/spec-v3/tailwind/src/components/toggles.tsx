import type { ComponentProps } from "react";
import { cx } from "./cx";
import { Icon } from "./small";

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600";

export function Checkbox({ className, style, ...props }: Omit<ComponentProps<"input">, "type">) {
  return (
    <span
      data-slot="Checkbox"
      className={cx(
        "ui-group-3 ui-pass-below-3 ui-pass-group2-0.5 relative box-border inline-flex size-4 shrink-0 items-center justify-center align-middle text-white",
        className,
      )}
      style={style}
    >
      <input
        data-slot="Checkbox-input"
        type="checkbox"
        className={cx(
          "peer absolute inset-0 m-0 box-border size-full cursor-pointer appearance-none rounded-xs border border-gray-400 bg-white checked:border-blue-600 checked:bg-blue-600",
          focusRing,
        )}
        {...props}
      />
      <Icon className="pointer-events-none relative invisible peer-checked:visible">
        <path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </Icon>
    </span>
  );
}

export function Switch({ className, style, ...props }: Omit<ComponentProps<"input">, "type">) {
  return (
    <span
      data-slot="Switch"
      className={cx("ui-group-3 ui-pass-below-3 relative box-border inline-flex h-6 w-10 shrink-0 align-middle", className)}
      style={style}
    >
      <input
        data-slot="Switch-input"
        type="checkbox"
        role="switch"
        className={cx(
          "peer absolute inset-0 m-0 box-border size-full cursor-pointer appearance-none rounded-full bg-gray-300 checked:bg-blue-600",
          focusRing,
        )}
        {...props}
      />
      <span
        data-slot="Switch-thumb"
        className="pointer-events-none absolute top-1 left-1 box-border size-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4"
      />
    </span>
  );
}
