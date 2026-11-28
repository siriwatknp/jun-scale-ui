import { createContext, useContext, type AriaAttributes } from "react";

export type FieldControl = { id: string; describedBy?: string; invalid: boolean };

export const FieldContext = createContext<FieldControl | null>(null);

export function useFieldControl() {
  return useContext(FieldContext);
}

type ControlProps = { id?: string; "aria-describedby"?: string; "aria-invalid"?: AriaAttributes["aria-invalid"] };

export function useFieldControlProps<P extends ControlProps>(props: P): P {
  const field = useFieldControl();
  if (!field) return props;
  return {
    ...props,
    id: props.id ?? field.id,
    "aria-describedby": props["aria-describedby"] ?? field.describedBy,
    "aria-invalid": props["aria-invalid"] ?? (field.invalid || undefined),
  };
}
