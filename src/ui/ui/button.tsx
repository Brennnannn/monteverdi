import React, { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

type ButtonScheme = "default" | "primary" | "anti";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  scheme?: ButtonScheme;
}

const schemes: Record<ButtonScheme, string> = {
  default: "border border-trim text-text",
  primary: "bg-primary text-background dark:text-text",
  anti: "bg-error text-background dark:text-text",
};

/**
 * Renders a styled button with three color scheme variants.
 * Cursor and hover effects are only applied when the button is interactive
 * (has an `onClick`, is a `type="submit"`, or is nested inside an anchor).
 *
 * @param {"default" | "primary" | "anti"} [scheme="default"] - Color scheme: bordered neutral, filled primary, or filled error
 * @param {string} [className] - Additional Tailwind classes merged onto the button
 * @param {() => void} [onClick] - Click handler
 * @param {React.ReactNode} children - Button content
 * @param {boolean} [disabled] - Disables the button and dims it to 60% brightness
 * @param {"button" | "submit" | "reset"} [type="button"] - HTML button type
 *
 * @example
 * ```tsx
 * <Button scheme="primary" onClick={handleSave}>Save</Button>
 * <Button scheme="anti" type="submit">Delete</Button>
 * ```
 */

export function Button({
  scheme = "default",
  className = "",
  onClick,
  type = "button",
  disabled,
  ...props
}: ButtonProps) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [isInsideAnchor, setIsInsideAnchor] = useState(false);

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;
    setIsInsideAnchor(Boolean(button.closest("a[href]")));
  }, []);

  const isInteractive = !disabled && (Boolean(onClick) || isInsideAnchor || type === "submit");

  return (
    <button
      ref={buttonRef}
      className={twMerge(
        "flex flex-row items-center px-4 py-2 rounded-lg brightness-90 disabled:brightness-60 text-text",
        isInteractive && "hover:brightness-100 cursor-pointer",
        schemes[scheme],
        className
      )}
      disabled={disabled}
      type={type}
      onClick={onClick}
      {...props}
    />
  );
}

