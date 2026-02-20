"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-provider"
import { useState } from "react"
import Image from "next/image"

export function Navbar() {
  const pathname = usePathname()
  const { session, supabase } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const isActive = (path: string) => pathname === path ? "text-[#C6A23A] font-bold" : "text-gray-600 hover:text-[#0E1A2B]"

  const navLinks = [
    { name: "University", href: "/university" },
    { name: "Products", href: "/products" },
    { name: "Algo Arena", href: "/algos" },
    { name: "Webinars", href: "/webinars" },
    { name: "About Us", href: "/about" },
  ]

  const authLinks = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Test Strategy", href: "/test-strategy" },
    { name: "Explore", href: "/blogs" },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-sm transition-all h-20">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-12 h-12 md:w-14 md:h-14">
            <Image src="/logo.png" alt="IFX Logo" fill className="object-contain" priority />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href} className={`text-sm font-medium transition-colors duration-200 ${isActive(link.href)}`}>
              {link.name}
            </Link>
          ))}
          
          {session && (
            <>
              <div className="h-5 w-px bg-gray-300 mx-2"></div>
              {authLinks.map((link) => (
                <Link key={link.name} href={link.href} className={`text-sm font-medium transition-colors duration-200 ${isActive(link.href)}`}>
                  {link.name}
                </Link>
              ))}
            </>
          )}
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {session ? (
            <button 
              onClick={() => supabase.auth.signOut()}
              className="text-[#0E1A2B] font-medium hover:text-red-600 transition text-sm"
            >
              Sign Out
            </button>
          ) : (
            <Link href="/signup" className="inline-block bg-[#0E1A2B] text-white px-6 py-2.5 rounded-sm text-xs md:text-sm font-bold hover:bg-[#C6A23A] transition-all duration-300 shadow-md hover:shadow-lg uppercase tracking-widest border border-[#0E1A2B] hover:border-[#C6A23A]">
              Sign Up
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-[#0E1A2B] p-2">
          <span className="text-2xl">{isOpen ? "✕" : "☰"}</span>
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white/98 backdrop-blur-xl border-t border-gray-100 absolute w-full left-0 top-20 shadow-2xl py-8 px-6 flex flex-col gap-6 animate-in slide-in-from-top-5 z-40 h-screen">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href} className={`block py-2 text-lg font-medium ${isActive(link.href)}`} onClick={() => setIsOpen(false)}>
              {link.name}
            </Link>
          ))}

          {session && (
            <div className="border-t border-gray-100 pt-4 mt-2">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Member Access</p>
              {authLinks.map((link) => (
                <Link key={link.name} href={link.href} className={`block py-2 text-lg font-medium ${isActive(link.href)}`} onClick={() => setIsOpen(false)}>
                  {link.name}
                </Link>
              ))}
            </div>
          )}

          <div className="pt-6 mt-2 border-t border-gray-100">
            {session ? (
              <button onClick={() => { supabase.auth.signOut(); setIsOpen(false) }} className="block w-full text-center border border-gray-200 text-gray-600 px-5 py-4 rounded-sm font-medium hover:bg-gray-50 transition">
                Sign Out
              </button>
            ) : (
              <Link href="/signup" className="block w-full text-center bg-[#0E1A2B] text-white px-5 py-4 rounded-sm font-bold hover:bg-[#C6A23A] transition uppercase tracking-wider" onClick={() => setIsOpen(false)}>
                Sign Up
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}