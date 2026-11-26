import type { ComponentProps, ReactNode } from "react";
import { cx } from "./cx";

type InputProps = ComponentProps<"input"> & { start?: ReactNode; end?: ReactNode };

export function Input({ className, style, start, end, ...props }: InputProps) {
  return (
    <label
      data-slot="Input"
      style={style}
      className={cx(
        "component-group-5 inline-flex box-border h-8 w-45 cursor-text items-center gap-2 rounded-sm border border-gray-300 bg-white px-2 font-sans text-sm text-gray-500 focus-within:border-blue-500 focus-within:outline-1 focus-within:outline-blue-500 has-aria-invalid:border-red-600 in-field:w-auto in-field:self-stretch",
        className,
      )}
    >
      {start}
      <input
        {...props}
        data-slot="Input-field"
        className="m-0 min-w-0 flex-1 border-0 bg-transparent p-0 font-sans text-sm text-gray-900 outline-none placeholder:text-gray-400"
      />
      {end}
    </label>
  );
}
