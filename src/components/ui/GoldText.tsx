import type { ElementType, ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/classNames";

type GoldTextProps<T extends ElementType> = {
  as?: T;
  children: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

export function GoldText<T extends ElementType = "span">({
  as,
  children,
  className,
  ...rest
}: GoldTextProps<T>) {
  const Component = (as ?? "span") as ElementType;
  return (
    <Component className={cn("text-gold-leaf font-display", className)} {...rest}>
      {children}
    </Component>
  );
}
