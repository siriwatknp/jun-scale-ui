import { createContext, useContext } from "react";

type FieldControl = { id: string; describedBy: string; invalid: boolean };

export const FieldContext = createContext<FieldControl | null>(null);

export function useFieldControl(props: { id?: string; "aria-describedby"?: string; "aria-invalid"?: boolean | "true" | "false" | "grammar" | "spelling" }) {
  const field = useContext(FieldContext);
  return {
    id: props.id ?? field?.id,
    "aria-describedby": props["aria-describedby"] ?? field?.describedBy,
    "aria-invalid": props["aria-invalid"] ?? (field?.invalid || undefined),
  };
}
