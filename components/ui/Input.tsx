"use client";

import React, { useId, useState } from "react";

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
    label?: string;
    hint?: string;
    error?: string;
    success?: boolean;
    showCount?: boolean;
    maxLength?: number;
    leftAdornment?: React.ReactNode;
    rightAdornment?: React.ReactNode;
}

export function Input({
    label,
    hint,
    error,
    success,
    showCount,
    maxLength,
    leftAdornment,
    rightAdornment,
    type = "text",
    className = "",
    id: externalId,
    value,
    onChange,
    ...rest
}: InputProps) {
    const autoId = useId();
    const id = externalId ?? autoId;
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;
    const countId = `${id}-count`;
    const [showPw, setShowPw] = useState(false);

    const inputType = type === "password" && showPw ? "text" : type;
    const charCount = typeof value === "string" ? value.length : 0;

    const stateClass = error
        ? "input-error"
        : success
            ? "input-success"
            : "";

    const describedBy = [
        hint ? hintId : null,
        error ? errorId : null,
        showCount ? countId : null,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div className="flex flex-col gap-0">
            {label && (
                <label htmlFor={id} className="field-label">
                    {label}
                    {rest.required && (
                        <span className="text-jpm-gold ml-1" aria-label="required">*</span>
                    )}
                </label>
            )}

            <div className="relative flex items-center">
                {leftAdornment && (
                    <span className="absolute left-3 pointer-events-none text-white/30">
                        {leftAdornment}
                    </span>
                )}
                <input
                    id={id}
                    type={inputType}
                    value={value}
                    onChange={onChange}
                    maxLength={maxLength}
                    aria-invalid={!!error}
                    aria-describedby={describedBy || undefined}
                    className={`input-base ${stateClass} ${leftAdornment ? "pl-10" : ""} ${rightAdornment || type === "password" ? "pr-10" : ""
                        } ${className}`}
                    {...rest}
                />
                {type === "password" && (
                    <button
                        type="button"
                        onClick={() => setShowPw((s) => !s)}
                        className="absolute right-3 text-white/30 hover:text-white/60 transition-colors"
                        aria-label={showPw ? "Hide password" : "Show password"}
                    >
                        {showPw ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                )}
                {type !== "password" && rightAdornment && (
                    <span className="absolute right-3 pointer-events-none text-white/30">
                        {rightAdornment}
                    </span>
                )}
            </div>

            <div className="flex items-start justify-between mt-1">
                <div>
                    {hint && !error && (
                        <p id={hintId} className="field-hint">{hint}</p>
                    )}
                    {error && (
                        <p id={errorId} className="field-error" role="alert" aria-live="polite">
                            <ErrorIcon />
                            {error}
                        </p>
                    )}
                </div>
                {showCount && maxLength && (
                    <p id={countId} className="field-hint tabular-nums ml-2 shrink-0">
                        {charCount}/{maxLength}
                    </p>
                )}
            </div>
        </div>
    );
}

function EyeIcon() {
    return (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
    );
}

function EyeOffIcon() {
    return (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
    );
}

function ErrorIcon() {
    return (
        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="shrink-0 mt-0.5" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );
}
