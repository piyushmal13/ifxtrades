"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-provider";

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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const utilityLinks = useMemo(() => {
    const links: LinkItem[] = [];
    if (session) {
      links.push({ label: "Dashboard", href: "/dashboard" });
      if (role === "admin") {
        links.push({ label: "Admin", href: "/admin" });
      }
    } else {
      links.push({ label: "Login", href: "/login" });
      links.push({ label: "Signup", href: "/signup" });
    }
    return links;
  }, [session, role]);

  const getLinkClass = (href: string, mobile = false) => {
    const isActive = pathname === href;
    const base = "text-xs font-semibold uppercase tracking-[0.14em] transition-colors";
    if (mobile) {
      return `${base} block py-3 ${
        isActive ? "text-jpm-gold" : "text-jpm-navy hover:text-jpm-gold"
      }`;
    }
    if (isActive) {
      return `${base} text-jpm-gold`;
    }
    return scrolled
      ? `${base} text-jpm-navy hover:text-jpm-gold`
      : `${base} text-white hover:text-jpm-gold`;
  };

  const utilityClass = scrolled
    ? "text-xs font-semibold uppercase tracking-[0.14em] text-jpm-navy hover:text-jpm-gold transition-colors"
    : "text-xs font-semibold uppercase tracking-[0.14em] text-white hover:text-jpm-gold transition-colors";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-jpm-cream/95 border-b border-jpm-border backdrop-blur-md py-2 shadow-jpm"
          : "bg-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto h-14 md:h-16 px-4 md:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative w-9 h-9 md:w-10 md:h-10">
            <Image src="/logo.png" alt="IFXTrades Logo" fill className="object-contain" priority />
          </div>
          <span
            className={`font-serif text-lg font-bold tracking-tight ${
              scrolled ? "text-jpm-navy" : "text-white"
            }`}
          >
            IFX<span className="text-jpm-gold">Trades</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {PRIMARY_LINKS.map((item) => (
            <Link key={item.href} href={item.href} className={getLinkClass(item.href)}>
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          {utilityLinks.map((item) =>
            item.href === "/signup" ? (
              <Link
                key={item.href}
                href={item.href}
                className="bg-jpm-navy text-white px-5 py-2.5 rounded-sm text-xs font-semibold uppercase tracking-[0.14em] hover:bg-jpm-navy-light transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={utilityClass}
              >
                {item.label}
              </Link>
            ),
          )}
          {session && (
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-xs font-semibold uppercase tracking-[0.14em] text-red-700 hover:text-red-800 transition-colors"
            >
              Sign Out
            </button>
          )}
        </div>

        <button
          className={`md:hidden p-2 ${scrolled ? "text-jpm-navy" : "text-white"}`}
          onClick={() => setIsOpen((state) => !state)}
          aria-label="Toggle navigation"
        >
          {isOpen ? "X" : "="}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="md:hidden bg-white border-t border-jpm-border shadow-jpm-md px-6 py-4"
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
            {utilityLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={getLinkClass(item.href, true)}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {session && (
              <button
                onClick={() => {
                  supabase.auth.signOut();
                  setIsOpen(false);
                }}
                className="mt-3 w-full text-left text-xs font-semibold uppercase tracking-[0.14em] text-red-700 hover:text-red-800 transition-colors"
              >
                Sign Out
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
