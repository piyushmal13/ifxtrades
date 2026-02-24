"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/* ── Types ─────────────────────────────────────────────────────── */

type ToastType = "success" | "error" | "warning" | "info";

interface ToastItem {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

interface ToastContextValue {
    toast: (opts: Omit<ToastItem, "id">) => void;
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
}

/* ── Context ────────────────────────────────────────────────────── */

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const dismiss = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const toast = useCallback((opts: Omit<ToastItem, "id">) => {
        const id = Math.random().toString(36).slice(2);
        setToasts((prev) => [...prev.slice(-4), { ...opts, id }]); // max 5 toasts
        const duration = opts.duration ?? 4500;
        setTimeout(() => dismiss(id), duration);
    }, [dismiss]);

    const success = useCallback((title: string, message?: string) =>
        toast({ type: "success", title, message }), [toast]);
    const error = useCallback((title: string, message?: string) =>
        toast({ type: "error", title, message, duration: 6000 }), [toast]);
    const warning = useCallback((title: string, message?: string) =>
        toast({ type: "warning", title, message }), [toast]);
    const info = useCallback((title: string, message?: string) =>
        toast({ type: "info", title, message }), [toast]);

    return (
        <ToastContext.Provider value={{ toast, success, error, warning, info }}>
            {children}
            {mounted &&
                createPortal(
                    <div className="toast-container" aria-live="polite" aria-label="Notifications">
                        {toasts.map((t) => (
                            <ToastItem key={t.id} item={t} onDismiss={dismiss} />
                        ))}
                    </div>,
                    document.body,
                )}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
    return ctx;
}

/* ── Toast Item ─────────────────────────────────────────────────── */

const CONFIG: Record<ToastType, { icon: React.ReactNode; class: string }> = {
    success: { class: "toast-success", icon: <SuccessIcon /> },
    error: { class: "toast-error", icon: <ErrorIcon /> },
    warning: { class: "toast-warning", icon: <WarningIcon /> },
    info: { class: "toast-info", icon: <InfoIcon /> },
};

function ToastItem({ item, onDismiss }: { item: ToastItem; onDismiss: (id: string) => void }) {
    const { type, title, message, id } = item;
    const { class: cls, icon } = CONFIG[type];

    return (
        <div className={`toast ${cls}`} role="alert" aria-live="assertive">
            <span className="shrink-0 mt-0.5">{icon}</span>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-white">{title}</p>
                {message && <p className="text-xs text-white/55 mt-0.5 leading-relaxed">{message}</p>}
            </div>
            <button
                onClick={() => onDismiss(id)}
                className="shrink-0 text-white/25 hover:text-white/60 transition-colors -mt-1 -mr-1 p-1"
                aria-label="Dismiss notification"
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
}

/* ── Icons ──────────────────────────────────────────────────────── */

function SuccessIcon() {
    return (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#34d399" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );
}

function ErrorIcon() {
    return (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#f87171" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );
}

function WarningIcon() {
    return (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#fbbf24" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
    );
}

function InfoIcon() {
    return (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#60a5fa" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );
}
