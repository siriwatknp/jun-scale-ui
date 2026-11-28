import { Children, isValidElement, type ComponentProps } from "react";
import { cx } from "./cx";
import { Icon } from "./Icon";
import "./Button.css";

export function Button({ className, children, type = "button", ...props }: ComponentProps<"button">) {
  const first = Children.toArray(children)[0];
  const startsWithIcon = isValidElement(first) && first.type === Icon;
  return (
    <button data-slot="Button" className={cx("Button", startsWithIcon && "Button--startIcon", className)} type={type} {...props}>
      {children}
    </button>
  );
}
