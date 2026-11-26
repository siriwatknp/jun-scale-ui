import type { ComponentProps } from "react";
import { cx } from "./cx";
import { useFieldControl } from "./FieldContext";
import { Icon } from "./Icon";
import "./Checkbox.css";

const checkmark = <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />;

export function Checkbox({ className, style, ...props }: Omit<ComponentProps<"input">, "type">) {
  const field = useFieldControl(props);
  return (
    <span data-slot="Checkbox" className={cx("Checkbox", className)} style={style}>
      <input data-slot="Checkbox-input" className="Checkbox-input" type="checkbox" {...props} {...field} />
      <Icon>{checkmark}</Icon>
    </span>
  );
}
