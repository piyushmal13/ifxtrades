"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-provider"
import { useRouter } from "next/navigation"

export default function WebinarPage() {

  const { session, supabase } = useAuth()
  const router = useRouter()

  const [webinar, setWebinar] = useState<any>(null)
  const [registrations, setRegistrations] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [registered, setRegistered] = useState(false)

  useEffect(() => {
    fetchWebinar()
  }, [])

  const fetchWebinar = async () => {

    const { data: webinarData, error } = await supabase
      .from("webinars")
      .select("*")
      .eq("is_active", true)
      .single()

    if (!webinarData) {
      setLoading(false)
      return
    }

    setWebinar(webinarData)

    // Fetch registrations manually (more reliable)
    const { data: registrationData } = await supabase
      .from("webinar_registrations")
      .select("id")
      .eq("webinar_id", webinarData.id)

    const totalRegistrations = registrationData?.length || 0
    setRegistrations(totalRegistrations)

    console.log("Seat Limit:", webinarData.seat_limit)
    console.log("Registrations:", totalRegistrations)

    // Check if current user already registered
    if (session) {
      const { data: existing } = await supabase
        .from("webinar_registrations")
        .select("id")
        .eq("webinar_id", webinarData.id)
        .eq("user_id", session.user.id)
        .single()

      if (existing) {
        setRegistered(true)
      }
    }

    setLoading(false)
  }

  const register = async () => {

    if (!session) {
      router.push("/login?redirect=/webinars")
      return
    }

    await supabase.from("webinar_registrations").insert({
      webinar_id: webinar.id,
      user_id: session.user.id,
      email: session.user.email
    })

    setRegistered(true)
    setRegistrations(prev => prev + 1)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading Webinar...
      </div>
    )
  }

  if (!webinar) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        No Active Webinar Found
      </div>
    )
  }

  const seatLimit = webinar.seat_limit ?? 0
  const remainingSeats = Math.max(seatLimit - registrations, 0)

  return (
    <div className="min-h-screen bg-white">

      {/* HERO SECTION */}
      <section className="bg-[#0B1C2D] text-white py-28 text-center relative">

        <h1 className="text-5xl font-semibold tracking-tight">
          {webinar.title}
        </h1>

        <p className="mt-6 text-lg text-gray-300 max-w-3xl mx-auto">
          {webinar.description}
        </p>

        <div className="mt-6 text-sm text-gray-400">
          {new Date(webinar.event_date).toLocaleString()}
        </div>

        <div className="mt-6 text-yellow-400 font-semibold text-lg">
          {remainingSeats} Seats Remaining
        </div>

        <div className="mt-10">
          {registered ? (
            <div className="bg-green-600 px-8 py-4 rounded-xl inline-block">
              Registered Successfully
              <div className="mt-3">
                <a
                  href={webinar.zoom_link}
                  target="_blank"
                  className="underline text-white"
                >
                  Join Webinar
                </a>
              </div>
            </div>
          ) : (
            <button
              onClick={register}
              className="bg-[#C6A23A] hover:bg-[#b8932f] transition px-12 py-4 rounded-xl text-white font-semibold"
            >
              Reserve Your Seat
            </button>
          )}
        </div>

      </section>

      {/* ABOUT SECTION */}
      <section className="py-20 max-w-6xl mx-auto px-8 text-center">
        <h2 className="text-3xl font-semibold text-[#0B1C2D]">
          About This Webinar
        </h2>
        <p className="mt-6 text-gray-600 max-w-3xl mx-auto">
          Executive-level capital structuring, algorithmic deployment,
          broker partnerships and institutional risk frameworks.
        </p>
      </section>

    </div>
  )
}
