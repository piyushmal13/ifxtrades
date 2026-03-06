"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-provider";
import Link from "next/link";

interface IntelligenceOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    latestPosts: any[];
}

export function IntelligenceOverlay({ isOpen, onClose, latestPosts }: IntelligenceOverlayProps) {
    const [sessions, setSessions] = useState<{ name: string; status: "open" | "closed"; color: string }[]>([]);

    useEffect(() => {
        // Basic session logic for demonstration
        const updateSessions = () => {
            const gmtHour = new Date().getUTCHours();
            setSessions([
                { name: "Tokyo", status: (gmtHour >= 0 && gmtHour < 9) ? "open" : "closed", color: "bg-emerald-400" },
                { name: "London", status: (gmtHour >= 8 && gmtHour < 17) ? "open" : "closed", color: "bg-emerald-400" },
                { name: "New York", status: (gmtHour >= 13 && gmtHour < 22) ? "open" : "closed", color: "bg-emerald-400" },
            ]);
        };
        updateSessions();
        const interval = setInterval(updateSessions, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-[#020617]/40 backdrop-blur-sm z-[100]"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full max-w-md hud-panel-glass z-[101] overflow-y-auto"
                    >
                        <div className="p-8">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h2 className="font-serif text-2xl text-white tracking-tight">Intelligence HUD</h2>
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-ifx-gold/60 mt-1">Institutional Market Monitor</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 text-white/40 hover:text-white transition-colors"
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M18 6L6 18M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Market Sessions */}
                            <section className="mb-12">
                                <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-4 font-semibold">Global Sessions</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {sessions.map((session) => (
                                        <div key={session.name} className="bg-white/5 border border-white/10 rounded-lg p-3">
                                            <p className="text-[10px] text-white/60 mb-2">{session.name}</p>
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${session.status === "open" ? session.color : "bg-white/20"} ${session.status === "open" && "animate-pulse"}`} />
                                                <span className={`text-[11px] font-bold uppercase tracking-wider ${session.status === "open" ? "text-white" : "text-white/30"}`}>
                                                    {session.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Market Monitor (Placeholder) */}
                            <section className="mb-12">
                                <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-4 font-semibold">Live Monitor</h3>
                                <div className="space-y-3">
                                    {[
                                        { pair: "EUR/USD", price: "1.0842", change: "+0.12%" },
                                        { pair: "GBP/USD", price: "1.2654", change: "-0.05%" },
                                        { pair: "USD/JPY", price: "150.24", change: "+0.22%" },
                                        { pair: "XAU/USD", price: "2024.50", change: "+0.45%" },
                                    ].map((item) => (
                                        <div key={item.pair} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-lg">
                                            <span className="text-xs font-semibold text-white/90">{item.pair}</span>
                                            <div className="text-right">
                                                <p className="text-xs text-white tabular-nums font-mono">{item.price}</p>
                                                <p className={`text-[9px] ${item.change.startsWith("+") ? "text-emerald-400" : "text-rose-400"}`}>
                                                    {item.change}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Research Feed */}
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-semibold">Intelligence Feed</h3>
                                    <Link href="/blog" className="text-[9px] uppercase tracking-widest text-ifx-gold hover:text-white transition-colors">
                                        Access Library →
                                    </Link>
                                </div>
                                <div className="space-y-4">
                                    {latestPosts.slice(0, 3).map((post) => (
                                        <Link key={post.id} href={`/blog/${post.slug}`} className="block group">
                                            <div className="p-4 bg-white/5 border border-white/5 rounded-lg transition-all border-l-2 border-l-transparent group-hover:border-l-ifx-gold group-hover:bg-white/10">
                                                <p className="text-[9px] uppercase tracking-widest text-ifx-gold mb-1">{post.category}</p>
                                                <h4 className="text-sm text-white/90 font-medium leading-snug group-hover:text-white">
                                                    {post.title}
                                                </h4>
                                                <p className="text-[10px] text-white/40 mt-2 line-clamp-2 leading-relaxed">
                                                    {post.excerpt}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>

                            {/* System Health */}
                            <div className="mt-12 pt-8 border-t border-white/10">
                                <div className="flex items-center justify-between text-[9px] uppercase tracking-widest text-white/30">
                                    <div className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        Feed Integrity: Optimized
                                    </div>
                                    <div>Latency: 14ms</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
