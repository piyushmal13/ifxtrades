"use client";

import React from "react";

type Variant = "primary" | "ghost" | "outline" | "danger" | "link";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
    loading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    fullWidth?: boolean;
    as?: "button" | "a";
    href?: string;
}

const variantClasses: Record<Variant, string> = {
    primary: "btn-primary",
    ghost: "btn-ghost",
    outline: "btn-outline",
    danger: "btn-danger",
    link: "text-jpm-gold underline-offset-4 hover:underline text-sm font-medium",
};

const sizeClasses: Record<Size, string> = {
    sm: "btn-sm",
    md: "btn-md",
    lg: "btn-lg",
};

export function Button({
    variant = "primary",
    size = "md",
    loading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    className = "",
    children,
    disabled,
    as: Tag = "button",
    href,
    ...rest
}: ButtonProps) {
    const isDisabled = disabled || loading;

    const classes = [
        variant !== "link" ? "btn-base" : "",
        variant !== "link" ? sizeClasses[size] : "",
        variantClasses[variant],
        fullWidth ? "w-full" : "",
        className,
    ]
        .filter(Boolean)
        .join(" ");

    const content = (
        <>
            {loading ? <Spinner /> : leftIcon}
            {children && <span>{children}</span>}
            {!loading && rightIcon}
        </>
    );

    if (Tag === "a" && href) {
        return (
            <a href={href} className={classes} aria-disabled={isDisabled}>
                {content}
            </a>
        );
    }

    return (
        <button
            className={classes}
            disabled={isDisabled}
            aria-busy={loading}
            {...rest}
        >
            {content}
        </button>
    );
}

function Spinner() {
    return (
        <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <circle
                className="opacity-25"
                cx="12" cy="12" r="10"
                stroke="currentColor" strokeWidth="4"
            />
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
        </svg>
    );
}
