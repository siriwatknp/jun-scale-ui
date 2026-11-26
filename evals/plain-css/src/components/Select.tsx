import type { ComponentProps, ReactNode } from "react";
import { cx } from "./cx";
import { useFieldControl } from "./FieldContext";
import { Icon } from "./Icon";
import "./Select.css";

const chevron = <path d="M4.5 6.5L8 10l3.5-3.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />;

type SelectProps = ComponentProps<"div"> & { open?: boolean; items?: ReactNode[] };

export function Select({ className, children, open = false, items = [], ...props }: SelectProps) {
  const field = useFieldControl({});
  return (
    <div data-slot="Select" className={cx("Select", className)} {...props}>
      <button
        data-slot="Select-trigger"
        className="Select-trigger"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        {...field}
      >
        {children}
        <Icon>{chevron}</Icon>
      </button>
      {open && (
        <div data-slot="Popup" className="Popup" role="listbox">
          {items.map((item, index) => (
            <div key={index} data-slot="Popup-item" className="Popup-item" role="option" aria-selected={false}>
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
