"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { StatusIndicator } from "@/components/ui/StatusIndicator";

const PLATFORM_LINKS = [
    { href: "/webinars", label: "Webinars" },
    { href: "/algos", label: "Algo Licensing" },
    { href: "/university", label: "University" },
    { href: "/blog", label: "Research Stream" },
    { href: "/reviews", label: "Reviews" },
];

const ACCOUNT_LINKS = [
    { href: "/dashboard", label: "User Dashboard" },
    { href: "/login", label: "Member Login" },
    { href: "/signup", label: "Request Access" },
    { href: "/settings", label: "Account Settings" },
];

const LEGAL_LINKS = [
    { href: "/legal", label: "Terms & Conditions" },
    { href: "/legal#privacy", label: "Privacy Policy" },
    { href: "/legal#risk", label: "Risk Disclosure" },
    { href: "/help", label: "Help Centre" },
];

const TRUST_ITEMS = [
    { icon: "🔒", label: "256-bit SSL" },
    { icon: "🛡️", label: "ISO 27001" },
    { icon: "✅", label: "KYC/AML Compliant" },
    { icon: "📋", label: "Audit Logs" },
];

function FooterLink({ href, label }: { href: string; label: string }) {
    return (
        <li>
            <Link
                href={href}
                className="text-sm text-white/55 hover:text-jpm-gold transition-colors duration-[200ms]"
            >
                {label}
            </Link>
        </li>
    );
}

function FooterSection({ title, links }: { title: string; links: { href: string; label: string }[] }) {
    return (
        <nav aria-label={title}>
            <p className="text-[10px] uppercase tracking-[0.22em] text-jpm-gold mb-6">{title}</p>
            <ul className="space-y-3.5">
                {links.map((link) => (
                    <FooterLink key={link.href} {...link} />
                ))}
            </ul>
        </nav>
    );
}

export function Footer() {
    const pathname = usePathname();

    if (pathname.startsWith("/admin")) {
        return null;
    }

    return (
        <footer
            role="contentinfo"
            className="border-t border-white/8 bg-[#020617] px-6 pt-16 pb-8"
        >
            {/* Trust / security bar */}
            <div className="max-w-7xl mx-auto mb-14">
                <div className="trust-bar rounded-md px-6">
                    <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
                        {TRUST_ITEMS.map((item) => (
                            <div key={item.label} className="trust-item">
                                <span className="text-base" aria-hidden="true">{item.icon}</span>
                                <span>{item.label}</span>
                            </div>
                        ))}
                        <div className="hidden md:block h-4 w-px bg-white/10" />
                        <StatusIndicator status="operational" showLabel />
                    </div>
                </div>
            </div>

            {/* Main columns */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-12">
                {/* Brand column (2 cols) */}
                <div className="col-span-1 md:col-span-2">
                    <Link href="/" className="inline-flex items-center mb-5">
                        <div className="relative w-10 h-10 backdrop-blur-md bg-black/40 rounded-lg p-1 border border-jpm-gold/20 flex items-center justify-center">
                            <Image src="/logo.png" alt="IFXTrades" width={32} height={32} className="object-contain" />
                        </div>
                    </Link>
                    <p className="text-sm text-white/50 max-w-xs leading-relaxed mb-5">
                        Institutional capital intelligence platform providing macro research, executable strategies, and structured education for sophisticated investors.
                    </p>

                    {/* Risk disclosure */}
                    <div className="risk-disclosure text-[10px]">
                        <span className="font-semibold text-amber-400 uppercase tracking-[0.08em]">Risk Notice · </span>
                        Trading foreign exchange on margin carries a high level of risk and may not be suitable for all investors. Past performance is not indicative of future results. Capital at risk.
                    </div>
                </div>

                {/* Link columns */}
                <FooterSection title="Platform" links={PLATFORM_LINKS} />
                <FooterSection title="Account" links={ACCOUNT_LINKS} />
                <FooterSection title="Legal" links={LEGAL_LINKS} />
            </div>

            {/* Bottom bar */}
            <div className="max-w-7xl mx-auto mt-14 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-3 text-[10px] text-white/25 uppercase tracking-[0.18em]">
                <span>© 2026 IFXTrades. All rights reserved.</span>
                <div className="flex items-center gap-6">
                    <Link href="/legal" className="hover:text-white/50 transition-colors">Privacy</Link>
                    <Link href="/legal#risk" className="hover:text-white/50 transition-colors">Risk Disclosure</Link>
                    <Link href="/help" className="hover:text-white/50 transition-colors">Support</Link>
                </div>
                <span className="text-jpm-gold/25">Institutional Capital Intelligence Platform</span>
            </div>
        </footer>
    );
}
