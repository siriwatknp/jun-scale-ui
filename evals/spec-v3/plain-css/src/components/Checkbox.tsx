import type { ComponentProps } from "react";
import { cx } from "./cx";
import { useFieldControlProps } from "./FieldContext";
import { checkmark } from "./glyphs";
import { Icon } from "./Icon";
import "./Checkbox.css";

export function Checkbox({ className, style, ...props }: Omit<ComponentProps<"input">, "type">) {
  const inputProps = useFieldControlProps(props);
  return (
    <span data-slot="Checkbox" className={cx("Checkbox", className)} style={style}>
      <input data-slot="Checkbox-input" className="Checkbox-input" type="checkbox" {...inputProps} />
      <Icon>{checkmark}</Icon>
    </span>
  );
}
