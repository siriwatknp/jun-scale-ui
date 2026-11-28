import type { ComponentProps, ReactNode } from "react";
import { cx } from "./cx";
import { useFieldControl } from "./FieldContext";
import { chevronDown } from "./glyphs";
import { Icon } from "./Icon";
import "./Popup.css";
import "./Select.css";

type SelectProps = ComponentProps<"div"> & { open?: boolean; items?: ReactNode[] };

export function Select({ className, children, open = false, items = [], ...props }: SelectProps) {
  const field = useFieldControl();
  return (
    <div data-slot="Select" className={cx("Select", className)} {...props}>
      <button
        data-slot="Select-trigger"
        className="Select-trigger"
        type="button"
        id={field?.id}
        aria-describedby={field?.describedBy}
        aria-invalid={field?.invalid || undefined}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {children}
        <Icon>{chevronDown}</Icon>
      </button>
      {open && (
        <div data-slot="Popup" className="Popup" role="listbox">
          {items.map((item, index) => (
            <div data-slot="Popup-item" className="Popup-item" role="option" aria-selected={false} key={index}>
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
