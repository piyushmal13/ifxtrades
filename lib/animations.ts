import { Variants } from "framer-motion";

/**
 * IFX Institutional Gravity Animation Library
 * Philosophy: Nothing bounces, everything flows.
 * Easing: [0.25, 0.46, 0.45, 0.94] — gravity-pull deceleration
 */

export const GRAVITY = [0.25, 0.46, 0.45, 0.94] as const;

// Page-level staggered container
export const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
        },
    },
};

// Individual element entrance
export const itemVariants: Variants = {
    hidden: { opacity: 0, y: 24, filter: "blur(4px)" },
    visible: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: { duration: 0.6, ease: GRAVITY },
    },
};

// Fast item — tighter stagger for dense lists
export const itemFastVariants: Variants = {
    hidden: { opacity: 0, y: 12, filter: "blur(2px)" },
    visible: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: { duration: 0.4, ease: GRAVITY },
    },
};

// Card hover — gold border glow + subtle lift
export const hoverVariants: Variants = {
    rest: {
        scale: 1,
        borderColor: "rgba(201,168,76,0.25)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.40)",
    },
    hover: {
        scale: 1.015,
        borderColor: "rgba(201,168,76,0.7)",
        boxShadow: "0 16px 40px rgba(0,0,0,0.6), 0 0 30px rgba(201,168,76,0.15)",
        transition: { duration: 0.2, ease: GRAVITY },
    },
};

// Page transition — fade + Y shift
export const pageVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: GRAVITY },
    },
    exit: {
        opacity: 0,
        y: -8,
        transition: { duration: 0.25, ease: [0.4, 0, 1, 1] },
    },
};

// Fade only — for overlays, modals
export const fadeVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
};

// Slide from right — for panels
export const slidePanelVariants: Variants = {
    hidden: { opacity: 0, x: 40, filter: "blur(8px)" },
    visible: {
        opacity: 1,
        x: 0,
        filter: "blur(0px)",
        transition: { duration: 0.5, ease: GRAVITY },
    },
    exit: {
        opacity: 0,
        x: 40,
        filter: "blur(4px)",
        transition: { duration: 0.3, ease: [0.4, 0, 1, 1] },
    },
};
