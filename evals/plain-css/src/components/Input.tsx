import type { ComponentProps, ReactNode } from "react";
import { cx } from "./cx";
import { useFieldControl } from "./FieldContext";
import "./Input.css";

type InputProps = ComponentProps<"input"> & { start?: ReactNode; end?: ReactNode };

export function Input({ className, style, start, end, ...props }: InputProps) {
  const field = useFieldControl(props);
  return (
    <label data-slot="Input" className={cx("Input", className)} style={style}>
      {start}
      <input data-slot="Input-field" className="Input-field" {...props} {...field} />
      {end}
    </label>
  );
}
