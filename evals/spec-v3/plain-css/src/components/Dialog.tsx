import { useId, type ComponentProps, type ReactNode } from "react";
import { cx } from "./cx";
import "./Dialog.css";

type DialogProps = Omit<ComponentProps<"div">, "title"> & {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
};

export function Dialog({ className, title, description, actions, children, ...props }: DialogProps) {
  const id = useId();
  const titleId = title != null ? `${id}-title` : undefined;
  const descriptionId = description != null ? `${id}-description` : undefined;
  return (
    <div data-slot="Dialog" className={cx("Dialog", className)} role="dialog" aria-labelledby={titleId} aria-describedby={descriptionId} {...props}>
      {title != null && (
        <h2 data-slot="Dialog-title" className="Dialog-title" id={titleId}>
          {title}
        </h2>
      )}
      {description != null && (
        <p data-slot="Dialog-description" className="Dialog-description" id={descriptionId}>
          {description}
        </p>
      )}
      {children}
      {actions != null && (
        <div data-slot="Dialog-actions" className="Dialog-actions">
          {actions}
        </div>
      )}
    </div>
  );
}
