import type { ComponentProps } from "react";
import { cx } from "./cx";

export function IconButton({ className, ...props }: ComponentProps<"button">) {
  return (
    <button
      type="button"
      {...props}
      data-slot="IconButton"
      className={cx(
        "component-group-5 m-0 inline-flex box-border size-8 shrink-0 cursor-pointer items-center justify-center rounded-sm border border-gray-300 bg-white p-0 text-gray-900 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    />
  );
}
