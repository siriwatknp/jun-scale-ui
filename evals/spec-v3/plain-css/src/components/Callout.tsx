import type { ComponentProps, ReactNode } from "react";
import { cx } from "./cx";
import "./Callout.css";

type CalloutProps = ComponentProps<"div"> & { icon?: ReactNode };

export function Callout({ className, icon, children, ...props }: CalloutProps) {
  return (
    <div data-slot="Callout" className={cx("Callout", className)} {...props}>
      {icon != null && (
        <span data-slot="Callout-icon" className="Callout-icon">
          {icon}
        </span>
      )}
      <div data-slot="Callout-text" className="Callout-text">
        {children}
      </div>
    </div>
  );
}
