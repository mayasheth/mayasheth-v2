import type { ReactNode, ComponentPropsWithoutRef } from "react";

type TextCase = "uppercase" | "lowercase" | "normal";

interface BaseTagProps {
  /** CSS color value, e.g. "var(--color-accent-3)". Defaults to content-3 (blue). */
  color?: string;
  textCase?: TextCase;
  className?: string;
  children: ReactNode;
}

type ButtonTagProps = BaseTagProps & ComponentPropsWithoutRef<"button"> & { as?: "button" };
type AnchorTagProps = BaseTagProps & ComponentPropsWithoutRef<"a"> & { as: "a" };
type SpanTagProps   = BaseTagProps & ComponentPropsWithoutRef<"span"> & { as: "span" };

type TagProps = ButtonTagProps | AnchorTagProps | SpanTagProps;

const caseClasses: Record<TextCase, string> = {
  uppercase: "uppercase",
  lowercase: "lowercase",
  normal: "",
};

export function Tag({
  color,
  textCase = "uppercase",
  as = "button",
  className = "",
  children,
  ...rest
}: TagProps) {
  const focusClass = as !== "span" ? "focus-outline" : "";
  const classes = [
    "tag-frost font-base rounded-full px-2 py-1 text-sm",
    caseClasses[textCase],
    focusClass,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const style = color ? { "--tag-color": color } as React.CSSProperties : undefined;

  if (as === "a") {
    return <a className={classes} style={style} {...(rest as ComponentPropsWithoutRef<"a">)}>{children}</a>;
  }
  if (as === "span") {
    return <span className={classes} style={style} {...(rest as ComponentPropsWithoutRef<"span">)}>{children}</span>;
  }
  return (
    <button type="button" className={classes} style={style} {...(rest as ComponentPropsWithoutRef<"button">)}>
      {children}
    </button>
  );
}
