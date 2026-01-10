import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import classNames from "classnames";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, id, required, ...props }, ref) => {
    const inputId = id || React.useId();
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;
    const describedBy = [errorId, helperId].filter(Boolean).join(" ");

    return (
      <div className="flex flex-col gap-1.5">
        <LabelPrimitive.Root
          htmlFor={inputId}
          className={classNames(
            "text-sm font-medium text-foreground",
            className,
          )}
        >
          {label}
          {required && (
            <span className="ml-1 text-destructive" aria-label="required">
              *
            </span>
          )}
        </LabelPrimitive.Root>

        <input
          id={inputId}
          ref={ref}
          required={required}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={describedBy || undefined}
          className={`
            w-full rounded-lg border px-4 py-4 text-base text-foreground
            transition-colors placeholder:text-muted-foreground
            focus:outline-none focus:ring-1 focus:ring-ring focus:border-primary
            disabled:cursor-not-allowed disabled:opacity-50
            bg-neutral-900
            ${
              error
                ? "border-destructive focus:ring-destructive"
                : "border-zinc-300 dark:border-zinc-700"
            }
          `}
          {...props}
        />

        {error && (
          <p id={errorId} className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={helperId} className="text-sm text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
