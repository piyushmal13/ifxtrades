"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-provider";
import { IntelligenceOverlay } from "./ui/IntelligenceOverlay";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type LinkItem = {
  label: string;
  href: string;
};

const PRIMARY_LINKS: LinkItem[] = [
  { label: "Home", href: "/" },
  { label: "Webinars", href: "/webinars" },
  { label: "Algos", href: "/algos" },
  { label: "University", href: "/university" },
  { label: "Blog", href: "/blog" },
  { label: "Reviews", href: "/reviews" },
];

export function Navbar() {
  const pathname = usePathname();
  const { session, supabase, role } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isIntelligenceOpen, setIsIntelligenceOpen] = useState(false);
  const [latestPosts, setLatestPosts] = useState<any[]>([]);

  useEffect(() => {
    // Fetch latest posts for the HUD
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/blog/latest");
        if (!response.ok) throw new Error("Failed to fetch");
        const posts = await response.json();
        setLatestPosts(posts);
      } catch (err) {
        console.error("Failed to fetch posts for HUD:", err);
      }
    };
    fetchPosts();

    // Subscribe to real-time updates for blog_posts
    const supabaseBrowser = createSupabaseBrowserClient();
    const channel = supabaseBrowser
      .channel("blog-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "blog_posts" },
        () => {
          fetchPosts(); // Refetch on any change
        }
      )
      .subscribe();

    return () => {
      supabaseBrowser.removeChannel(channel);
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
    window.location.href = "/login";
  };

  // All hooks must run before any conditional return (Rules of Hooks)
  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  const utilityLinks = useMemo(() => {
    const links: LinkItem[] = [];
    if (session) {
      links.push({ label: "Dashboard", href: "/dashboard" });
      if (role === "admin") {
        links.push({ label: "Admin", href: "/admin" });
      } else {
        links.push({ label: "Admin Access", href: "/admin-access" });
      }
    } else {
      links.push({ label: "Login", href: "/login" });
      links.push({ label: "Signup", href: "/signup" });
    }
    return links;
  }, [session, role]);

  // Guard renders (after all hooks)
  if (pathname.startsWith("/admin")) {
    return null;
  }

  const getLinkClass = (href: string, mobile = false) => {
    const isActive = pathname === href;
    const base = "text-xs font-semibold uppercase tracking-[0.14em] transition-all duration-200 relative";
    if (mobile) {
      return `${base} block py-3 border-b border-jpm-gold/10 ${isActive
        ? "text-jpm-gold"
        : "text-white/70 hover:text-jpm-gold"
        }`;
    }
    if (isActive) {
      return `${base} text-jpm-gold`;
    }
    return scrolled
      ? `${base} text-white/80 hover:text-jpm-gold`
      : `${base} text-white/80 hover:text-jpm-gold`;
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
        ? "bg-[#020617]/90 border-b border-jpm-gold/10 backdrop-blur-xl py-2 shadow-[0_10px_40px_rgba(0,0,0,0.6)]"
        : "bg-gradient-to-b from-[#020617]/70 to-transparent py-4"
        }`}
    >
      <div className="max-w-7xl mx-auto h-14 md:h-16 px-4 md:px-8 flex items-center justify-between">
        {/* Logo — glass morphism frame */}
        <Link href="/" className="flex items-center group">
          <div className="relative w-12 h-12 md:w-14 md:h-14 bg-white rounded-lg p-1.5 
            border border-jpm-gold/20 shadow-[0_0_20px_rgba(212,175,55,0.08)] flex items-center justify-center 
            transition-all hover:border-jpm-gold/40 hover:shadow-[0_0_25px_rgba(212,175,55,0.15)]">
            <Image src="/logo.png" alt="IFXTrades" fill className="object-contain p-1.5" priority />
          </div>
        </Link>

        {/* Desktop primary links */}
        <div className="hidden md:flex items-center gap-7">
          {PRIMARY_LINKS.map((item) => (
            <Link key={item.href} href={item.href} className={getLinkClass(item.href)}>
              {item.label}
              {pathname === item.href && (
                <motion.div
                  layoutId="nav-underline"
                  className="absolute -bottom-0.5 left-0 right-0 h-px bg-jpm-gold"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          ))}
          {/* Intelligence Toggle */}
          <button
            onClick={() => setIsIntelligenceOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-jpm-gold/20 bg-jpm-gold/5 text-jpm-gold hover:bg-jpm-gold/10 transition-all group"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-jpm-gold opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-jpm-gold"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Intelligence</span>
          </button>
        </div>

        {/* Desktop utility links */}
        <div className="hidden md:flex items-center gap-4">
          {utilityLinks.map((item) =>
            item.href === "/signup" ? (
              <Link
                key={item.href}
                href={item.href}
                className="bg-gradient-to-r from-jpm-gold-dark via-jpm-gold to-jpm-gold-light text-[#020617]
                  px-5 py-2.5 rounded-sm text-xs font-bold uppercase tracking-[0.14em]
                  hover:shadow-[0_0_20px_rgba(212,175,55,0.45)] transition-all duration-300 hover:-translate-y-px"
              >
                {item.label}
              </Link>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={getLinkClass(item.href)}
              >
                {item.label}
              </Link>
            ),
          )}
          {session && (
            <button
              onClick={handleSignOut}
              className="text-xs font-semibold uppercase tracking-[0.14em] text-red-400/70 hover:text-red-400 transition-colors"
            >
              Sign Out
            </button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-white/80 hover:text-jpm-gold transition-colors"
          onClick={() => setIsOpen((s) => !s)}
          aria-label="Toggle navigation"
        >
          <motion.div animate={isOpen ? { rotate: 45 } : { rotate: 0 }} className="w-5 h-0.5 bg-current mb-1.5" />
          <motion.div animate={isOpen ? { opacity: 0 } : { opacity: 1 }} className="w-5 h-0.5 bg-current mb-1.5" />
          <motion.div animate={isOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }} className="w-5 h-0.5 bg-current" />
        </button>
      </div>

      {/* Mobile menu — dark glass */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-[#020617]/98 backdrop-blur-xl border-t border-jpm-gold/10 px-6 py-4"
          >
            {PRIMARY_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={getLinkClass(item.href, true)}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-4 pt-4 border-t border-jpm-gold/10 flex flex-col gap-3">
              {utilityLinks.map((item) =>
                item.href === "/signup" ? (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="bg-gradient-to-r from-jpm-gold-dark via-jpm-gold to-jpm-gold-light text-[#020617]
                      px-5 py-3 rounded-sm text-xs font-bold uppercase tracking-[0.14em] text-center"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={getLinkClass(item.href, true)}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                ),
              )}
              {session && (
                <button
                  onClick={handleSignOut}
                  className="text-left text-xs font-semibold uppercase tracking-[0.14em] text-red-400/70 hover:text-red-400 transition-colors py-2"
                >
                  Sign Out
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <IntelligenceOverlay
        isOpen={isIntelligenceOpen}
        onClose={() => setIsIntelligenceOpen(false)}
        latestPosts={latestPosts}
      />
    </nav >
  );
}
