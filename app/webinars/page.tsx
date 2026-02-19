"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-provider"
import { useRouter } from "next/navigation"

export default function WebinarPage() {

  const { session, supabase } = useAuth()
  const router = useRouter()

  const [webinar, setWebinar] = useState<any>(null)
  const [registrations, setRegistrations] = useState(0)
  const [timeLeft, setTimeLeft] = useState<any>(null)
  const [speakers, setSpeakers] = useState<any[]>([])
  const [sponsors, setSponsors] = useState<any[]>([])

  useEffect(() => {
    fetchWebinar()
  }, [])

  useEffect(() => {
    if (!webinar?.event_date) return

    const interval = setInterval(() => {
      const now = new Date().getTime()
      const target = new Date(webinar.event_date).getTime()
      const diff = target - now

      if (diff <= 0) {
        clearInterval(interval)
        return
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
      })

    }, 1000)

    return () => clearInterval(interval)

  }, [webinar])

  const fetchWebinar = async () => {

    const { data } = await supabase
      .from("webinars")
      .select("*")
      .eq("is_active", true)
      .single()

    if (!data) return

    setWebinar(data)

    const { data: regData } = await supabase
      .from("webinar_registrations")
      .select("id")
      .eq("webinar_id", data.id)

    setRegistrations(regData?.length || 0)

    const { data: speakerData } = await supabase
      .from("webinar_speakers")
      .select("*")
      .eq("webinar_id", data.id)

    const { data: sponsorData } = await supabase
      .from("webinar_sponsors")
      .select("*")
      .eq("webinar_id", data.id)

    setSpeakers(speakerData || [])
    setSponsors(sponsorData || [])
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

    fetchWebinar()
  }

  if (!webinar)
    return <div className="p-20 text-center">Loading Webinar...</div>

  const maxSeats = Number(webinar.max_seats) || 0
  const remainingSeats = maxSeats - registrations
  const progress = maxSeats > 0 ? (registrations / maxSeats) * 100 : 0

  return (
    <div className="min-h-screen bg-white">

      {/* HERO */}
      <section
        className="relative text-white py-32"
        style={{
          backgroundImage: `url(${webinar.hero_image})`,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="absolute inset-0 bg-[#0E1A2B]/80"></div>

        <div className="relative max-w-5xl mx-auto px-6 text-center">

          <h1 className="text-5xl font-serif">
            {webinar.title}
          </h1>

          <p className="mt-6 text-gray-300">
            {webinar.description}
          </p>

          {timeLeft && (
            <div className="mt-10 flex justify-center gap-10">
              <TimeBox value={timeLeft.days} label="Days" />
              <TimeBox value={timeLeft.hours} label="Hours" />
              <TimeBox value={timeLeft.minutes} label="Minutes" />
            </div>
          )}

        </div>
      </section>

      {/* SEATS */}
      <section className="py-16 text-center">

        <div className="max-w-3xl mx-auto px-6">

          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-[#C6A23A] h-4 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="mt-4 text-gray-600">
            {remainingSeats} seats remaining
          </p>

          <button
            onClick={register}
            className="mt-8 bg-[#C6A23A] text-white px-10 py-4 rounded-xl shadow-lg hover:shadow-2xl transition"
          >
            Reserve Your Seat
          </button>

        </div>

      </section>

      {/* SPEAKERS */}
      {speakers.length > 0 && (
        <section className="py-20 bg-[#F9F7F2]">

          <div className="max-w-6xl mx-auto px-6">

            <h2 className="text-3xl text-center font-serif mb-16">
              Featured Speakers
            </h2>

            <div className="grid md:grid-cols-3 gap-10">

              {speakers.map((s, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg p-8 text-center">

                  <img
                    src={s.image}
                    className="w-24 h-24 mx-auto rounded-full object-cover"
                  />

                  <h3 className="mt-6 font-semibold text-lg">
                    {s.name}
                  </h3>

                  <p className="text-[#C6A23A] text-sm">
                    {s.role}
                  </p>

                  <p className="text-gray-600 text-sm mt-4">
                    {s.bio}
                  </p>

                </div>
              ))}

            </div>

          </div>

        </section>
      )}

      {/* SPONSORS */}
      {sponsors.length > 0 && (
        <section className="py-20 text-center">

          <h2 className="text-3xl font-serif mb-16">
            Strategic Partners
          </h2>

          <div className="grid md:grid-cols-4 gap-10 max-w-6xl mx-auto px-6">

            {sponsors.map((sp, i) => (
              <div key={i} className="flex items-center justify-center">
                <img
                  src={sp.logo}
                  className="h-12 object-contain"
                />
              </div>
            ))}

          </div>

        </section>
      )}

    </div>
  )
}

function TimeBox({ value, label }: any) {
  return (
    <div>
      <div className="text-3xl font-bold text-[#C6A23A]">
        {value}
      </div>
      <div className="text-sm text-gray-400">
        {label}
      </div>
    </div>
  )
}
