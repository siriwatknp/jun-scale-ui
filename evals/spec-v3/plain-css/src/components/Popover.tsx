import type { ComponentProps, ReactNode } from "react";
import { cx } from "./cx";
import "./Popover.css";

type PopoverProps = ComponentProps<"div"> & { trigger: ReactNode; open?: boolean };

export function Popover({ className, trigger, open = false, children, ...props }: PopoverProps) {
  return (
    <div data-slot="Popover" className={cx("Popover", className)} {...props}>
      {trigger}
      {open && (
        <div data-slot="Popover-content" className="Popover-content">
          {children}
        </div>
      )}
    </div>
  );
}
