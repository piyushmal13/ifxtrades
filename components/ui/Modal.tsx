"use client";

import React, { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    size?: "sm" | "md" | "lg" | "xl";
    children: React.ReactNode;
    footer?: React.ReactNode;
}

const sizeClass = {
    sm: "max-w-sm",
    md: "max-w-[540px]",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
};

export function Modal({ open, onClose, title, description, size = "md", children, footer }: ModalProps) {
    const titleId = useId();
    const descriptionId = useId();
    const panelRef = useRef<HTMLDivElement>(null);
    const lastFocusRef = useRef<Element | null>(null);

    /* Lock scroll and save last focused element */
    useEffect(() => {
        if (open) {
            lastFocusRef.current = document.activeElement;
            document.body.style.overflow = "hidden";
            // Delay focus to after animation
            const timer = setTimeout(() => panelRef.current?.focus(), 50);
            return () => clearTimeout(timer);
        } else {
            document.body.style.overflow = "";
            (lastFocusRef.current as HTMLElement | null)?.focus();
        }
    }, [open]);

    /* ESC to close */
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [open, onClose]);

    /* Focus trap */
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key !== "Tab") return;
        const panel = panelRef.current;
        if (!panel) return;
        const focusableSelectors =
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        const focusable = Array.from(panel.querySelectorAll<HTMLElement>(focusableSelectors));
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
            if (document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
            if (document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
    };

    if (!open) return null;

    return createPortal(
        <div
            className="modal-backdrop"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            aria-label="Dialog overlay"
        >
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={description ? descriptionId : undefined}
                tabIndex={-1}
                className={`modal-panel w-full ${sizeClass[size]} outline-none`}
                onKeyDown={handleKeyDown}
            >
                {/* Header */}
                <div className="flex items-start justify-between p-6 border-b border-white/8">
                    <div>
                        <h2 id={titleId} className="font-serif text-xl text-white tracking-tight">
                            {title}
                        </h2>
                        {description && (
                            <p id={descriptionId} className="mt-1 text-sm text-white/45 leading-relaxed">
                                {description}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="ml-4 shrink-0 text-white/30 hover:text-white/70 transition-colors p-1 -mt-1 -mr-1"
                        aria-label="Close dialog"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">{children}</div>

                {/* Footer */}
                {footer && (
                    <div className="px-6 pb-6 flex justify-end gap-3 border-t border-white/8 pt-5">
                        {footer}
                    </div>
                )}
            </div>
        </div>,
        document.body,
    );
}
