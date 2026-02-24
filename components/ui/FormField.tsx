import React, { useId } from "react";

interface FormFieldProps {
    label: string;
    hint?: string;
    error?: string;
    required?: boolean;
    children: React.ReactElement;
    className?: string;
}

/**
 * FormField wraps any input-like element with a label, hint, and error message.
 * It automatically threads the input ID and aria-describedby.
 * Preserves child element props on error (no state reset).
 */
export function FormField({ label, hint, error, required, children, className = "" }: FormFieldProps) {
    const id = useId();
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;

    const described = [hint ? hintId : null, error ? errorId : null]
        .filter(Boolean)
        .join(" ");

    const child = React.cloneElement(children, {
        id,
        "aria-required": required,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": described || undefined,
    } as React.HTMLAttributes<HTMLElement>);

    return (
        <div className={`flex flex-col ${className}`}>
            <label htmlFor={id} className="field-label mb-2">
                {label}
                {required && (
                    <span className="text-jpm-gold ml-0.5" aria-label="required">*</span>
                )}
            </label>

            {child}

            {hint && !error && (
                <p id={hintId} className="field-hint mt-1">{hint}</p>
            )}
            {error && (
                <p id={errorId} className="field-error mt-1" role="alert" aria-live="polite">
                    <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="shrink-0 mt-0.5" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
}
