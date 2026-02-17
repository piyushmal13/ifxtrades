"use client"

import Link from "next/link"
import { useAuth } from "@/lib/auth-provider"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"

export default function Header() {

  const { session, supabase } = useAuth()
  const [role, setRole] = useState<string | null>(null)
  const [dark, setDark] = useState(false)
  const [lang, setLang] = useState("EN")

  useEffect(() => {
    if (!session) return

    supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single()
      .then(({ data }) => {
        if (data) setRole(data.role)
      })
  }, [session])

  const toggleTheme = () => {
    setDark(!dark)
    document.body.classList.toggle("dark")
  }

  const logout = async () => {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-200">

      <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">

        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2">
          <motion.img
            src="/logo.png"
            alt="IFXTrades"
            className="h-10 w-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
        </Link>

        {/* NAV */}
        <nav className="flex items-center gap-8 text-sm font-medium">

          <Link href="/webinars" className="hover:text-[#C6A23A] transition">
            Webinars
          </Link>

          {session && (
            <Link href="/dashboard" className="hover:text-[#C6A23A] transition">
              Dashboard
            </Link>
          )}

          {role === "admin" && (
            <Link href="/admin" className="text-[#C6A23A]">
              Admin
            </Link>
          )}

          {/* Language */}
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="border rounded-md px-2 py-1 text-xs"
          >
            <option>EN</option>
            <option>TH</option>
            <option>VN</option>
            <option>RU</option>
            <option>AR</option>
          </select>

          {/* Theme */}
          <button
            onClick={toggleTheme}
            className="w-12 h-6 rounded-full bg-gray-300 relative transition"
          >
            <div
              className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-[#C6A23A] transition ${
                dark ? "translate-x-6" : ""
              }`}
            />
          </button>

          {session ? (
            <button
              onClick={logout}
              className="bg-black text-white px-4 py-2 rounded-md"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/login"
              className="bg-[#C6A23A] text-white px-4 py-2 rounded-md"
            >
              Login
            </Link>
          )}

        </nav>

      </div>
    </header>
  )
}
