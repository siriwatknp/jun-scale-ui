import { Children, isValidElement, type ComponentProps } from "react";
import { cx } from "./cx";
import { Icon } from "./Icon";
import styles from "./Button.module.css";

export function Button({ className, children, type = "button", ...props }: ComponentProps<"button">) {
  const first = Children.toArray(children)[0];
  const startsWithIcon = isValidElement(first) && first.type === Icon;
  return (
    <button {...props} type={type} data-slot="Button" className={cx(styles.root, startsWithIcon && styles.iconStart, className)}>
      {children}
    </button>
  );
}
