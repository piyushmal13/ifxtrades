"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useId } from "react";

/* ── Types ──────────────────────────────────────────────────────── */

interface NavItem {
    href: string;
    label: string;
    icon: React.ReactNode;
}

interface NavGroup {
    label: string;
    icon: React.ReactNode;
    items: NavItem[];
}

/* ── SVG Icons (inline, no external deps) ───────────────────────── */

function IconOverview() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
    );
}
function IconUsers() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}
function IconCRM() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.7 12 19.79 19.79 0 0 1 1.64 3.52 2 2 0 0 1 3.62 1.35h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6.09 6.09l1.01-1.01a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
    );
}
function IconContent() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14,2 14,8 20,8" />
            <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10,9 9,9 8,9" />
        </svg>
    );
}
function IconCommerce() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
    );
}
function IconWebinars() {
    return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
    );
}
function IconAlgos() {
    return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
    );
}
function IconBlog() {
    return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
    );
}
function IconUniversity() {
    return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
    );
}
function IconLicense() {
    return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
    );
}
function IconChevron({ open }: { open: boolean }) {
    return (
        <svg
            width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 200ms ease" }}
        >
            <polyline points="6 9 12 15 18 9" />
        </svg>
    );
}

/* ── Navigation config ───────────────────────────────────────────── */

const NAV_GROUPS: NavGroup[] = [
    {
        label: "Overview",
        icon: <IconOverview />,
        items: [
            { href: "/admin", label: "Dashboard", icon: <IconOverview /> },
        ],
    },
    {
        label: "Users & CRM",
        icon: <IconUsers />,
        items: [
            { href: "/admin/users", label: "Users", icon: <IconUsers /> },
            { href: "/admin/crm", label: "CRM", icon: <IconCRM /> },
        ],
    },
    {
        label: "Content",
        icon: <IconContent />,
        items: [
            { href: "/admin/webinars", label: "Webinars", icon: <IconWebinars /> },
            { href: "/admin/webinar-agenda", label: "Agendas", icon: <IconWebinars /> },
            { href: "/admin/webinar-faqs", label: "FAQs", icon: <IconContent /> },
            { href: "/admin/webinar-sponsors", label: "Sponsors", icon: <IconContent /> },
            { href: "/admin/algos", label: "Algorithms", icon: <IconAlgos /> },
            { href: "/admin/algo-snapshots", label: "Algo Snapshots", icon: <IconAlgos /> },
            { href: "/admin/university", label: "University", icon: <IconUniversity /> },
            { href: "/admin/course-lessons", label: "Lessons", icon: <IconUniversity /> },
            { href: "/admin/blog", label: "Blog", icon: <IconBlog /> },
            { href: "/admin/reviews", label: "Reviews", icon: <IconBlog /> },
        ],
    },
    {
        label: "Commerce",
        icon: <IconCommerce />,
        items: [
            { href: "/admin/crm", label: "Payments & Licenses", icon: <IconLicense /> },
        ],
    },
];

/* ── AdminSidebar ────────────────────────────────────────────────── */

type AdminSidebarProps = {
    className?: string;
    onNavigate?: () => void;
};

