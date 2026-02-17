"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-provider"
import router from "next/dist/shared/lib/router/router"

export default function WebinarPage() {

  const { session, supabase } = useAuth()

  const [webinar, setWebinar] = useState<any>(null)
  const [speakers, setSpeakers] = useState<any[]>([])
  const [sponsors, setSponsors] = useState<any[]>([])
  const [registered, setRegistered] = useState(false)
  const [loading, setLoading] = useState(true)
  const [countdown, setCountdown] = useState("")

  useEffect(() => {
    fetchWebinar()
  }, [])

  useEffect(() => {
    if (!webinar) return

    const interval = setInterval(() => {
      const now = new Date().getTime()
      const eventTime = new Date(webinar.event_date).getTime()
      const distance = eventTime - now

      if (distance <= 0) {
        setCountdown("Live Now")
        clearInterval(interval)
        return
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24))
      const hours = Math.floor((distance / (1000 * 60 * 60)) % 24)
      const minutes = Math.floor((distance / (1000 * 60)) % 60)

      setCountdown(`${days}d ${hours}h ${minutes}m`)
    }, 60000)

    return () => clearInterval(interval)
  }, [webinar])

  const fetchWebinar = async () => {
    const { data } = await supabase
      .from("webinars")
      .select("*")
      .eq("is_active", true)
      .limit(1)

    if (!data || data.length === 0) {
      setLoading(false)
      return
    }

    const activeWebinar = data[0]
    setWebinar(activeWebinar)

    const { data: speakerData } = await supabase
      .from("webinar_speakers")
      .select("*")
      .eq("webinar_id", activeWebinar.id)

    const { data: sponsorData } = await supabase
      .from("webinar_sponsors")
      .select("*")
      .eq("webinar_id", activeWebinar.id)

    setSpeakers(speakerData || [])
    setSponsors(sponsorData || [])

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
  }

  if (loading) return <div className="p-20 text-center">Loading webinar...</div>
  if (!webinar) return <div className="p-20 text-center">No active webinar.</div>

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* ================= HERO ================= */}
      <section className="max-w-7xl mx-auto px-8 py-24 text-center">

        <div className="text-sm tracking-widest text-[#C6A23A] uppercase">
          Global Institutional Webinar
        </div>

        <h1 className="text-5xl font-bold mt-6 leading-tight">
          {webinar.title}
        </h1>

        <p className="mt-6 text-gray-600 max-w-3xl mx-auto">
          {webinar.description}
        </p>

        <div className="mt-6 text-gray-500">
          📅 {new Date(webinar.event_date).toLocaleString()}
        </div>

        <div className="mt-4 text-lg font-semibold text-[#C6A23A]">
          Starts In: {countdown}
        </div>

        <div className="mt-10">
          {registered ? (
            <div className="bg-green-50 border border-green-200 p-6 rounded-xl inline-block">
              Registration successful.
              <div className="mt-4">
                <a
                  href={webinar.zoom_link}
                  target="_blank"
                  className="text-[#C6A23A] underline font-semibold"
                >
                  Join Webinar
                </a>
              </div>
            </div>
          ) : (
            <button
              onClick={register}
              className="bg-[#C6A23A] text-white px-12 py-4 rounded-xl text-lg font-semibold shadow-xl hover:scale-105 transition"
            >
              Reserve Your Seat
            </button>
          )}
        </div>

      </section>

      {/* ================= WHY ATTEND ================= */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-8 grid md:grid-cols-3 gap-12 text-center">
          <div>
            <h3 className="font-semibold text-lg">Capital Strategy</h3>
            <p className="text-sm text-gray-600 mt-4">
              Structured deployment models aligned with macro positioning.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-lg">Algo Execution</h3>
            <p className="text-sm text-gray-600 mt-4">
              Institutional-grade execution frameworks.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-lg">Live Q&A</h3>
            <p className="text-sm text-gray-600 mt-4">
              Direct interaction with senior traders and partners.
            </p>
          </div>
        </div>
      </section>

      {/* ================= SPEAKERS ================= */}
      {speakers.length > 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-8">
            <h2 className="text-3xl font-semibold text-center mb-16">
              Featured Speakers
            </h2>
            <div className="grid md:grid-cols-3 gap-10">
              {speakers.map((s, i) => (
                <div key={i} className="bg-white border p-10 rounded-xl shadow-sm text-center">
                  <div className="h-24 w-24 bg-gray-200 rounded-full mx-auto mb-6"></div>
                  <h3 className="font-semibold">{s.name}</h3>
                  <p className="text-[#C6A23A] text-sm">{s.role}</p>
                  <p className="text-gray-600 text-sm mt-4">{s.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================= SPONSORS ================= */}
      {sponsors.length > 0 && (
        <section className="bg-gray-50 py-20 text-center">
          <h2 className="text-3xl font-semibold mb-16">
            Sponsored By
          </h2>
          <div className="grid md:grid-cols-4 gap-10 max-w-6xl mx-auto px-8">
            {sponsors.map((sp, i) => (
              <div key={i} className="h-16 bg-white border rounded-xl flex items-center justify-center shadow-sm">
                {sp.name}
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  )
}
