"use client"

import { useProtected } from "@/lib/useProtected"

export default function Dashboard() {

  const { session, loading } = useProtected()

  if (loading) {
    return <div className="p-20">Loading...</div>
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-white p-20">
      <h1 className="text-4xl font-semibold text-[#0F172A]">
        Welcome to Your Dashboard
      </h1>

      <p className="mt-6 text-gray-600">
        Email: {session.user.email}
      </p>
    </div>
  )
}
