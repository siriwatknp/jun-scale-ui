import type { ComponentProps, CSSProperties, MouseEventHandler, ReactNode } from "react";
import { cx } from "./cx";
import { useFieldControlProps } from "./FieldContext";
import "./Input.css";

type InputProps = Omit<ComponentProps<"input">, "className" | "style"> & {
  className?: string;
  style?: CSSProperties;
  start?: ReactNode;
  end?: ReactNode;
  action?: ReactNode;
  actionLabel?: string;
  onAction?: MouseEventHandler<HTMLButtonElement>;
};

export function Input({ className, style, start, end, action, actionLabel, onAction, ...props }: InputProps) {
  const inputProps = useFieldControlProps(props);
  return (
    <label data-slot="Input" className={cx("Input", className)} style={style}>
      {start}
      <input data-slot="Input-field" className="Input-field" {...inputProps} />
      {end}
      {action != null && (
        <button data-slot="Input-action" className="Input-action" type="button" aria-label={actionLabel} onClick={onAction}>
          {action}
        </button>
      )}
    </label>
  );
}
