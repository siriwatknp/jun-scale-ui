import type { ComponentProps } from "react";
import { cx } from "./cx";
import { Icon } from "./Icon";

export function Checkbox({ className, style, ...props }: Omit<ComponentProps<"input">, "type">) {
  return (
    <span
      data-slot="Checkbox"
      style={style}
      className={cx(
        "component-group-3 [--default-group2:0.5] relative inline-grid size-4 shrink-0 place-items-center align-middle text-white",
        className,
      )}
    >
      <input
        {...props}
        type="checkbox"
        data-slot="Checkbox-input"
        className="peer absolute inset-0 m-0 box-border size-full cursor-pointer appearance-none rounded-xs border border-gray-400 bg-white checked:border-blue-600 checked:bg-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
      />
      <Icon className="pointer-events-none invisible relative peer-checked:visible">
        <path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </Icon>
    </span>
  );
}