export function AdminSidebar({ className = "", onNavigate }: AdminSidebarProps) {
    const pathname = usePathname();
    const titleId = useId();

    // Start all groups open except Commerce (collapsed by default)
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
        Overview: true,
        "Users & CRM": true,
        Content: true,
        Commerce: false,
    });

    const toggleGroup = (label: string) => {
        setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
    };

    const isActive = (href: string) => {
        if (href === "/admin") return pathname === "/admin";
        return pathname.startsWith(href);
    };

    return (
        <aside
            className={`w-[240px] min-h-screen flex-shrink-0 flex flex-col ${className}`}
            style={{
                background: "var(--color-bg-surface)",
                borderRight: "1px solid var(--color-border)",
            }}
            aria-label="Admin navigation"
        >
            {/* Brand header */}
            <div
                className="flex items-center gap-3 px-5 py-5"
                style={{ borderBottom: "1px solid var(--color-border-subtle)" }}
            >
                <Image
                    src="/logo.png"
                    alt="IFXTrades"
                    width={32}
                    height={32}
                    className="rounded-full object-contain flex-shrink-0"
                />
                <div>
                    <p
                        className="text-[10px] font-bold uppercase tracking-[0.22em]"
                        style={{ color: "var(--color-gold)" }}
                        id={titleId}
                    >
                        Admin Panel
                    </p>
                    <p className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>
                        IFXTrades Enterprise
                    </p>
                </div>
            </div>

            {/* Nav groups */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1" aria-labelledby={titleId}>
                {NAV_GROUPS.map((group) => {
                    const groupOpen = openGroups[group.label] ?? true;
                    const groupId = `admin-group-${group.label.replace(/\s+/g, "-").toLowerCase()}`;

                    return (
                        <div key={group.label}>
                            {/* Group toggle button */}
                            <button
                                onClick={() => toggleGroup(group.label)}
                                aria-expanded={groupOpen}
                                aria-controls={groupId}
                                className="w-full flex items-center justify-between px-3 py-2 rounded-md text-left transition-colors duration-150 group"
                                style={{ color: "var(--color-text-muted)" }}
                                onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLElement).style.color = "var(--color-text-primary)";
                                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLElement).style.color = "var(--color-text-muted)";
                                    (e.currentTarget as HTMLElement).style.background = "transparent";
                                }}
                            >
                                <span className="flex items-center gap-2.5">
                                    <span style={{ color: "var(--color-text-muted)" }}>{group.icon}</span>
                                    <span className="text-[11px] font-semibold uppercase tracking-[0.12em]">{group.label}</span>
                                </span>
                                <IconChevron open={groupOpen} />
                            </button>

                            {/* Group items */}
                            <div
                                id={groupId}
                                role="group"
                                aria-label={group.label}
                                style={{
                                    overflow: "hidden",
                                    maxHeight: groupOpen ? "600px" : "0px",
                                    transition: "max-height 250ms cubic-bezier(0,0,0.2,1)",
                                }}
                            >
                                <ul className="mt-1 space-y-0.5 pl-2">
                                    {group.items.map((item) => {
                                        const active = isActive(item.href);
                                        return (
                                            <li key={item.href}>
                                                <Link
                                                    href={item.href}
                                                    aria-current={active ? "page" : undefined}
                                                    onClick={() => onNavigate?.()}
                                                    className="flex items-center gap-2.5 px-3 py-2 rounded-md text-[12px] font-medium transition-all duration-150"
                                                    style={{
                                                        color: active ? "var(--color-gold)" : "var(--color-text-secondary)",
                                                        background: active ? "var(--color-gold-subtle)" : "transparent",
                                                        borderLeft: active ? "2px solid var(--color-gold)" : "2px solid transparent",
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (!active) {
                                                            (e.currentTarget as HTMLElement).style.color = "var(--color-text-primary)";
                                                            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (!active) {
                                                            (e.currentTarget as HTMLElement).style.color = "var(--color-text-secondary)";
                                                            (e.currentTarget as HTMLElement).style.background = "transparent";
                                                        }
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            color: active ? "var(--color-gold)" : "var(--color-text-muted)",
                                                            opacity: active ? 1 : 0.7,
                                                        }}
                                                    >
                                                        {item.icon}
                                                    </span>
                                                    {item.label}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </div>
                    );
                })}
            </nav>

            {/* Footer */}
            <div
                className="px-5 py-4"
                style={{ borderTop: "1px solid var(--color-border-subtle)" }}
            >
                <p className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>
                    Role:{" "}
                    <span
                        className="font-semibold uppercase tracking-wider"
                        style={{ color: "var(--color-gold)" }}
                    >
                        Admin
                    </span>
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: "var(--color-text-muted)", opacity: 0.6 }}>
                    IFXTrades © {new Date().getFullYear()}
                </p>
            </div>
        </aside>
    );
}
