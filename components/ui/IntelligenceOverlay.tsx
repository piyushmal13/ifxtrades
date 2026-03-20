"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  body?: string;
  category: string;
}

interface IntelligenceOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  latestPosts: Post[];
}

interface MarketSession {
  name: string;
  status: "open" | "closed";
  timezone: string;
}

interface MarketPair {
  pair: string;
  price: string;
  change: string;
  positive: boolean;
}

const STATIC_PAIRS: MarketPair[] = [
  { pair: "EUR/USD", price: "1.0842", change: "+0.12%", positive: true },
  { pair: "GBP/USD", price: "1.2654", change: "-0.05%", positive: false },
  { pair: "USD/JPY", price: "150.24", change: "+0.22%", positive: true },
  { pair: "XAU/USD", price: "3,021.50", change: "+0.45%", positive: true },
  { pair: "USD/CHF", price: "0.8892", change: "-0.08%", positive: false },
  { pair: "AUD/USD", price: "0.6541", change: "+0.15%", positive: true },
];

export function IntelligenceOverlay({ isOpen, onClose, latestPosts }: IntelligenceOverlayProps) {
  const [sessions, setSessions] = useState<MarketSession[]>([]);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateSessions = () => {
      const now = new Date();
      const gmtHour = now.getUTCHours();
      const gmtMin = now.getUTCMinutes();
      const totalMins = gmtHour * 60 + gmtMin;

      setSessions([
        {
          name: "Sydney",
          status: (totalMins >= 22 * 60 || totalMins < 7 * 60) ? "open" : "closed",
          timezone: "AEST",
        },
        {
          name: "Tokyo",
          status: (totalMins >= 0 && totalMins < 9 * 60) || (totalMins >= 23 * 60) ? "open" : "closed",
          timezone: "JST",
        },
        {
          name: "London",
          status: (totalMins >= 8 * 60 && totalMins < 17 * 60) ? "open" : "closed",
          timezone: "GMT",
        },
        {
          name: "New York",
          status: (totalMins >= 13 * 60 && totalMins < 22 * 60) ? "open" : "closed",
          timezone: "EST",
        },
      ]);

      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
          timeZone: "UTC",
        }) + " UTC"
      );
    };

    updateSessions();
    const interval = setInterval(updateSessions, 1000);
    return () => clearInterval(interval);
  }, []);

  const openCount = sessions.filter((s) => s.status === "open").length;

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
            className="fixed inset-0 z-[100]"
            style={{ background: "rgba(2, 6, 23, 0.6)", backdropFilter: "blur(4px)" }}
          />

          {/* Panel */}
          <motion.aside
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="fixed top-0 right-0 h-full w-full max-w-[420px] z-[101] overflow-y-auto"
            style={{
              background: "rgba(8, 12, 20, 0.97)",
              borderLeft: "1px solid rgba(201,168,76,0.2)",
              boxShadow: "-24px 0 64px rgba(0,0,0,0.8), inset 1px 0 0 rgba(201,168,76,0.08)",
              backdropFilter: "blur(40px)",
            }}
          >
            {/* Header */}
            <div
              className="sticky top-0 z-10 px-8 pt-8 pb-6"
              style={{
                background: "rgba(8,12,20,0.95)",
                borderBottom: "1px solid rgba(201,168,76,0.1)",
                backdropFilter: "blur(20px)",
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.3em] mb-1" style={{ color: "var(--color-gold)" }}>
                    IFXTrades
                  </p>
                  <h2
                    className="text-2xl font-bold tracking-tight"
                    style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}
                  >
                    Intelligence HUD
                  </h2>
                  <p className="text-[10px] mt-1 font-mono" style={{ color: "var(--color-text-muted)" }}>
                    {currentTime}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg transition-all duration-200 mt-1"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.9)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
                  aria-label="Close panel"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="px-8 py-6 space-y-8">
              {/* Global Sessions */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[9px] uppercase tracking-[0.25em] font-semibold" style={{ color: "rgba(255,255,255,0.3)" }}>
                    Global Sessions
                  </p>
                  <span
                    className="text-[9px] font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: openCount > 0 ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.05)",
                      color: openCount > 0 ? "#22c55e" : "rgba(255,255,255,0.3)",
                      border: `1px solid ${openCount > 0 ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.08)"}`,
                    }}
                  >
                    {openCount} ACTIVE
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {sessions.map((session) => (
                    <div
                      key={session.name}
                      className="rounded-lg p-3 transition-all duration-200"
                      style={{
                        background: session.status === "open" ? "rgba(34,197,94,0.05)" : "rgba(255,255,255,0.03)",
                        border: `1px solid ${session.status === "open" ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.06)"}`,
                      }}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-semibold" style={{ color: "rgba(255,255,255,0.7)" }}>
                          {session.name}
                        </span>
                        <span className="text-[8px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                          {session.timezone}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            background: session.status === "open" ? "#22c55e" : "rgba(255,255,255,0.2)",
                            boxShadow: session.status === "open" ? "0 0 6px rgba(34,197,94,0.8)" : "none",
                            animation: session.status === "open" ? "pulse 2s infinite" : "none",
                          }}
                        />
                        <span
                          className="text-[9px] font-bold uppercase tracking-wider"
                          style={{ color: session.status === "open" ? "#22c55e" : "rgba(255,255,255,0.25)" }}
                        >
                          {session.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Live Monitor */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[9px] uppercase tracking-[0.25em] font-semibold" style={{ color: "rgba(255,255,255,0.3)" }}>
                    Market Monitor
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" style={{ animation: "pulse 2s infinite" }} />
                    <span className="text-[8px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>
                      Indicative
                    </span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {STATIC_PAIRS.map((item) => (
                    <div
                      key={item.pair}
                      className="flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-150"
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.04)",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLDivElement).style.background = "rgba(201,168,76,0.05)";
                        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(201,168,76,0.1)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.02)";
                        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.04)";
                      }}
                    >
                      <span className="text-xs font-bold tracking-wide" style={{ color: "rgba(255,255,255,0.85)" }}>
                        {item.pair}
                      </span>
                      <div className="text-right">
                        <p className="text-xs tabular-nums font-mono font-semibold" style={{ color: "rgba(255,255,255,0.9)" }}>
                          {item.price}
                        </p>
                        <p
                          className="text-[9px] tabular-nums font-mono"
                          style={{ color: item.positive ? "#22c55e" : "#ef4444" }}
                        >
                          {item.change}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Intelligence Feed */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[9px] uppercase tracking-[0.25em] font-semibold" style={{ color: "rgba(255,255,255,0.3)" }}>
                    Intelligence Feed
                  </p>
                  <Link
                    href="/blog"
                    className="text-[9px] uppercase tracking-widest transition-colors duration-150"
                    style={{ color: "var(--color-gold)" }}
                    onClick={onClose}
                  >
                    View All →
                  </Link>
                </div>

                {latestPosts.length === 0 ? (
                  <div className="rounded-lg p-6 text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>Intelligence feed loading…</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {latestPosts.slice(0, 4).map((post) => (
                      <Link key={post.id} href={`/blog/${post.slug}`} onClick={onClose} className="block group">
                        <div
                          className="p-4 rounded-lg transition-all duration-200"
                          style={{
                            background: "rgba(255,255,255,0.02)",
                            border: "1px solid rgba(255,255,255,0.05)",
                            borderLeft: "2px solid transparent",
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLDivElement).style.borderLeftColor = "var(--color-gold)";
                            (e.currentTarget as HTMLDivElement).style.background = "rgba(201,168,76,0.04)";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLDivElement).style.borderLeftColor = "transparent";
                            (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.02)";
                          }}
                        >
                          <p className="text-[8px] uppercase tracking-[0.2em] mb-1" style={{ color: "var(--color-gold)" }}>
                            {post.category}
                          </p>
                          <h4
                            className="text-sm leading-snug font-medium transition-colors duration-150"
                            style={{ color: "rgba(255,255,255,0.85)" }}
                          >
                            {post.title}
                          </h4>
                          {post.excerpt && (
                            <p className="text-[10px] mt-1.5 leading-relaxed line-clamp-2" style={{ color: "rgba(255,255,255,0.35)" }}>
                              {post.excerpt}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>

              {/* IFX Algos Promo */}
              <section>
                <Link
                  href="/algos"
                  onClick={onClose}
                  className="block rounded-xl p-5 transition-all duration-200 group"
                  style={{
                    background: "linear-gradient(135deg, rgba(201,168,76,0.08), rgba(201,168,76,0.03))",
                    border: "1px solid rgba(201,168,76,0.2)",
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(201,168,76,0.4)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(201,168,76,0.2)")}
                >
                  <p className="text-[8px] uppercase tracking-[0.25em] mb-2" style={{ color: "var(--color-gold)" }}>
                    IFXTrades Algorithms
                  </p>
                  <h3
                    className="text-base font-bold mb-1"
                    style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-playfair), serif" }}
                  >
                    Institutional-Grade Algos
                  </h3>
                  <p className="text-[10px] leading-relaxed mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>
                    Battle-tested algorithms for Gold, Forex &amp; CFDs. Affordable. Profitable.
                  </p>
                  <span
                    className="text-[10px] font-semibold uppercase tracking-widest"
                    style={{ color: "var(--color-gold)" }}
                  >
                    Browse Algorithms →
                  </span>
                </Link>
              </section>

              {/* System Footer */}
              <div className="pt-4 pb-2" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" style={{ boxShadow: "0 0 6px rgba(34,197,94,0.8)" }} />
                    <span className="text-[8px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.2)" }}>
                      Systems Operational
                    </span>
                  </div>
                  <span className="text-[8px] font-mono" style={{ color: "rgba(255,255,255,0.15)" }}>
                    IFX v2.0
                  </span>
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
