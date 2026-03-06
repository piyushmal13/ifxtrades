"use client";

import { useState } from "react";
import type { Metadata } from "next";

const FAQS = [
    {
        q: "How do I verify my account for institutional access?",
        a: "After signup, navigate to Account Settings and complete the verification flow. Professional and Institutional tiers require identity verification (KYC) and may take 1–2 business days.",
    },
    {
        q: "What does an algorithm license include?",
        a: "Each license grants 12 months of access to the strategy parameters, entry/exit signals, and a backtested performance report. Performance is historical and is not indicative of future results.",
    },
    {
        q: "Are webinars recorded and available after the live session?",
        a: "Yes. Registered attendees receive access to the recording for 30 days after the live session date.",
    },
    {
        q: "What is required to trade with these strategies?",
        a: "You need a compatible broker account and sufficient capital to meet the minimum position sizes. IFXTrades does not provide direct market access or act as a broker.",
    },
    {
        q: "How do I cancel my subscription or license?",
        a: "Visit Account Settings > Billing. Licenses run for their full term and are non-refundable. Subscription cancellations take effect at the end of the current billing period.",
    },
    {
        q: "Is my financial data secure?",
        a: "All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We do not store payment card data — all billing is handled by our PCI-DSS compliant payment processor.",
    },
];

export default function HelpPage() {
    const [open, setOpen] = useState<number | null>(null);

    return (
        <main className="min-h-screen bg-[#020617] pt-28 pb-20 px-6 text-white">
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_0%,rgba(212,175,55,0.05),transparent)] pointer-events-none" />

            <div className="max-w-3xl mx-auto relative z-10">
                <p className="text-[10px] uppercase tracking-[0.28em] text-ifx-gold/70 mb-2">Support</p>
                <h1 className="font-serif text-4xl text-white tracking-tight mb-2">Help Centre</h1>
                <p className="text-sm text-white/40 max-w-lg mb-14">
                    Answers to common questions about accounts, licensing, webinars, and platform security.
                </p>

                {/* FAQ Accordion */}
                <section aria-label="Frequently asked questions" className="mb-16">
                    <h2 className="text-xs uppercase tracking-[0.2em] text-ifx-gold mb-6">Frequently Asked Questions</h2>
                    <div className="divide-y divide-white/8">
                        {FAQS.map((faq, i) => (
                            <div key={i} className="accordion-item">
                                <button
                                    className="accordion-trigger"
                                    aria-expanded={open === i}
                                    aria-controls={`faq-body-${i}`}
                                    onClick={() => setOpen(open === i ? null : i)}
                                >
                                    <span>{faq.q}</span>
                                    <svg
                                        width="16" height="16" fill="none" viewBox="0 0 24 24"
                                        stroke="currentColor" strokeWidth={2}
                                        className={`shrink-0 ml-4 transition-transform duration-[200ms] ${open === i ? "rotate-180" : ""}`}
                                        aria-hidden="true"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                <div
                                    id={`faq-body-${i}`}
                                    role="region"
                                    aria-labelledby={`faq-trigger-${i}`}
                                    hidden={open !== i}
                                    className="pb-5 text-sm text-white/55 leading-relaxed"
                                >
                                    {faq.a}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Contact section */}
                <section aria-labelledby="contact-heading" className="card border border-white/10 bg-white/3 p-8">
                    <h2 id="contact-heading" className="text-xs uppercase tracking-[0.2em] text-ifx-gold mb-2">
                        Still Need Help?
                    </h2>
                    <p className="text-sm text-white/45 mb-6 leading-relaxed">
                        Our support team handles institutional enquiries within one business day. Please describe your issue clearly and include your account email.
                    </p>
                    <form
                        onSubmit={(e) => { e.preventDefault(); alert("Message sent (demo)."); }}
                        className="space-y-4"
                    >
                        <div>
                            <label htmlFor="contact-email" className="field-label mb-2 block">Email Address</label>
                            <input id="contact-email" type="email" required autoComplete="email" placeholder="you@institution.com" className="input-base" />
                        </div>
                        <div>
                            <label htmlFor="contact-subject" className="field-label mb-2 block">Subject</label>
                            <input id="contact-subject" type="text" required placeholder="Brief description of your issue" className="input-base" />
                        </div>
                        <div>
                            <label htmlFor="contact-message" className="field-label mb-2 block">Message</label>
                            <textarea
                                id="contact-message" required rows={5}
                                placeholder="Please include your account email and any relevant details…"
                                className="input-base resize-none"
                            />
                        </div>
                        <button type="submit" className="btn-base btn-md btn-primary">
                            Send Message
                        </button>
                    </form>
                </section>
            </div>
        </main>
    );
}
