import type { ComponentProps } from "react";
import { cx } from "./cx";

export function Switch({ className, style, ...props }: Omit<ComponentProps<"input">, "type">) {
  return (
    <span
      data-slot="Switch"
      style={style}
      className={cx(
        "component-group-3 relative inline-block box-border h-6 w-10 shrink-0 rounded-full bg-gray-300 align-middle transition-colors has-checked:bg-blue-600 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-blue-500 has-disabled:opacity-50 motion-reduce:transition-none",
        className,
      )}
    >
      <input
        {...props}
        type="checkbox"
        role="switch"
        data-slot="Switch-input"
        className="peer absolute inset-0 m-0 size-full cursor-pointer appearance-none rounded-full opacity-0 disabled:cursor-not-allowed"
      />
      <span
        data-slot="Switch-thumb"
        className="pointer-events-none absolute top-1 left-1 size-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4 motion-reduce:transition-none"
      />
    </span>
  );
}
