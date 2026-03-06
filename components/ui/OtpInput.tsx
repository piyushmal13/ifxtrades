"use client";

import React, { useCallback } from "react";
import { motion } from "framer-motion";

interface OtpInputProps {
    value: string;
    onChange: (val: string) => void;
    length?: number;
    hasError?: boolean;
    hasSuccess?: boolean;
    disabled?: boolean;
}

export function OtpInput({
    value,
    onChange,
    length = 6,
    hasError = false,
    hasSuccess = false,
    disabled = false,
}: OtpInputProps) {
    const digits = Array.from({ length }, (_, i) => value[i] ?? "");

    const handleChange = useCallback(
        (index: number, char: string) => {
            const newVal = value.split("");
            newVal[index] = char.replace(/\D/g, "").slice(-1);
            const next = newVal.join("").slice(0, length);
            onChange(next);
            // Auto-advance
            if (char && index < length - 1) {
                const nextInput = document.getElementById(`otp-${index + 1}`);
                nextInput?.focus();
            }
        },
        [value, length, onChange]
    );

    const handleKeyDown = useCallback(
        (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Backspace") {
                e.preventDefault();
                if (value[index]) {
                    // Clear current
                    const newVal = value.split("");
                    newVal[index] = "";
                    onChange(newVal.join(""));
                } else if (index > 0) {
                    // Move back
                    const prev = document.getElementById(`otp-${index - 1}`);
                    prev?.focus();
                    const newVal = value.split("");
                    newVal[index - 1] = "";
                    onChange(newVal.join(""));
                }
            }
            if (e.key === "ArrowLeft" && index > 0) {
                document.getElementById(`otp-${index - 1}`)?.focus();
            }
            if (e.key === "ArrowRight" && index < length - 1) {
                document.getElementById(`otp-${index + 1}`)?.focus();
            }
        },
        [value, length, onChange]
    );

    const handlePaste = useCallback(
        (e: React.ClipboardEvent) => {
            e.preventDefault();
            const pasted = e.clipboardData
                .getData("text")
                .replace(/\D/g, "")
                .slice(0, length);
            onChange(pasted);
            // Focus last filled or next empty
            const focusIdx = Math.min(pasted.length, length - 1);
            document.getElementById(`otp-${focusIdx}`)?.focus();
        },
        [length, onChange]
    );

    const borderColor = hasError
        ? "border-ifx-error shadow-[0_0_16px_rgba(239,68,68,0.2)]"
        : hasSuccess
            ? "border-ifx-success shadow-[0_0_16px_rgba(34,197,94,0.2)]"
            : "border-white/10 focus:border-ifx-gold focus:shadow-[0_0_16px_rgba(201,168,76,0.25)]";

    return (
        <motion.div
            className="flex gap-3 justify-center"
            animate={hasError ? { x: [0, -10, 10, -6, 6, 0] } : {}}
            transition={{ duration: 0.4 }}
        >
            {digits.map((digit, i) => (
                <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    disabled={disabled}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    autoFocus={i === 0}
                    className={`
            w-[52px] h-[64px] text-center text-[28px] font-mono font-bold
            bg-ifx-surface border-2 rounded-xl text-ifx-text
            transition-all duration-200 outline-none
            select-none tracking-[0.05em]
            disabled:opacity-40 disabled:cursor-not-allowed
            ${borderColor}
          `}
                />
            ))}
        </motion.div>
    );
}
