import type { ComponentProps, ReactNode } from "react";
import { cx } from "./cx";
import { Icon } from "./Icon";

type SelectProps = ComponentProps<"div"> & { open?: boolean; items?: ReactNode[] };

export function Select({ className, children, open = false, items = [], ...props }: SelectProps) {
  return (
    <div
      {...props}
      data-slot="Select"
      className={cx("component-group-5 relative inline-flex flex-col font-sans text-sm in-field:self-stretch", className)}
    >
      <button
        type="button"
        data-slot="Select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        className="m-0 flex box-border h-8 cursor-pointer items-center gap-2 rounded-sm border border-gray-300 bg-white px-3 text-left font-sans text-sm whitespace-nowrap text-gray-900 [--scale-group4:calc(var(--scale-group5,1)*0.75)] hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
      >
        {children}
        <Icon className="ml-auto text-gray-500">
          <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </Icon>
      </button>
      {open && (
        <div
          data-slot="Popup"
          role="listbox"
          className="absolute top-full left-0 z-10 mt-1 box-border flex min-w-32 flex-col rounded-md border border-gray-200 bg-white p-1 text-gray-900 shadow-lg"
        >
          {items.map((item, index) => (
            <div
              key={index}
              role="option"
              aria-selected={false}
              data-slot="Popup-item"
              className="flex box-border h-8 cursor-default items-center gap-2 rounded-sm px-3 whitespace-nowrap hover:bg-gray-100"
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
