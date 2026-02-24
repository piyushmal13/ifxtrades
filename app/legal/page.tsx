"use client";

import { useState } from "react";

const TABS = ["Terms of Service", "Privacy Policy", "Risk Disclosure"] as const;
type Tab = (typeof TABS)[number];

export default function LegalPage() {
    const [activeTab, setActiveTab] = useState<Tab>("Terms of Service");

    return (
        <main className="min-h-screen bg-[#020617] pt-28 pb-20 px-6 text-white">
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_0%,rgba(212,175,55,0.05),transparent)] pointer-events-none" />

            <div className="max-w-3xl mx-auto relative z-10">
                {/* Header */}
                <p className="text-[10px] uppercase tracking-[0.28em] text-jpm-gold/70 mb-2">Legal & Compliance</p>
                <h1 className="font-serif text-4xl text-white tracking-tight mb-2">Legal Documentation</h1>
                <p className="text-sm text-white/40 mb-10">
                    Last updated: 23 February 2026. All documentation is binding upon use of the IFXTrades platform.
                </p>

                {/* Tabs */}
                <div role="tablist" aria-label="Legal documents" className="flex gap-1 mb-10 p-1 bg-white/3 border border-white/8 rounded-md w-fit">
                    {TABS.map((tab) => (
                        <button
                            key={tab}
                            role="tab"
                            aria-selected={activeTab === tab}
                            aria-controls={`tabpanel-${tab.replace(/\s+/g, "-")}`}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2.5 text-[11px] uppercase tracking-[0.1em] font-semibold rounded-sm transition-all duration-[200ms] ${activeTab === tab
                                    ? "bg-jpm-gold/10 text-jpm-gold border border-jpm-gold/25"
                                    : "text-white/40 hover:text-white/70"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Tab Panels */}
                {activeTab === "Terms of Service" && (
                    <LegalDocument id="tabpanel-Terms-of-Service" labelledby="Terms of Service">
                        <LegalSection title="1. Acceptance of Terms">
                            By accessing or using IFXTrades, you agree to be bound by these Terms of Service and all applicable regulations. If you do not agree, do not use the platform.
                        </LegalSection>
                        <LegalSection title="2. Eligibility">
                            You must be at least 18 years of age and legally able to enter contracts in your jurisdiction. The platform may not be available in all jurisdictions — it is your responsibility to confirm compliance with local laws.
                        </LegalSection>
                        <LegalSection title="3. Account Responsibility">
                            You are solely responsible for maintaining the confidentiality of your credentials and for all activity under your account. Report any unauthorised access immediately.
                        </LegalSection>
                        <LegalSection title="4. Subscription and Licensing">
                            Algorithm licenses grant a non-exclusive, non-transferable right to use strategy parameters for personal trading. Redistribution or resale is strictly prohibited.
                        </LegalSection>
                        <LegalSection title="5. Intellectual Property">
                            All content, algorithms, and methodologies remain the intellectual property of IFXTrades Ltd. Unauthorised reproduction or distribution constitutes a breach of these terms.
                        </LegalSection>
                        <LegalSection title="6. Limitation of Liability">
                            To the maximum extent permitted by law, IFXTrades shall not be liable for any trading losses, indirect damages, or loss of opportunity arising from use of the platform or its content.
                        </LegalSection>
                        <LegalSection title="7. Governing Law">
                            These terms are governed by the laws of England and Wales. Disputes shall be subject to the exclusive jurisdiction of the English courts.
                        </LegalSection>
                    </LegalDocument>
                )}

                {activeTab === "Privacy Policy" && (
                    <LegalDocument id="tabpanel-Privacy-Policy" labelledby="Privacy Policy">
                        <LegalSection title="1. Data We Collect">
                            We collect information you provide at signup (name, email, country, investor classification), transactional data (licensing, registrations), and technical data (IP address, browser, pages visited).
                        </LegalSection>
                        <LegalSection title="2. How We Use Your Data">
                            Your data is used to operate platform services, provide personalised content, detect fraud, comply with legal obligations, and send communications you have opted into.
                        </LegalSection>
                        <LegalSection title="3. Data Retention">
                            We retain your data for as long as your account is active and for 7 years after closure to meet regulatory obligations.
                        </LegalSection>
                        <LegalSection title="4. No Third-Party Advertising">
                            We do not sell your personal data. We do not use third-party advertising trackers that leak PII to external parties.
                        </LegalSection>
                        <LegalSection title="5. Your Rights (GDPR)">
                            If you are located in the EEA or UK, you have the right to access, rectify, erase, and port your data. Contact privacy@ifxtrades.com to exercise these rights.
                        </LegalSection>
                        <LegalSection title="6. Cookie Policy">
                            We use strictly necessary cookies and, with your consent, analytics cookies (first-party only). You can manage your preferences via the cookie banner.
                        </LegalSection>
                    </LegalDocument>
                )}

                {activeTab === "Risk Disclosure" && (
                    <LegalDocument id="tabpanel-Risk-Disclosure" labelledby="Risk Disclosure">
                        <div className="risk-disclosure mb-8 text-sm">
                            <strong className="text-amber-400">IMPORTANT NOTICE REGARDING FINANCIAL RISK</strong>
                            <br />
                            Trading foreign exchange and other leveraged financial instruments carries a high level of risk and may not be suitable for all investors.
                        </div>
                        <LegalSection title="1. Risk of Loss">
                            The high degree of leverage can work against you as well as for you. Before deciding to trade, you should carefully consider your investment objectives, level of experience, and risk appetite.
                        </LegalSection>
                        <LegalSection title="2. Past Performance">
                            Past performance of any algorithm, strategy, or analyst commentary is not indicative of future results. All performance figures shown are historical and backtested unless explicitly stated otherwise.
                        </LegalSection>
                        <LegalSection title="3. Not Investment Advice">
                            Content on this platform is for educational and informational purposes only. Nothing on IFXTrades constitutes financial advice, a solicitation, or a recommendation to buy or sell any instrument.
                        </LegalSection>
                        <LegalSection title="4. Jurisdictional Restrictions">
                            Services may be restricted in certain jurisdictions including but not limited to the United States. Users are responsible for understanding their local regulatory environment.
                        </LegalSection>
                        <LegalSection title="5. Algorithm Risk">
                            Algorithmic strategies involve systematic risk. Technical failures, slippage, and market conditions can cause live results to materially differ from backtested performance. Deploy any algorithm with appropriate risk management controls.
                        </LegalSection>
                    </LegalDocument>
                )}

                <p className="text-[10px] text-white/25 mt-12 text-center">
                    IFXTrades Ltd · Registered in England · For legal enquiries: legal@ifxtrades.com
                </p>
            </div>
        </main>
    );
}

function LegalDocument({ id, labelledby, children }: { id: string; labelledby: string; children: React.ReactNode }) {
    return (
        <div
            id={id}
            role="tabpanel"
            aria-labelledby={labelledby}
            className="card border border-white/10 bg-white/3 p-8 space-y-6"
        >
            {children}
        </div>
    );
}

function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section>
            <h2 className="text-sm font-semibold text-white/80 mb-2 tracking-tight">{title}</h2>
            <p className="text-sm text-white/45 leading-relaxed">{children}</p>
        </section>
    );
}
