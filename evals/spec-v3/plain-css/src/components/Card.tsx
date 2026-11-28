import type { ComponentProps } from "react";
import { cx } from "./cx";
import "./Card.css";

export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="Card" className={cx("Card", className)} {...props} />;
}
