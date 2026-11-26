import type { ComponentProps } from "react";
import { cx } from "./cx";

export function Button({ className, ...props }: ComponentProps<"button">) {
  return (
    <button
      type="button"
      {...props}
      data-slot="Button"
      className={cx(
        "component-group-5 m-0 inline-flex box-border h-8 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-sm border-0 bg-gray-900 px-3 font-sans text-sm font-medium whitespace-nowrap text-white hover:bg-gray-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    />
  );
}
