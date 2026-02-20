"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-provider"
import { useState } from "react"

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

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setIsOpen(false)
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="text-2xl font-serif font-bold text-[#0E1A2B] tracking-tight">
          IFX<span className="text-[#C6A23A]">TRADES</span>
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
            <>
              <Link href="/dashboard" className="bg-[#0E1A2B] text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-[#C6A23A] transition">
                Dashboard
              </Link>
              <button onClick={handleSignOut} className="text-[#0E1A2B] font-medium hover:text-red-600 transition text-sm">
                Sign Out
              </button>
            </>
          ) : (
            <Link href="/login" className="text-[#0E1A2B] font-medium hover:text-[#C6A23A] transition">
              Login
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
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full left-0 top-20 shadow-lg py-4 px-6 flex flex-col gap-4">
          <Link href="/webinars" className={`block py-2 ${isActive("/webinars")}`} onClick={() => setIsOpen(false)}>Webinars</Link>
          <Link href="/algos" className={`block py-2 ${isActive("/algos")}`} onClick={() => setIsOpen(false)}>Algos</Link>
          <Link href="/speakers/apply" className={`block py-2 ${isActive("/speakers/apply")}`} onClick={() => setIsOpen(false)}>Speakers</Link>
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
              <>
                <Link href="/dashboard" className="block w-full text-center bg-[#0E1A2B] text-white px-5 py-3 rounded-lg font-medium hover:bg-[#C6A23A] transition" onClick={() => setIsOpen(false)}>
                  Dashboard
                </Link>
                <button onClick={handleSignOut} className="block w-full text-center border border-gray-200 text-gray-600 px-5 py-3 rounded-sm font-medium hover:bg-gray-50 transition">
                  Sign Out
                </button>
              </>
            ) : (
              <Link href="/login" className="block w-full text-center border border-[#0E1A2B] text-[#0E1A2B] px-5 py-3 rounded-lg font-medium hover:bg-gray-50 transition" onClick={() => setIsOpen(false)}>
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}