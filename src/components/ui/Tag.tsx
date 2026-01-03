// Tag.tsx - React version of reusable tag/pill component

import type { ReactNode, ComponentPropsWithoutRef } from "react";

type TagVariant = "default" | "filter" | "subtle";
type TextCase = "uppercase" | "lowercase" | "normal";

interface BaseTagProps {
  variant?: TagVariant;
  textCase?: TextCase;
  className?: string;
  children: ReactNode;
}

type ButtonTagProps = BaseTagProps &
  ComponentPropsWithoutRef<"button"> & {
    as?: "button";
  };

type AnchorTagProps = BaseTagProps &
  ComponentPropsWithoutRef<"a"> & {
    as: "a";
  };

type SpanTagProps = BaseTagProps &
  ComponentPropsWithoutRef<"span"> & {
    as: "span";
  };

type TagProps = ButtonTagProps | AnchorTagProps | SpanTagProps;

// Base classes shared by all variants
const baseClasses = "font-base soft-transition rounded-full px-2 py-1 text-sm";

// Variant-specific classes
const variantClasses: Record<TagVariant, string> = {
  default:
    "bg-surface-2 hover:bg-surface-3 text-content-3 hover:text-content-2",
  filter:
    "bg-surface-1 hover:bg-surface-3 text-content-2 hover:text-content-1 focus-outline",
  subtle: "bg-surface-1 text-content-3 hover:text-content-2",
};

// Text case classes
const caseClasses: Record<TextCase, string> = {
  uppercase: "uppercase",
  lowercase: "lowercase",
  normal: "",
};

export function Tag({
  variant = "default",
  textCase = "uppercase",
  as = "button",
  className = "",
  children,
  ...rest
}: TagProps) {
  const classes = [
    baseClasses,
    variantClasses[variant],
    caseClasses[textCase],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (as === "a") {
    return (
      <a className={classes} {...(rest as ComponentPropsWithoutRef<"a">)}>
        {children}
      </a>
    );
  }

  if (as === "span") {
    return (
      <span className={classes} {...(rest as ComponentPropsWithoutRef<"span">)}>
        {children}
      </span>
    );
  }

  return (
    <button
      type="button"
      className={classes}
      {...(rest as ComponentPropsWithoutRef<"button">)}
    >
      {children}
    </button>
  );
}
