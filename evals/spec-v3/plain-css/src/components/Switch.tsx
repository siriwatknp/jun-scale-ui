import type { ComponentProps } from "react";
import { cx } from "./cx";
import { useFieldControlProps } from "./FieldContext";
import "./Switch.css";

export function Switch({ className, style, ...props }: Omit<ComponentProps<"input">, "type">) {
  const inputProps = useFieldControlProps(props);
  return (
    <span data-slot="Switch" className={cx("Switch", className)} style={style}>
      <input data-slot="Switch-input" className="Switch-input" type="checkbox" role="switch" {...inputProps} />
      <span data-slot="Switch-thumb" className="Switch-thumb" aria-hidden="true" />
    </span>
  );
}
