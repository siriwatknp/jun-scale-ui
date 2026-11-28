import type { ComponentProps } from "react";
import { cx } from "./cx";
import styles from "./Card.module.css";

export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} data-slot="Card" className={cx(styles.root, className)} />;
}
