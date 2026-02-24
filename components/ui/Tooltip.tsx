"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Placement = "top" | "bottom" | "left" | "right";

interface TooltipProps {
    content: string;
    children: React.ReactElement;
    placement?: Placement;
    delay?: number;
}

export function Tooltip({ content, children, placement = "top", delay = 300 }: TooltipProps) {
    const [visible, setVisible] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLElement>(null);
    const timerRef = useRef<NodeJS.Timeout | number | null>(null);
    const tooltipId = useId();

    const show = () => {
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            if (!triggerRef.current) return;
            const rect = triggerRef.current.getBoundingClientRect();
            const { innerWidth, scrollX, scrollY } = window;
            let top = 0, left = 0;

            if (placement === "top") {
                top = rect.top + scrollY - 8;
                left = rect.left + scrollX + rect.width / 2;
            } else if (placement === "bottom") {
                top = rect.bottom + scrollY + 8;
                left = rect.left + scrollX + rect.width / 2;
            } else if (placement === "left") {
                top = rect.top + scrollY + rect.height / 2;
                left = rect.left + scrollX - 8;
            } else {
                top = rect.top + scrollY + rect.height / 2;
                left = rect.right + scrollX + 8;
            }
            setCoords({ top, left });
            setVisible(true);
        }, delay);
    };

    const hide = () => {
        clearTimeout(timerRef.current);
        setVisible(false);
    };

    useEffect(() => () => clearTimeout(timerRef.current), []);

    const transformClass: Record<Placement, string> = {
        top: "-translate-x-1/2 -translate-y-full",
        bottom: "-translate-x-1/2",
        left: "-translate-x-full -translate-y-1/2",
        right: "-translate-y-1/2",
    };

    const trigger = React.cloneElement(children, {
        ref: triggerRef,
        onMouseEnter: show,
        onMouseLeave: hide,
        onFocus: show,
        onBlur: hide,
        "aria-describedby": visible ? tooltipId : undefined,
    } as React.HTMLAttributes<HTMLElement> & { ref: React.Ref<HTMLElement> });

    return (
        <>
            {trigger}
            {visible && typeof document !== "undefined" &&
                createPortal(
                    <div
                        id={tooltipId}
                        role="tooltip"
                        style={{ top: coords.top, left: coords.left, position: "absolute" }}
                        className={`z-[9999] pointer-events-none px-2.5 py-1.5 max-w-xs rounded text-[11px] leading-snug font-medium text-white bg-[#1e293b] border border-white/15 shadow-lg ${transformClass[placement]}`}
                    >
                        {content}
                    </div>,
                    document.body,
                )}
        </>
    );
}
