"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-provider"
import { useState } from "react"

export function Navbar() {
  const pathname = usePathname()
  const { session, supabase } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const isActive = (path: string) => pathname === path ? "text-jpm-gold font-semibold text-glow-gold" : "text-white/60 hover:text-white"

  const navLinks = [
    { name: "University", href: "/university" },
    { name: "Algo Arena", href: "/algos" },
    { name: "Webinars", href: "/webinars" },
    { name: "Reviews", href: "/reviews" },
    { name: "Insights", href: "/blog" },
  ]

  const authLinks = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Licenses", href: "/dashboard/licenses" },
    { name: "Courses", href: "/dashboard/courses" },
  ]

  return (
    <nav className="sticky top-0 z-50 glass-premium border-b border-white/10 shadow-2xl transition-all h-20">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="text-2xl font-serif font-bold text-white tracking-tight group">
          IFX<span className="text-jpm-gold group-hover:text-jpm-gold-light transition-colors">TRADES</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href} className={`text-[11px] uppercase tracking-[0.14em] font-medium transition-colors duration-200 ${isActive(link.href)}`}>
              {link.name}
            </Link>
          ))}

          {session && (
            <>
              <div className="h-4 w-px bg-white/10 mx-2"></div>
              {authLinks.map((link) => (
                <Link key={link.name} href={link.href} className={`text-[11px] uppercase tracking-[0.14em] font-medium transition-colors duration-200 ${isActive(link.href)}`}>
                  {link.name}
                </Link>
              ))}
            </>
          )}
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-6">
          {session ? (
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-white/60 font-medium hover:text-red-400 transition text-[11px] uppercase tracking-[0.12em]"
            >
              Sign Out
            </button>
          ) : (
            <Link href="/signup" className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-jpm-gold-dark via-jpm-gold to-jpm-gold-light rounded-sm blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
              <div className="relative bg-[#020617] text-white px-7 py-2.5 rounded-sm text-[11px] font-bold border border-jpm-gold/30 hover:border-jpm-gold uppercase tracking-widest transition-all">
                Sign Up
              </div>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-white p-2">
          <span className="text-2xl">{isOpen ? "✕" : "☰"}</span>
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#020617]/98 backdrop-blur-xl border-t border-white/10 absolute w-full left-0 top-20 shadow-2xl py-8 px-6 flex flex-col gap-5 animate-in slide-in-from-top-5">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href} className={`block py-2 text-sm uppercase tracking-[0.18em] font-medium ${isActive(link.href)}`} onClick={() => setIsOpen(false)}>
              {link.name}
            </Link>
          ))}

          {session && (
            <div className="border-t border-white/10 pt-6 mt-2">
              <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-4">Member Access</p>
              {authLinks.map((link) => (
                <Link key={link.name} href={link.href} className={`block py-2 text-sm uppercase tracking-[0.18em] font-medium ${isActive(link.href)}`} onClick={() => setIsOpen(false)}>
                  {link.name}
                </Link>
              ))}
            </div>
          )}

          <div className="pt-8 mt-2 border-t border-white/10">
            {session ? (
              <button onClick={() => { supabase.auth.signOut(); setIsOpen(false) }} className="block w-full text-center border border-white/10 text-white/60 px-5 py-4 rounded-sm text-xs font-medium hover:bg-white/5 transition uppercase tracking-widest">
                Sign Out
              </button>
            ) : (
              <Link href="/signup" className="block w-full text-center bg-gradient-to-r from-jpm-gold-dark to-jpm-gold text-[#020617] px-5 py-4 rounded-sm font-bold hover:shadow-[0_0_20px_rgba(212,175,55,0.25)] transition uppercase tracking-widest text-xs" onClick={() => setIsOpen(false)}>
                Sign Up
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
