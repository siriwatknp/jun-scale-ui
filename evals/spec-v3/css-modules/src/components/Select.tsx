import type { ComponentProps, ReactNode } from "react";
import { cx } from "./cx";
import { Icon } from "./Icon";
import styles from "./Select.module.css";

type SelectProps = ComponentProps<"div"> & {
  open?: boolean;
  items?: ReactNode[];
};

export function Select({ className, children, open = false, items = [], ...props }: SelectProps) {
  return (
    <div {...props} data-slot="Select" className={cx(styles.root, className)}>
      <button type="button" data-slot="Select-trigger" aria-haspopup="listbox" aria-expanded={open} className={styles.trigger}>
        {children}
        <Icon className={styles.chevron}>
          <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        </Icon>
      </button>
      {open && (
        <div data-slot="Popup" role="listbox" className={styles.popup}>
          {items.map((item, index) => (
            <div key={index} data-slot="Popup-item" role="option" aria-selected={false} className={styles.item}>
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
