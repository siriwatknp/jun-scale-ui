import { cloneElement, isValidElement, useId, type ComponentProps, type ReactNode } from "react";
import { cx } from "./cx";
import styles from "./Popover.module.css";

type PopoverProps = ComponentProps<"div"> & {
  trigger: ReactNode;
  open?: boolean;
};

type TriggerProps = { "aria-expanded"?: boolean; "aria-controls"?: string; "aria-haspopup"?: "dialog" };

export function Popover({ className, trigger, open = false, children, ...props }: PopoverProps) {
  const contentId = useId();
  const linkedTrigger = isValidElement<TriggerProps>(trigger)
    ? cloneElement(trigger, { "aria-haspopup": "dialog", "aria-expanded": open, "aria-controls": open ? contentId : undefined })
    : trigger;
  return (
    <div {...props} data-slot="Popover" className={cx(styles.root, className)}>
      {linkedTrigger}
      {open && (
        <div id={contentId} data-slot="Popover-content" className={styles.content}>
          {children}
        </div>
      )}
    </div>
  );
}
