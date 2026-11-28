import type { ComponentProps } from "react";
import { cx } from "./cx";
import styles from "./Icon.module.css";

export function Icon({ className, ...props }: ComponentProps<"svg">) {
  return (
    <svg
      aria-hidden={props["aria-label"] || props["aria-labelledby"] ? undefined : true}
      focusable="false"
      {...props}
      data-slot="Icon"
      viewBox="0 0 16 16"
      className={cx(styles.root, className)}
    />
  );
}
